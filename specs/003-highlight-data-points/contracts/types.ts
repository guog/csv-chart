/**
 * 类型定义扩展：数据点高亮显示
 * 扩展 apps/web/src/types/chart.ts
 */

/** 图表配置 - 扩展版本 */
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

/** 带样式的数据点 (用于 ECharts series data) */
export interface StyledDataPoint {
  value: number | null;
  itemStyle?: {
    color: string;
  };
  symbol?: string;
  symbolSize?: number;
}
