# 任务列表：数据点高亮显示

**输入**: 来自 `/specs/003-highlight-data-points/` 的设计文档
**先决条件**: plan.md (必需), spec.md (必需), research.md, data-model.md, contracts/

## 格式: `[ID] [P?] [Story] 描述`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属的用户故事（例如 US1）
- 描述中包含确切的文件路径

---

## Phase 1: 设置 (类型扩展)

**目的**: 扩展现有类型定义和状态管理

- [X] T001 扩展 apps/web/src/types/chart.ts 添加 highlightThreshold 字段和高亮常量
- [X] T002 [P] 扩展 apps/web/src/stores/chart.ts 添加 highlightThreshold 到 chartConfig 默认值

---

## Phase 2: 用户故事 1 - 阈值高亮显示 (优先级: P1) 🎯 MVP

**目标**: 用户可以设置阈值，超阈值数据点以红色高亮显示

**独立测试**: 上传 CSV，设置阈值为 100，验证超过 100 的数据点显示红色

### 用户故事 1 实现

- [X] T003 [P] [US1] 在 ChartConfigurator.vue 添加阈值输入框 apps/web/src/components/ChartConfigurator.vue
  - 使用 el-input-number 组件
  - 设置默认值为 100
  - 支持清空（禁用高亮）
  - 支持负数输入
  - 变更时更新 Chart Store

- [X] T004 [P] [US1] 在 chartService.ts 添加高亮样式逻辑 apps/web/src/services/chartService.ts
  - 创建 applyHighlightStyles 函数
  - 柱状图：值 >= 阈值显示红色 (#F56C6C)
  - 折线图：值 >= 阈值显示红色大圆点 (symbolSize: 10)
  - 普通数据点保持蓝色 (#409EFF)
  - 处理 null 阈值（禁用高亮）

- [X] T005 [US1] 修改 generateChartOption 集成高亮逻辑 apps/web/src/services/chartService.ts
  - 接收 highlightThreshold 参数
  - 在生成 series 时应用高亮样式
  - 更新 tooltip formatter 显示"超出阈值"标识

- [X] T006 [US1] 更新 ChartRenderer.vue 传递阈值配置 apps/web/src/components/ChartRenderer.vue
  - 从 chartStore 获取 highlightThreshold
  - 传递给 generateChartOption

**检查点**: 用户故事 1 现在应该完全可用并可独立测试

---

## Phase 3: 润色与验证

**目的**: 验证功能完整性

- [X] T007 运行 quickstart.md 验证所有场景
  - 场景 A: 默认阈值高亮
  - 场景 B: 修改阈值
  - 场景 C: 禁用高亮
  - 场景 D: 折线图高亮
  - 场景 E: 多系列高亮
  - 验证工具提示显示"超出阈值"

---

## 依赖关系与执行顺序

### 阶段依赖

- **设置 (Phase 1)**: 无依赖 - 可立即开始
- **用户故事 (Phase 2)**: 依赖设置完成
- **润色 (Phase 3)**: 依赖用户故事完成

### 任务依赖

- T001, T002 可并行
- T003, T004 可并行（依赖 T001, T002 完成）
- T005 依赖 T004
- T006 依赖 T005
- T007 依赖所有任务完成

### 并行机会

- T001, T002 可并行 (不同的文件)
- T003, T004 可并行 (不同的组件)

---

## 实施策略

**MVP 范围**: 用户故事 1 (Phase 1-2)

**总任务数**: 7
- Phase 1 (设置): 2 个任务
- Phase 2 (用户故事 1): 4 个任务
- Phase 3 (润色): 1 个任务

**并行机会**: 每个阶段内的 [P] 标记任务可并行执行

**独立测试标准**:
- 用户故事 1: 设置阈值 → 超阈值数据点显示红色

---

## 需求覆盖矩阵

| 需求 | 任务 |
|------|------|
| FR-001.1 阈值输入框 | T003 |
| FR-001.2 默认值 100 | T003 |
| FR-001.3 支持负数 | T003 |
| FR-001.4 允许清空 | T003 |
| FR-002.1 柱状图红色高亮 | T004, T005 |
| FR-002.2 普通柱子蓝色 | T004, T005 |
| FR-002.3 多系列独立判断 | T004, T005 |
| FR-003.1 折线图红色圆点 | T004, T005 |
| FR-003.2 高亮点更大 | T004 |
| FR-003.3 连接线不变 | T004 |
| FR-004.1 工具提示标识 | T005 |
