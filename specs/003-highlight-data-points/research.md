# 技术调研：数据点高亮显示

**日期**: 2025-12-31
**功能**: 003-highlight-data-points

## 调研任务

### 1. ECharts 条件样式实现方式

**问题**: 如何在 ECharts 中根据数据值动态设置不同的样式？

**调研结果**:

ECharts 提供多种方式实现条件样式：

#### 方案 A: 使用 itemStyle 的 color 回调函数

```typescript
series: [{
  type: 'bar',
  data: [120, 200, 150, 80, 70],
  itemStyle: {
    color: (params) => {
      return params.value >= threshold ? '#F56C6C' : '#409EFF';
    }
  }
}]
```

**优点**: 简洁，适合简单条件
**缺点**: 仅支持颜色，不支持其他样式属性

#### 方案 B: 使用 visualMap 组件

```typescript
visualMap: {
  show: false,
  pieces: [
    { min: threshold, color: '#F56C6C' },
    { max: threshold, color: '#409EFF' }
  ]
}
```

**优点**: 支持渐变、分段着色
**缺点**: 配置复杂，需要额外组件

#### 方案 C: 数据项级别样式

```typescript
data: [
  { value: 120, itemStyle: { color: '#F56C6C' } },
  { value: 80, itemStyle: { color: '#409EFF' } }
]
```

**优点**: 最灵活，支持所有样式属性
**缺点**: 需要在数据处理时计算样式

**决策**: 采用**方案 C**，在生成 ECharts 选项时为每个数据点计算样式。
**理由**: 
- 支持柱状图和折线图的统一处理
- 可扩展支持更多样式属性（如大小、符号等）
- 便于在工具提示中添加"超出阈值"标识

---

### 2. 折线图数据点高亮

**问题**: 如何在折线图中高亮特定数据点？

**调研结果**:

折线图使用 `symbol` 和 `symbolSize` 控制数据点样式：

```typescript
series: [{
  type: 'line',
  data: [
    { 
      value: 120, 
      itemStyle: { color: '#F56C6C' },
      symbol: 'circle',
      symbolSize: 10  // 高亮点更大
    },
    { 
      value: 80,
      symbol: 'circle', 
      symbolSize: 6   // 普通点
    }
  ]
}]
```

**决策**: 高亮数据点使用 `symbolSize: 10`，普通点使用 `symbolSize: 6`

---

### 3. 工具提示自定义

**问题**: 如何在工具提示中显示"超出阈值"标识？

**调研结果**:

使用 tooltip formatter 函数：

```typescript
tooltip: {
  trigger: 'axis',
  formatter: (params) => {
    return params.map(p => {
      const highlight = p.value >= threshold ? ' ⚠️ 超出阈值' : '';
      return `${p.seriesName}: ${p.value}${highlight}`;
    }).join('<br/>');
  }
}
```

**决策**: 采用自定义 formatter，为超阈值数据添加警告标识

---

## 技术决策汇总

| 问题 | 决策 | 理由 |
|------|------|------|
| 条件样式实现 | 数据项级别样式 | 最灵活，统一处理柱状图/折线图 |
| 折线图高亮 | symbolSize 区分 | 增强视觉辨识度 |
| 工具提示 | 自定义 formatter | 支持添加"超出阈值"标识 |
| 颜色值 | 红色 #F56C6C，蓝色 #409EFF | 与 Element Plus 风格一致 |

---

## 考虑的替代方案

| 方案 | 未采用原因 |
|------|-----------|
| visualMap 组件 | 配置复杂，不适合动态阈值 |
| markLine 阈值线 | 仅显示线，不高亮数据点 |
| 自定义渲染器 | 过度复杂，违反简单性原则 |
