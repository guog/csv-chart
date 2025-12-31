# 调研：CSV 图表可视化

**功能**: CSV 图表可视化
**状态**: 完成

## 决策

### 1. CSV 解析库
- **决策**: 使用 `papaparse`。
- **理由**: 它是浏览器端最流行、健壮且快速的 CSV 解析器。它支持大文件、Worker（如果需要性能优化，尽管 10MB 在主线程上可能没问题，但 Worker 更安全）和表头检测。
- **替代方案**: `csv-parse`（更侧重于 Node.js），手动分割（容易出错）。

### 2. 图表库
- **决策**: 使用 `echarts`。
- **理由**: 用户明确要求。它能很好地处理大数据集并提供丰富的交互性。
- **集成**: 将直接使用 `echarts` 或通过轻量级包装组件来处理调整大小和生命周期管理。

### 3. 状态管理
- **决策**: 使用 `Pinia`。
- **理由**: 项目中已存在。非常适合在“上传”和“可视化”步骤之间共享上传的数据集和图表配置（如果它们是分开的），或者仅在复杂视图中管理状态。

### 4. UI 组件
- **决策**: 使用 `Element Plus`。
- **理由**: 项目中已存在。使用 `el-upload` 进行文件输入，`el-table` 进行预览，`el-select` 进行配置。

## 未知与澄清 (已解决)

- **文件大小限制**: 10MB (用户已澄清)。
- **X 轴类型**: 自动检测 (用户已澄清)。
- **缺失值**: 过滤掉 (用户已澄清)。
- **日期格式**: 尽力自动检测 (用户已澄清)。

## 实施策略

1.  **依赖安装**: 添加 `papaparse`, `@types/papaparse`, `echarts`。
2.  **Store**: 创建 `useChartStore` 以保存 `rawFile`, `parsedData`, `chartConfig`。
3.  **组件**:
    -   `CsvUploader.vue`: 处理文件选择和解析。
    -   `DataPreview.vue`: 显示前 N 行的 `el-table`。
    -   `ChartConfigurator.vue`: 选择 X/Y 轴和图表类型的表单。
    -   `ChartRenderer.vue`: 包装 ECharts 实例。
4.  **视图**: `HomeView.vue` 或新的 `ChartAnalysisView.vue` 来编排这些组件。
