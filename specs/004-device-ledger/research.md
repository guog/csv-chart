# Research: Device Ledger CRUD API 技术选型

**Date**: 2026-03-02  
**Scope**: Express 4 + Prisma 6 + TypeScript + SQLite, Vue 3 + Element Plus  
**Context**: 现有代码库分析 — `apps/server/src/routes/examples.ts`, `apps/server/prisma/schema.prisma`, `apps/web/`

---

## 1. Prisma 分页模式 (Pagination Pattern)

### Decision: **使用 offset 分页 (`skip` / `take`)**

### Rationale

| 维度        | Offset 分页                                                                      | Cursor 分页                                        |
| ----------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| 实现复杂度  | 低 — `skip` + `take` 直接映射 Element Plus 分页组件的 `currentPage` / `pageSize` | 高 — 需要额外维护 cursor 状态、编码/解码 cursor 值 |
| 前端适配    | `el-pagination` 天然支持页码跳转                                                 | 需要自定义"加载更多"或重写分页逻辑                 |
| 数据规模    | 10,000 条记录，offset 性能完全可接受（SQLite 全在本地，无网络开销）              | Cursor 分页在百万级数据或分布式场景才有明显优势    |
| 随机跳页    | ✅ 支持跳转到任意页                                                              | ❌ 只能向前/向后遍历                               |
| SQLite 适配 | SQLite 的 `LIMIT ... OFFSET ...` 效率在万级数据下表现良好                        | 同样支持，但收益不明显                             |

### 实现模式

```typescript
// GET /api/devices?page=1&pageSize=20&search=xxx
const page = Math.max(1, parseInt(req.query.page as string) || 1)
const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20))
const skip = (page - 1) * pageSize

const [devices, total] = await Promise.all([
  prisma.device.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    where: whereClause,
  }),
  prisma.device.count({ where: whereClause }),
])

res.json({ data: devices, total, page, pageSize })
```

### Alternatives Considered

- **Cursor-based (Prisma `cursor`)**: 适合无限滚动或实时数据流场景。对于 10,000 条设备记录的表格式管理界面，增加了不必要的复杂度。
- **KeySet pagination**: 性能最好但实现最复杂，需要复合排序键，规模不需要。

---

## 2. 搜索/过滤模式 (Search/Filter Pattern)

### Decision: **使用 Prisma `contains` 模式匹配 + `OR` 组合查询**

### Rationale

- SQLite 不支持 PostgreSQL 的 `@@` 全文搜索或 `ILIKE`。
- Prisma 6 对 SQLite 的 `contains` 会生成 `LIKE '%keyword%'` SQL，在万级数据下性能可接受。
- SQLite 的 `LIKE` 默认对 ASCII 字符大小写不敏感，但对 Unicode/中文字符不受影响（中文本身不存在大小写问题）。
- 避免引入 SQLite FTS5 扩展，减少复杂度，保持 Prisma 统一查询层。

### 实现模式

```typescript
// 构建 where 条件
const search = (req.query.search as string)?.trim()
const status = req.query.status as string | undefined

const where: Prisma.DeviceWhereInput = {
  ...(search && {
    OR: [{ name: { contains: search } }, { serialNumber: { contains: search } }],
  }),
  ...(status && { status }),
}
```

### 关于大小写敏感性

SQLite + Prisma 的 `contains` 在 `mode: 'insensitive'` 设置上不如 PostgreSQL 完善。但因为：

- 设备名称 / 序列号以中文或大写英文编号为主
- 10,000 条记录扫描代价极低
- 不建议使用 `mode: 'insensitive'`（Prisma SQLite 驱动不一定支持）

实际上 SQLite 对 ASCII 的 `LIKE` 操作是大小写不敏感的; 对于非 ASCII 则按原样匹配。这对设备台账场景完全足够。

### Alternatives Considered

- **SQLite FTS5 虚拟表**: 全文搜索性能卓越，但需要直接执行 raw SQL（`prisma.$queryRaw`），绕过类型安全，且需要维护同步触发器。10,000 条记录不值得这种复杂度。
- **应用层过滤 (全加载后 JS filter)**: 数据量小时可行，但违反分页设计原则，不可扩展。
- **第三方搜索引擎 (Meilisearch/Algolia)**: 大炮打蚊子，MVP 完全不需要。

---

## 3. 唯一约束违反处理 (Unique Constraint Violation)

