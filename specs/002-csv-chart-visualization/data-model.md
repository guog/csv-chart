# 数据模型：CSV 图表可视化

## 实体

### 1. Dataset (数据集)
表示从 CSV 文件解析的原始数据。

```typescript
interface Dataset {
  id: string;           // 唯一标识符（例如 UUID 或时间戳）
  fileName: string;     // 原始文件名
  fileSize: number;     // 大小（字节）
  headers: string[];    // 第一行的列名
  data: Record<string, any>[]; // 行对象数组
  columnTypes: Record<string, ColumnType>; // 每列的检测类型
}

enum ColumnType {
  String = 'string',
  Number = 'number',
  Date = 'date'
}
```

### 2. ChartConfiguration (图表配置)
表示用户的可视化选择。

```typescript
interface ChartConfiguration {
  chartType: 'bar' | 'line';
  xAxisColumn: string;
  yAxisColumns: string[]; // 支持多个系列
  title?: string;
}
```

### 3. 验证规则

- **文件大小**: 必须 <= 10MB。
- **文件类型**: 必须是 `text/csv` 或以 `.csv` 结尾。
- **数据完整性**:
    - `xAxisColumn` 必须存在于 `headers` 中。
    - `yAxisColumns` 必须存在于 `headers` 中。
    - `yAxisColumns` 理想情况下应为 `Number` 类型（尽管我们在渲染时会过滤掉非数字）。

## 状态管理 (Pinia)

**Store**: `chart`

**State**:
- `currentDataset: Dataset | null`
- `config: ChartConfiguration`
- `isParsing: boolean`
- `error: string | null`

**Actions**:
- `uploadFile(file: File): Promise<void>`
- `setChartConfig(config: Partial<ChartConfiguration>): void`
- `reset(): void`
