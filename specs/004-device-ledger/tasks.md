# 任务清单: 设备台账管理

**输入**: 设计文档来自 `/specs/004-device-ledger/`
**前置条件**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.yaml ✅, quickstart.md ✅

**测试**: 规格说明中未明确要求测试 — 本清单不包含测试任务。

**组织方式**: 任务按用户故事 (US1–US4) 分组，支持独立实现和测试。

## 格式说明: `[ID] [P?] [Story] 描述`

- **[P]**: 可与其他任务并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事 (US1, US2, US3, US4)
- 所有描述包含具体文件路径

## 路径约定

- **后端**: `apps/server/src/`, `apps/server/prisma/`
- **前端**: `apps/web/src/`

---

## 阶段 1: 项目设置

**目标**: 项目初始化和共享基础设施

- [x] T001 在 `apps/server/prisma/schema.prisma` 中添加 Device 模型
- [x] T002 执行 Prisma 迁移创建 devices 表 (`npx prisma migrate dev --name add-device-model`)
- [x] T003 [P] 在 `apps/web/src/types/device.ts` 中创建设备类型定义和状态枚举
- [x] T004 [P] 在 `apps/web/src/api/device.ts` 中创建设备 API 服务模块 (axios 封装)

**检查点**: 数据库 Schema 就绪，共享类型可用，API 客户端准备完毕

---

## 阶段 2: 基础设施 (阻塞性前置条件)

**目标**: 后端 CRUD 路由骨架和前端路由 — 必须在用户故事开始前完成

**⚠️ 关键**: 此阶段完成前，不能开始任何用户故事的开发

- [x] T005 在 `apps/server/src/routes/devices.ts` 中创建设备 CRUD 路由文件并导出 router
- [x] T006 在 `apps/server/src/index.ts` 中注册设备路由到 `/api/devices`
- [x] T007 [P] 在 `apps/web/src/views/DeviceView.vue` 中创建 DeviceView 页面骨架（空组件）
- [x] T008 [P] 在 `apps/web/src/stores/device.ts` 中创建设备 Pinia store 骨架
- [x] T009 在 `apps/web/src/router/index.ts` 中添加 `/devices` 路由

**检查点**: 基础设施就绪 — 后端路由已注册，前端页面可通过 `/devices` 访问

---

## 阶段 3: 用户故事 1 — 查看设备列表 (优先级: P1) 🎯 MVP

**目标**: 在分页、可搜索的表格中显示所有设备

**独立测试**: 在数据库中预置设备记录，导航到 `/devices`，验证分页表格正确显示且搜索功能正常

### 用户故事 1 实现

- [x] T010 [US1] 在 `apps/server/src/routes/devices.ts` 中实现 GET `/api/devices` 端点，支持 offset 分页 (`skip`/`take`) 和总数统计
- [x] T011 [US1] 在 `apps/server/src/routes/devices.ts` 中为 GET `/api/devices` 添加搜索/过滤支持 (Prisma `contains` + `OR` 匹配 name/serialNumber)
- [x] T012 [US1] 在 `apps/web/src/stores/device.ts` 中实现 `fetchDevices(page, pageSize, search)` action 和状态
- [x] T013 [US1] 在 `apps/web/src/views/DeviceView.vue` 中使用 `el-table` 实现设备列表表格，显示 name, model, serialNumber, status, location 列
- [x] T014 [US1] 在 `apps/web/src/views/DeviceView.vue` 中添加 `el-pagination` 组件实现服务端分页
- [x] T015 [US1] 在 `apps/web/src/views/DeviceView.vue` 中添加搜索输入框，300ms 防抖，按 name/serialNumber 过滤
- [x] T016 [US1] 在 `apps/web/src/views/DeviceView.vue` 中添加空状态显示 ("未找到设备")
- [x] T017 [US1] 在 `apps/web/src/views/DeviceView.vue` 中为状态列添加彩色 `el-tag` 渲染 (IN_USE=绿色, STORAGE=蓝色, MAINTENANCE=橙色, SCRAPPED=红色)

**检查点**: 设备列表功能完整 — 分页表格、搜索、空状态。US1 可独立测试。

---

## 阶段 4: 用户故事 2 — 注册新设备 (优先级: P1)

**目标**: 允许用户通过表单对话框添加新设备

**独立测试**: 点击"添加设备"按钮，填写有效数据，提交，验证设备出现在列表和数据库中

### 用户故事 2 实现

