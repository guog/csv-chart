/**
 * CSV 图表可视化 - 类型定义
 * 基于 specs/002-csv-chart-visualization/contracts/types.ts
 */

/** 列类型枚举 */
export type ColumnType = 'string' | 'number' | 'date';

/** 数据集 - 从 CSV 文件解析的原始数据 */
export interface Dataset {
  /** 唯一标识符 */
  id: string;
  /** 原始文件名 */
  fileName: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 列标题（第一行） */
  headers: string[];
  /** 数据行数组 */
  data: Record<string, unknown>[];
  /** 每列的检测类型 */
  columnTypes: Record<string, ColumnType>;
}

/** 图表配置 - 用户的可视化设置 */
export interface ChartConfiguration {
  /** 图表类型 */
  chartType: 'bar' | 'line';
  /** X 轴列名 */
  xAxisColumn: string;
  /** Y 轴列名（支持多个系列） */
  yAxisColumns: string[];
  /** 图表标题 */
  title?: string;
  /** 高亮阈值，值 >= 此阈值时红色高亮，null 表示禁用 */
  highlightThreshold: number | null;
}

/** 高亮配置常量 */
export const HIGHLIGHT_CONFIG = {
  /** 高亮颜色 (Element Plus danger) */
  HIGHLIGHT_COLOR: '#F56C6C',
  /** 普通颜色 (Element Plus primary) */
  NORMAL_COLOR: '#409EFF',
  /** 高亮数据点大小 (折线图) */
  HIGHLIGHT_SYMBOL_SIZE: 10,
  /** 普通数据点大小 (折线图) */
  NORMAL_SYMBOL_SIZE: 6,
  /** 默认阈值 */
  DEFAULT_THRESHOLD: 100,
} as const;

/** CSV 解析结果（来自 papaparse） */
export interface CsvParseResult {
  data: Record<string, unknown>[];
  errors: Array<{
    type: string;
    code: string;
    message: string;
    row?: number;
  }>;
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields?: string[];
  };
}

/** ECharts 数据点样式 */
export interface DataPointStyle {
  /** 数据点颜色 */
  color?: string;
  /** 数据点边框颜色 */
  borderColor?: string;
}

/** ECharts 系列数据项（支持样式） */
export interface ChartDataItem {
  /** 数值 */
  value: number | null;
  /** 数据点样式 */
  itemStyle?: DataPointStyle;
  /** 数据点大小（折线图） */
  symbolSize?: number;
}

/** ECharts 系列数据 */
export interface ChartSeriesData {
  name: string;
  type: 'bar' | 'line';
  data: (number | null | ChartDataItem)[];
  /** 是否显示数据点标记（折线图） */
  showSymbol?: boolean;
}

/** ECharts 选项 */
export interface ChartOption {
  title?: {
    text?: string;
  };
  tooltip?: {
    trigger?: 'axis' | 'item';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter?: ((params: any) => string) | string;
  };
  legend?: {
    data?: string[];
  };
  xAxis?: {
    type?: 'category' | 'time' | 'value';
    data?: (string | number | Date)[];
  };
  yAxis?: {
    type?: 'value';
  };
  series?: ChartSeriesData[];
  dataZoom?: Array<{
    type: 'slider' | 'inside';
    xAxisIndex?: number;
    yAxisIndex?: number;
  }>;
}
