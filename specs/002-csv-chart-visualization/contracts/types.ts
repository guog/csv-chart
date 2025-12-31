export type ColumnType = 'string' | 'number' | 'date';

export interface Dataset {
  id: string;
  fileName: string;
  fileSize: number;
  headers: string[];
  data: Record<string, any>[];
  columnTypes: Record<string, ColumnType>;
}

export interface ChartConfiguration {
  chartType: 'bar' | 'line';
  xAxisColumn: string;
  yAxisColumns: string[];
  title?: string;
}

export interface CsvParseResult {
  data: any[];
  errors: any[];
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields?: string[];
  };
}

export interface IChartService {
  parse(file: File): Promise<Dataset>;
  detectTypes(data: any[], headers: string[]): Record<string, ColumnType>;
  filterData(dataset: Dataset, config: ChartConfiguration): any[];
}