- [x] T018 [US2] 在 `apps/server/src/routes/devices.ts` 中实现 POST `/api/devices` 端点，验证请求体 (name, serialNumber 必填)
- [x] T019 [US2] 在 `apps/server/src/routes/devices.ts` 中添加 Prisma P2002 唯一约束错误处理，重复 serialNumber 返回 HTTP 409
- [x] T020 [US2] 在 `apps/server/src/routes/devices.ts` 中为 POST 端点添加状态枚举验证 (IN_USE, STORAGE, MAINTENANCE, SCRAPPED)
- [x] T021 [US2] 在 `apps/web/src/stores/device.ts` 中实现 `createDevice(data)` action
- [x] T022 [US2] 在 `apps/web/src/views/DeviceView.vue` 中添加"添加设备"按钮和 `el-dialog` 表单，包含字段 (name, model, serialNumber, purchaseDate, status, location, description)
- [x] T023 [US2] 在 `apps/web/src/views/DeviceView.vue` 中使用 Element Plus 表单规则添加前端表单验证 (name/serialNumber 必填, status 下拉选择)
- [x] T024 [US2] 在 `apps/web/src/views/DeviceView.vue` 中处理 409 冲突错误 (重复 serialNumber)，显示友好的 `ElMessage.error` 通知
- [x] T025 [US2] 在 `apps/web/src/views/DeviceView.vue` 中创建成功后自动刷新设备列表

**检查点**: 设备创建功能完整 — 表单验证、重复检测、列表刷新。US2 可独立测试。

---

## 阶段 5: 用户故事 3 — 更新设备信息 (优先级: P2)

**目标**: 允许用户编辑现有设备详情

**独立测试**: 点击某设备的"编辑"按钮，修改字段，保存，验证更改在列表和数据库中持久化

### 用户故事 3 实现

- [x] T026 [US3] 在 `apps/server/src/routes/devices.ts` 中实现 GET `/api/devices/:id` 端点获取单个设备
- [x] T027 [US3] 在 `apps/server/src/routes/devices.ts` 中实现 PUT `/api/devices/:id` 端点，包含验证和 P2002 处理 (唯一性检查排除自身)
- [x] T028 [US3] 在 `apps/web/src/stores/device.ts` 中实现 `updateDevice(id, data)` action
- [x] T029 [US3] 在 `apps/web/src/views/DeviceView.vue` 中为表格每行添加"编辑"操作按钮
- [x] T030 [US3] 在 `apps/web/src/views/DeviceView.vue` 中复用创建对话框用于编辑模式 — 预填当前设备数据，对话框标题改为"编辑设备"
- [x] T031 [US3] 在 `apps/web/src/views/DeviceView.vue` 中处理更新时的 404 (设备不存在) 和 409 (serialNumber 冲突) 错误
- [x] T032 [US3] 在 `apps/web/src/views/DeviceView.vue` 中更新成功后自动刷新设备列表

**检查点**: 设备编辑功能完整 — 编辑对话框预填、验证、冲突检测。US3 可独立测试。

---

## 阶段 6: 用户故事 4 — 移除设备 (优先级: P3)

**目标**: 允许用户删除设备并进行确认

**独立测试**: 点击某设备的"删除"按钮，在对话框中确认，验证设备从列表和数据库中移除

### 用户故事 4 实现

- [x] T033 [US4] 在 `apps/server/src/routes/devices.ts` 中实现 DELETE `/api/devices/:id` 端点，包含 404 处理 (硬删除)
- [x] T034 [US4] 在 `apps/web/src/stores/device.ts` 中实现 `deleteDevice(id)` action
- [x] T035 [US4] 在 `apps/web/src/views/DeviceView.vue` 中为表格每行添加"删除"操作按钮，使用 `ElMessageBox.confirm` 确认对话框
- [x] T036 [US4] 在 `apps/web/src/views/DeviceView.vue` 中优雅处理 404 错误 (设备已被删除)
- [x] T037 [US4] 在 `apps/web/src/views/DeviceView.vue` 中删除成功后自动刷新设备列表并显示 `ElMessage` 成功提示

**检查点**: 设备删除功能完整 — 确认对话框、硬删除、列表刷新。US4 可独立测试。

---

## 阶段 7: 优化与跨领域关注点

**目标**: 用户体验改进和验证

- [x] T038 [P] 在 `apps/web/src/views/DeviceView.vue` 中为表格添加加载状态 (`v-loading`)
- [x] T039 [P] 在 `apps/web/src/stores/device.ts` 中为所有 API 调用添加网络错误处理，显示友好的 `ElMessage.error`
- [x] T040 [P] 在 `apps/web/src/views/DeviceView.vue` 中添加响应式表格布局，适配平板/桌面端
- [x] T041 运行 `quickstart.md` 验证 — 确认所有 curl 命令在运行的服务器上正常工作
- [X] T042 执行 `pnpm format` 确保所有新文件代码格式一致