### Decision: **数据库层唯一约束 + Prisma 错误码检测 (`P2002`) + HTTP 409 Conflict**

### Rationale

- Prisma 对唯一约束违反抛出 `PrismaClientKnownRequestError`，错误码为 `P2002`。
- 数据库层约束是最终安全网，无论应用层如何变化都能保证数据完整性。
- HTTP 409 (Conflict) 语义上最准确："请求与现有资源冲突"。
- 错误响应中应明确指出冲突字段，方便前端定位。

### 实现模式

```typescript
import { Prisma } from '@prisma/client'

try {
  const device = await prisma.device.create({ data: { ... } })
  res.status(201).json({ data: device })
} catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    // error.meta?.target 包含冲突字段名，如 ['serialNumber']
    const fields = (error.meta?.target as string[]) || []
    return res.status(409).json({
      error: `${fields.join(', ')} 已存在`,
      code: 'DUPLICATE_ENTRY',
      fields,
    })
  }
  console.error('创建设备失败:', error)
  res.status(500).json({ error: '服务器内部错误' })
}
```

### 关于 "先查后写" vs "直接写 + 捕获异常"

| 方式                               | 优点                       | 缺点                             |
| ---------------------------------- | -------------------------- | -------------------------------- |
| 先查后写 (`findUnique` → `create`) | 可在创建前给出友好提示     | 存在 TOCTOU 竞态条件；多一次查询 |
| 直接写 + 捕获 `P2002`              | 原子操作，无竞态；单次查询 | 需要解析异常                     |

**选择直接写 + 捕获**，因为数据库约束是唯一可信的仲裁者。在更新场景（`update`）中同样适用。

### Alternatives Considered

- **HTTP 400 Bad Request**: 语义不够精确，400 通常指请求格式错误而非数据冲突。
- **HTTP 422 Unprocessable Entity**: 可以使用，但 409 更明确表达"与已有资源冲突"。
- **先查后写**: 如上表所述，存在竞态缺陷，不推荐作为唯一手段。

---

## 4. Express 请求验证 (Request Validation)

### Decision: **使用手动验证，与现有代码模式保持一致**

### Rationale

**现有模式分析** — [apps/server/src/routes/examples.ts](../../apps/server/src/routes/examples.ts) 中的做法：

```typescript
// 现有的验证方式：手动检查
if (!name || typeof name !== 'string') {
  return res.status(400).json({ error: 'name 字段是必需的' })
}
```

| 维度     | 手动验证                          | Zod                                         |
| -------- | --------------------------------- | ------------------------------------------- |
| 一致性   | ✅ 与现有 `examples.ts` 模式一致  | ❌ 引入新模式，现有代码需要重构或存在不一致 |
| 依赖     | ✅ 零依赖                         | ❌ 新增依赖 (zod ~50KB)                     |
| 类型推断 | ❌ 需手动声明类型                 | ✅ 自动推断 TypeScript 类型                 |
| 维护成本 | 中等 — Device 字段有限 (7 个字段) | 低 — Schema 即文档                          |
| 学习曲线 | ✅ 无                             | 低 — 但对团队是新概念                       |

**对于 Device 实体（7 个字段）的验证复杂度，手动验证完全可控。** 如果未来实体数量增长或验证规则变复杂，可以再引入 Zod。

### 实现模式

```typescript
// 提取可复用的验证辅助函数
function validateDeviceInput(body: Record<string, unknown>) {
  const errors: string[] = []

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('name 是必填字段')
  }
  if (
    !body.serialNumber ||
    typeof body.serialNumber !== 'string' ||
    body.serialNumber.trim() === ''
  ) {
    errors.push('serialNumber 是必填字段')
  }
  if (
    body.status &&
    !['IN_USE', 'STORAGE', 'MAINTENANCE', 'SCRAPPED'].includes(body.status as string)
  ) {
    errors.push('status 必须是 IN_USE, STORAGE, MAINTENANCE, SCRAPPED 之一')
  }
  if (body.purchaseDate && isNaN(Date.parse(body.purchaseDate as string))) {
    errors.push('purchaseDate 格式无效')
  }

  return errors.length > 0 ? errors : null
}

// 路由中使用
const errors = validateDeviceInput(req.body)
if (errors) {
  return res.status(400).json({ error: '输入验证失败', details: errors })
}
```

### Alternatives Considered

