# 任务列表：CSV 图表可视化

**输入**: 来自 `/specs/002-csv-chart-visualization/` 的设计文档
**先决条件**: plan.md (必需), spec.md (必需), research.md, data-model.md, contracts/

## 格式: `[ID] [P?] [Story] 描述`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属的用户故事（例如 US1, US2）
- 描述中包含确切的文件路径

---

## Phase 1: 设置 (共享基础设施)

**目的**: 项目初始化和依赖安装

- [ ] T001 安装 `papaparse` 和 `@types/papaparse` 依赖到 apps/web/
- [ ] T002 安装 `echarts` 依赖到 apps/web/
- [ ] T003 [P] 创建类型定义文件 apps/web/src/types/chart.ts (从 contracts/types.ts 复制)

---

## Phase 2: 基础设施 (阻塞性先决条件)

**目的**: 核心基础设施，必须在任何用户故事开始之前完成

**⚠️ 关键**: 在此阶段完成之前，不能开始任何用户故事的工作

- [ ] T004 创建 CSV 解析服务 apps/web/src/services/csvParser.ts
- [ ] T005 [P] 创建 Chart Store (Pinia) apps/web/src/stores/chart.ts
- [ ] T006 [P] 添加路由配置到 apps/web/src/router/index.ts (添加 /visualization 路由)
- [ ] T007 创建主视图 apps/web/src/views/VisualizationView.vue

**检查点**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: 用户故事 1 - 上传并预览数据 (优先级: P1) 🎯 MVP

**目标**: 用户可以上传 CSV 文件并预览其内容

**独立测试**: 上传一个 CSV 文件，验证表格正确显示前 5-10 行数据

### 用户故事 1 实现

- [ ] T008 [P] [US1] 创建 CsvUploader 组件 apps/web/src/components/CsvUploader.vue
  - 使用 el-upload 进行文件选择
  - 验证文件大小 <= 10MB
  - 验证文件类型为 .csv
  - 调用 csvParser 服务解析文件
  - 将解析结果存储到 Chart Store

- [ ] T009 [P] [US1] 创建 DataPreview 组件 apps/web/src/components/DataPreview.vue
  - 使用 el-table 显示数据
  - 显示前 10 行数据
  - 显示所有列标题
  - 支持列宽自适应

- [ ] T010 [US1] 集成 CsvUploader 和 DataPreview 到 VisualizationView.vue
  - 上传成功后显示预览
  - 显示文件名和文件大小信息
  - 添加"清除数据"按钮

**检查点**: 用户故事 1 现在应该完全可用并可独立测试

---

## Phase 4: 用户故事 2 - 配置并生成图表 (优先级: P1)

**目标**: 用户可以选择列和图表类型来生成可视化

**独立测试**: 选择 X/Y 轴和图表类型，验证图表正确渲染

### 用户故事 2 实现

- [ ] T011 [P] [US2] 创建 ChartConfigurator 组件 apps/web/src/components/ChartConfigurator.vue
  - 使用 el-select 选择 X 轴列
  - 使用 el-select (多选) 选择 Y 轴列
  - 使用 el-radio-group 选择图表类型 (柱状图/折线图)
  - 配置变更时更新 Chart Store

- [ ] T012 [P] [US2] 创建 ChartRenderer 组件 apps/web/src/components/ChartRenderer.vue
  - 初始化 ECharts 实例
  - 根据 Chart Store 配置渲染图表
  - 支持窗口大小变化时自动调整
  - 支持缩放、平移和工具提示

- [ ] T013 [US2] 在 csvParser.ts 中实现数据过滤逻辑
  - 根据配置过滤数据
  - 过滤掉缺失值行
  - 转换数据为 ECharts 格式

- [ ] T014 [US2] 集成 ChartConfigurator 和 ChartRenderer 到 VisualizationView.vue
  - 只有在数据加载后才显示配置器
  - 配置完成后显示图表
  - 图表和配置器响应式布局

**检查点**: 用户故事 1 和 2 现在都应该独立工作

---

## Phase 5: 润色与跨领域关注点

**目的**: 影响多个用户故事的改进

- [ ] T015 [P] 添加错误处理和用户友好的错误消息
- [ ] T016 [P] 添加加载状态指示器 (解析中/渲染中)
- [ ] T017 优化大文件性能 (使用 Web Worker 或分块解析)
- [ ] T018 响应式设计优化 (移动端适配)
- [ ] T019 运行 quickstart.md 验证

---

## 依赖关系与执行顺序

### 阶段依赖

- **设置 (Phase 1)**: 无依赖 - 可立即开始
- **基础设施 (Phase 2)**: 依赖设置完成 - 阻塞所有用户故事
- **用户故事 (Phase 3+)**: 全部依赖基础设施阶段完成
  - 用户故事可以并行进行（如果有人力）
  - 或者按优先级顺序进行 (P1 → P2 → P3)
- **润色 (最终阶段)**: 依赖所有期望的用户故事完成

### 用户故事依赖

- **用户故事 1 (P1)**: 基础设施完成后可开始 - 不依赖其他故事
- **用户故事 2 (P1)**: 依赖用户故事 1 的数据加载功能 (需要先有数据才能配置和渲染)

### 每个用户故事内

- 标记为 [P] 的任务可以并行执行
- 组件创建完成后再进行集成
- 核心实现在集成之前

### 并行机会

- T001, T002 可并行 (不同的依赖安装)
- T003, T005, T006 可并行 (不同的文件)
- T008, T009 可并行 (不同的组件)
- T011, T012 可并行 (不同的组件)
- T015, T016 可并行 (不同的关注点)

---

## 并行示例: 用户故事 1

```bash
# 并行创建两个组件:
# 开发者 A: T008 (CsvUploader)
# 开发者 B: T009 (DataPreview)
# 然后: T010 (集成)
```

## 并行示例: 用户故事 2

```bash
# 并行创建两个组件:
# 开发者 A: T011 (ChartConfigurator)
# 开发者 B: T012 (ChartRenderer)
# 然后: T013 (数据过滤), T014 (集成)
```

---

## 实施策略

**MVP 范围**: 用户故事 1 + 用户故事 2 (Phase 1-4)

**总任务数**: 19
- Phase 1 (设置): 3 个任务
- Phase 2 (基础设施): 4 个任务
- Phase 3 (用户故事 1): 3 个任务
- Phase 4 (用户故事 2): 4 个任务
- Phase 5 (润色): 5 个任务

**并行机会**: 每个阶段内的 [P] 标记任务可并行执行

**独立测试标准**:
- 用户故事 1: 上传 CSV → 显示预览表格
- 用户故事 2: 选择配置 → 显示图表
