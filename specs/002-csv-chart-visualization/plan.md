# 实施计划：CSV 图表可视化

**分支**: `002-csv-chart-visualization` | **日期**: 2025-12-31 | **规格**: [spec.md](spec.md)
**输入**: 来自 `/specs/002-csv-chart-visualization/spec.md` 的功能规格

## 摘要

实现一个客户端 CSV 可视化工具，允许用户上传 CSV 文件，预览数据，并使用 ECharts 生成交互式柱状图/折线图。

## 技术背景

**语言/版本**: TypeScript 5.x, Vue 3.5+
**主要依赖**:
- `papaparse`: 用于 CSV 解析。
- `echarts`: 用于可视化。
- `pinia`: 用于状态管理。
- `element-plus`: 用于 UI 组件。
**存储**: 内存中 (Pinia store)，无后端持久化。
**测试**: 通过快速入门指南进行手动验证。
**目标平台**: 现代浏览器 (Chrome, Firefox, Safari, Edge)。
**项目类型**: Web 应用程序 (SPA)。
**性能目标**: 解析和渲染 1000 行 < 1s。处理高达 10MB 的文件而不崩溃。
**约束**: 仅客户端。

## 宪法检查 (Constitution Check)

_GATE: 必须在 Phase 0 调研前通过。在 Phase 1 设计后重新检查。_

- **库优先 (Library-First)**: 逻辑分离到 `services/csvParser.ts` 和 `stores/chart.ts`。
- **简单性 (Simplicity)**: 使用成熟的库 (`papaparse`, `echarts`) 而不是自定义解决方案。
- **用户体验 (User Experience)**: 自动检测类型和格式以最大限度地减少摩擦。

## 项目结构

### 文档 (此功能)

```text
specs/002-csv-chart-visualization/
├── plan.md              # 本文件
├── research.md          # 库选择和决策
├── data-model.md        # 实体定义
├── quickstart.md        # 测试指南
├── contracts/           # TypeScript 接口
│   └── types.ts
└── tasks.md             # 任务分解
```

### 源代码 (仓库根目录)

```text
apps/web/src/
├── components/
│   ├── CsvUploader.vue       # 文件上传组件
│   ├── DataPreview.vue       # 表格预览组件
│   ├── ChartConfigurator.vue # 轴/类型选择
│   └── ChartRenderer.vue     # ECharts 包装器
├── stores/
│   └── chart.ts              # 用于数据集和配置的 Pinia store
├── services/
│   └── csvParser.ts          # 解析逻辑包装器
├── views/
│   └── VisualizationView.vue # 主要功能视图
└── router/
    └── index.ts              # 路由更新
```

## 复杂度跟踪

N/A - 标准实现。