- **Zod**: 生产级项目的最佳选择，提供 schema-as-code、自动类型推断、优秀的错误消息。但当前项目体量小、无先例，引入新依赖需要权衡。**如果字段数增长到 15+ 或新增实体，建议迁移到 Zod。**
- **Joi**: Express 生态中的老牌方案，但不支持 TypeScript 类型推断（需要 `@types/joi`），在 TS 优先的项目中 Zod 更现代。
- **express-validator**: 中间件风格，与 Express 耦合紧密，但不如 Zod 通用。
- **class-validator + class-transformer**: 装饰器风格，更适合 NestJS。

---

## 5. Vue 3 + Element Plus 分页表格与搜索

### Decision: **使用 `el-table` + `el-pagination` + 服务器端分页/搜索，Pinia Store 管理状态**

### Rationale

- Element Plus 的 `el-table` + `el-pagination` 是最直接的组合，文档完善，社区成熟。
- 服务器端分页避免了前端一次性加载 10,000 条数据的性能问题。
- 搜索使用 debounce 输入框，触发服务器端查询，避免频繁请求。
- 使用 Pinia Store 管理设备列表状态，与现有 `stores/counter.ts` 模式一致。

### 实现模式

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { useDebounceFn } from '@vueuse/core' // 或手写 debounce

const store = useDeviceStore()
const search = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const fetchDevices = async () => {
  await store.fetchDevices({
    page: currentPage.value,
    pageSize: pageSize.value,
    search: search.value,
  })
}

// 搜索 debounce — 300ms
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1 // 搜索时重置到第一页
  fetchDevices()
}, 300)

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchDevices()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchDevices()
}

onMounted(fetchDevices)
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <el-input
      v-model="search"
      placeholder="按名称或序列号搜索"
      clearable
      @input="debouncedSearch"
      @clear="debouncedSearch"
    />

    <!-- 表格 -->
    <el-table :data="store.devices" v-loading="store.loading">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="model" label="型号" />
      <el-table-column prop="serialNumber" label="序列号" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="location" label="位置" />
      <el-table-column label="操作" fixed="right">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="store.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>
```

### 关键设计点

| 设计点        | 决策                | 原因                                               |
| ------------- | ------------------- | -------------------------------------------------- |
| 分页位置      | 服务器端            | 10,000 条数据不适合一次性传输                      |
| 搜索触发      | debounce 300ms      | 平衡实时性和请求频率                               |
| 搜索重置      | 搜索时回到第 1 页   | 避免搜索后仍在高页码导致空结果                     |
| 状态管理      | Pinia Store         | 与现有 `counter.ts` 模式一致                       |
| 加载状态      | `v-loading` 指令    | Element Plus 内置，用户体验好                      |
| 空状态        | `el-empty` 组件     | 无数据时友好提示                                   |
| Debounce 实现 | 手写或 `setTimeout` | 不需要引入 `@vueuse/core` 新依赖，3 行代码即可实现 |

### Debounce 不引入新依赖的实现

```typescript
// 简单的 debounce 实现（避免引入 @vueuse/core 依赖）
let searchTimer: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchDevices()
  }, 300)
}
```

### Alternatives Considered

- **前端分页 (一次加载全部)**: 数据量小时简单，但 10,000 条数据会导致初始加载慢、内存占用高。
- **虚拟滚动 (`el-table-v2`)**: Element Plus 提供虚拟化表格，适合超大数据量（100,000+）。10,000 条记录用分页更直观。
- **无限滚动 (Infinite Scroll)**: "加载更多"模式，适合社交媒体/信息流，不适合管理后台的结构化浏览。

---

## Summary Matrix

| #   | 问题     | 决策                                        | 复杂度 | 新依赖 |
| --- | -------- | ------------------------------------------- | ------ | ------ |
| 1   | 分页模式 | Offset (`skip`/`take`)                      | 低     | 无     |
| 2   | 搜索模式 | Prisma `contains` + `OR`                    | 低     | 无     |
| 3   | 唯一约束 | 捕获 `P2002` → HTTP 409                     | 低     | 无     |
| 4   | 请求验证 | 手动验证（保持一致性）                      | 中     | 无     |
| 5   | 前端表格 | `el-table` + `el-pagination` + 服务器端分页 | 中     | 无     |

**总体策略**: 零新依赖，全部使用现有技术栈能力实现。与现有代码风格与模式保持高度一致。
