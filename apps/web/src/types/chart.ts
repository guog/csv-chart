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
}

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

/** ECharts 系列数据 */
export interface ChartSeriesData {
  name: string;
  type: 'bar' | 'line';
  data: (number | null)[];
}

/** ECharts 选项 */
export interface ChartOption {
  title?: {
    text?: string;
  };
  tooltip?: {
    trigger?: 'axis' | 'item';
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
