/**
 * Chart Store - 管理 CSV 数据和图表配置状态
 * 使用 Pinia 进行状态管理
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Dataset, ChartConfiguration, ColumnType } from '@/types/chart';
import { HIGHLIGHT_CONFIG } from '@/types/chart';

export const useChartStore = defineStore('chart', () => {
  // ===== State =====
  
  /** 当前加载的数据集 */
  const dataset = ref<Dataset | null>(null);
  
  /** 图表配置 */
  const chartConfig = ref<ChartConfiguration>({
    chartType: 'bar',
    xAxisColumn: '',
    yAxisColumns: [],
    title: '',
    highlightThreshold: HIGHLIGHT_CONFIG.DEFAULT_THRESHOLD,
  });
  
  /** 加载状态 */
  const isLoading = ref(false);
  
  /** 错误信息 */
  const error = ref<string | null>(null);
  
  // ===== Getters =====
  
  /** 是否有数据 */
  const hasData = computed(() => dataset.value !== null && dataset.value.data.length > 0);
  
  /** 获取列标题 */
  const headers = computed(() => dataset.value?.headers ?? []);
  
  /** 获取数值类型的列（可用于 Y 轴） */
  const numericColumns = computed(() => {
    if (!dataset.value) return [];
    return Object.entries(dataset.value.columnTypes)
      .filter(([_, type]) => type === 'number')
      .map(([name]) => name);
  });
  
  /** 获取可用于 X 轴的列（日期和字符串类型） */
  const xAxisAvailableColumns = computed(() => {
    if (!dataset.value) return [];
    return Object.entries(dataset.value.columnTypes)
      .filter(([_, type]) => type === 'string' || type === 'date')
      .map(([name]) => name);
  });
  
  /** 获取预览数据（前 10 行） */
  const previewData = computed(() => {
    if (!dataset.value) return [];
    return dataset.value.data.slice(0, 10);
  });
  
  /** 图表配置是否完整 */
  const isChartConfigValid = computed(() => {
    return (
      chartConfig.value.xAxisColumn !== '' &&
      chartConfig.value.yAxisColumns.length > 0
    );
  });
  
  /** 获取列类型 */
  const getColumnType = (columnName: string): ColumnType | undefined => {
    return dataset.value?.columnTypes[columnName];
  };
  
  // ===== Actions =====
  
  /**
   * 设置数据集
   */
  function setDataset(data: Dataset) {
    dataset.value = data;
    error.value = null;
    
    // 自动初始化图表配置
    autoInitChartConfig();
  }
  
  /**
   * 自动初始化图表配置
   * 尝试智能选择 X 轴和 Y 轴列
   */
  function autoInitChartConfig() {
    if (!dataset.value) return;
    
    const { columnTypes, headers } = dataset.value;
    
    // 尝试找到一个日期或字符串列作为 X 轴
    let xColumn = '';
    for (const header of headers) {
      const type = columnTypes[header];
      if (type === 'date') {
        xColumn = header;
        break;
      }
    }
    
    // 如果没有日期列，使用第一个字符串列
    if (!xColumn) {
      for (const header of headers) {
        if (columnTypes[header] === 'string') {
          xColumn = header;
          break;
        }
      }
    }
    
    // 如果还是没有，使用第一列
    if (!xColumn && headers.length > 0) {
      xColumn = headers[0];
    }
    
    // 尝试找到第一个数值列作为 Y 轴
    const yColumns: string[] = [];
    for (const header of headers) {
      if (columnTypes[header] === 'number') {
        yColumns.push(header);
        break; // 默认只选一个
      }
    }
    
    chartConfig.value = {
      ...chartConfig.value,
      xAxisColumn: xColumn,
      yAxisColumns: yColumns,
      title: dataset.value.fileName.replace(/\.csv$/i, ''),
    };
  }
  
  /**
   * 更新图表配置
   */
  function updateChartConfig(config: Partial<ChartConfiguration>) {
    chartConfig.value = {
      ...chartConfig.value,
      ...config,
    };
  }
  
  /**
   * 设置加载状态
   */
  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }
  
  /**
   * 设置错误信息
   */
  function setError(msg: string | null) {
    error.value = msg;
  }
  
  /**
   * 清除数据
   */
  function clearData() {
    dataset.value = null;
    chartConfig.value = {
      chartType: 'bar',
      xAxisColumn: '',
      yAxisColumns: [],
      title: '',
      highlightThreshold: HIGHLIGHT_CONFIG.DEFAULT_THRESHOLD,
    };
    error.value = null;
  }
  
  return {
    // State
    dataset,
    chartConfig,
    isLoading,
    error,
    // Getters
    hasData,
    headers,
    numericColumns,
    xAxisAvailableColumns,
    previewData,
    isChartConfigValid,
    getColumnType,
    // Actions
    setDataset,
    updateChartConfig,
    setLoading,
    setError,
    clearData,
  };
});
