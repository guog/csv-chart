# 实施计划：数据点高亮显示

**分支**: `003-highlight-data-points` | **日期**: 2025-12-31 | **规格**: [spec.md](spec.md)
**输入**: 来自 `/specs/003-highlight-data-points/spec.md` 的功能规格

## 摘要

在现有 CSV 图表可视化功能基础上，添加阈值高亮显示功能。当数据值大于等于用户指定阈值时，将数据点以红色高亮显示，帮助用户快速识别异常数据。

## 技术背景

**语言/版本**: TypeScript 5.x, Vue 3.5+
**主要依赖**:
- `echarts`: 用于图表渲染和样式配置
- `element-plus`: 用于阈值输入框 (el-input-number)
- `pinia`: 用于状态管理
**存储**: 内存中 (Pinia store)，扩展现有 chartConfig
**测试**: 通过快速入门指南进行手动验证
**目标平台**: 现代浏览器 (Chrome, Firefox, Safari, Edge)
**项目类型**: Web 应用程序 (SPA) - 扩展现有功能
**性能目标**: 阈值变更后图表在 500ms 内更新
**约束**: 
- 依赖 002-csv-chart-visualization 已实现的图表功能
- 高亮颜色固定为红色 (#F56C6C)

## 宪法检查 (Constitution Check)

_GATE: 必须在 Phase 0 调研前通过。在 Phase 1 设计后重新检查。_

- **库优先 (Library-First)**: 高亮逻辑集成到现有 `services/chartService.ts`
- **简单性 (Simplicity)**: 利用 ECharts 内置的 itemStyle 功能实现条件样式
- **用户体验 (User Experience)**: 提供默认阈值 (100)，减少用户配置负担

## 项目结构

### 文档 (此功能)

```text
specs/003-highlight-data-points/
├── plan.md              # 本文件
├── research.md          # 技术调研
├── data-model.md        # 数据模型扩展
├── quickstart.md        # 测试指南
├── contracts/           # 类型定义扩展
│   └── types.ts
└── tasks.md             # 任务分解
```

### 源代码 (修改现有文件)

```text
apps/web/src/
├── components/
│   └── ChartConfigurator.vue # 添加阈值输入框
├── stores/
│   └── chart.ts              # 扩展 chartConfig，添加 highlightThreshold
├── services/
│   └── chartService.ts       # 添加高亮样式生成逻辑
└── types/
    └── chart.ts              # 扩展 ChartConfiguration 类型
```

## 复杂度跟踪

N/A - 标准扩展实现，利用 ECharts 现有能力。

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
