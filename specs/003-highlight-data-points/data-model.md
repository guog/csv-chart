# 数据模型扩展：数据点高亮显示

**日期**: 2025-12-31
**功能**: 003-highlight-data-points

## 模型变更

### ChartConfiguration (扩展)

现有类型需要添加 `highlightThreshold` 字段：

```typescript
interface ChartConfiguration {
  // 现有字段
  chartType: 'bar' | 'line';
  xAxisColumn: string;
  yAxisColumns: string[];
  title?: string;
  
  // 新增字段
  highlightThreshold: number | null;  // 高亮阈值，null 表示禁用
}
```

### 字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| highlightThreshold | number \| null | 100 | 高亮阈值。值 >= 此阈值时高亮显示；null 表示禁用高亮功能 |

### 验证规则

- `highlightThreshold` 必须是有效数值或 null
- 支持负数
- 无最大/最小值限制

---

## 数据流

```
用户输入阈值
    ↓
ChartConfigurator.vue (el-input-number)
    ↓
chart.ts (Pinia Store: updateChartConfig)
    ↓
ChartRenderer.vue (watch chartConfig)
    ↓
chartService.ts (generateChartOption with threshold)
    ↓
ECharts 渲染 (带条件样式的数据)
```

---

## 状态管理

### Chart Store 扩展

```typescript
// stores/chart.ts

const chartConfig = ref<ChartConfiguration>({
  chartType: 'bar',
  xAxisColumn: '',
  yAxisColumns: [],
  title: '',
  highlightThreshold: 100,  // 默认值
});
```

---

## 样式常量

```typescript
// 高亮颜色
const HIGHLIGHT_COLOR = '#F56C6C';  // Element Plus danger 色
const NORMAL_COLOR = '#409EFF';      // Element Plus primary 色

// 折线图符号大小
const HIGHLIGHT_SYMBOL_SIZE = 10;
const NORMAL_SYMBOL_SIZE = 6;
```