---

## 依赖关系与执行顺序

### 阶段依赖

- **设置 (阶段 1)**: 无依赖 — 立即开始
- **基础设施 (阶段 2)**: 依赖阶段 1 (Prisma 迁移必须先完成) — 阻塞所有用户故事
- **US1 (阶段 3)**: 依赖阶段 2 — 实现列表/搜索/分页
- **US2 (阶段 4)**: 依赖阶段 2 — 后端可与 US1 并行，但前端共享 `DeviceView.vue`
- **US3 (阶段 5)**: 依赖阶段 2 + US1 (需要列表表格中的编辑按钮) + T026 GET /:id 端点
- **US4 (阶段 6)**: 依赖阶段 2 + US1 (需要列表表格中的删除按钮)
- **优化 (阶段 7)**: 依赖所有用户故事完成

### 推荐执行顺序

```
阶段 1 (设置) → 阶段 2 (基础设施) → 阶段 3 (US1: 列表) → 阶段 4 (US2: 创建)
  → 阶段 5 (US3: 更新) → 阶段 6 (US4: 删除) → 阶段 7 (优化)
```

### 用户故事依赖

- **US1 (查看列表)**: 仅依赖基础设施 — 完全独立
- **US2 (创建设备)**: 仅依赖基础设施 — 后端独立，前端添加到 DeviceView
- **US3 (更新设备)**: 需要 US1 列表表格存在 (行内编辑按钮) + 后端 GET /:id
- **US4 (移除设备)**: 需要 US1 列表表格存在 (行内删除按钮)

### 各用户故事内部顺序

- 后端端点先于前端 store action
- Store action 先于视图实现
- 核心显示先于用户体验优化

### 并行机会

- T003 + T004: 类型定义和 API 服务 (不同文件)
- T007 + T008: 视图骨架和 store 骨架 (不同文件)
- T038 + T039 + T040: 优化任务 (独立关注点)
- 不同故事的后端任务可并行 (都在 `devices.ts` 但是不同 HTTP 方法)

---

## 并行示例: 阶段 1 设置

```bash
# T001 + T002 完成后 (顺序执行 — 先 schema 再迁移):
# 同时启动 T003 和 T004 (不同文件):
任务 T003: "在 apps/web/src/types/device.ts 中创建设备类型定义和状态枚举"
任务 T004: "在 apps/web/src/api/device.ts 中创建设备 API 服务模块"
```

## 并行示例: 阶段 2 基础设施

```bash
# T005 + T006 完成后 (顺序执行 — 先创建再注册路由):
# 同时启动 T007, T008, T009 (不同文件):
任务 T007: "在 apps/web/src/views/DeviceView.vue 中创建 DeviceView 页面骨架"
任务 T008: "在 apps/web/src/stores/device.ts 中创建设备 Pinia store 骨架"
任务 T009: "在 apps/web/src/router/index.ts 中添加 /devices 路由"
```

---

## 实施策略

### MVP 优先 (仅用户故事 1 + 2)

1. 完成阶段 1: 设置 (schema + 类型)
2. 完成阶段 2: 基础设施 (路由注册 + 页面骨架)
3. 完成阶段 3: 用户故事 1 — 分页/搜索设备列表
4. 完成阶段 4: 用户故事 2 — 注册新设备
5. **停止并验证**: 可查看和创建设备 = 功能性 MVP
6. 准备好则部署/演示

### 增量交付

1. 设置 + 基础设施 → 骨架就绪
2. - US1 (查看列表) → 只读 MVP，可独立测试
3. - US2 (创建设备) → 可填充数据，可独立测试
4. - US3 (更新设备) → 完整编辑能力，可独立测试
5. - US4 (移除设备) → 完整生命周期管理，可独立测试
6. - 优化 → 生产就绪的用户体验

---

## 备注

- 所有后端端点在单一文件 `apps/server/src/routes/devices.ts` 中 (遵循现有 `examples.ts` 模式)
- 所有前端 UI 在单一视图 `apps/web/src/views/DeviceView.vue` 中，包含对话框表单 (保持 MVP 简洁)
- Prisma 生成类型 — 前端 `types/device.ts` 镜像 API 响应结构
- 状态枚举在应用层强制执行 (SQLite 无原生 enum)
- 不假设导航菜单变更 — 通过直接 URL `/devices` 访问
- 每个任务或逻辑组完成后提交；在任何检查点停止可独立验证
