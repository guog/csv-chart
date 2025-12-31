/**
 * 图表服务
 * 将 Dataset 和 ChartConfiguration 转换为 ECharts 配置
 */

import type { Dataset, ChartConfiguration, ChartOption, ChartSeriesData } from '@/types/chart';

/**
 * 根据数据集和图表配置生成 ECharts 选项
 * @param dataset 数据集
 * @param config 图表配置
 * @returns ECharts 选项对象
 */
export function generateChartOption(
  dataset: Dataset,
  config: ChartConfiguration
): ChartOption {
  const { chartType, xAxisColumn, yAxisColumns, title } = config;
  const { data, columnTypes } = dataset;

  // 提取 X 轴数据
  const xAxisData = data
    .map(row => row[xAxisColumn])
    .filter(v => v !== null && v !== undefined)
    .map(v => String(v));

  // 过滤掉 X 轴值为空的行
  const validData = data.filter(row => {
    const xValue = row[xAxisColumn];
    return xValue !== null && xValue !== undefined && xValue !== '';
  });

  // 生成系列数据
  const series: ChartSeriesData[] = yAxisColumns.map(yColumn => {
    const seriesData = validData.map(row => {
      const value = row[yColumn];
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    });

    return {
      name: yColumn,
      type: chartType,
      data: seriesData,
    };
  });

  // 确定 X 轴类型
  const xAxisType = columnTypes[xAxisColumn] === 'date' ? 'category' : 'category';

  // 构建 ECharts 选项
  const option: ChartOption = {
    title: title
      ? {
          text: title,
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: yAxisColumns,
    },
    xAxis: {
      type: xAxisType,
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
    },
    series,
  };

  // 如果数据量较大，添加数据缩放
  if (validData.length > 50) {
    option.dataZoom = [
      {
        type: 'slider',
        xAxisIndex: 0,
      },
      {
        type: 'inside',
        xAxisIndex: 0,
      },
    ];
  }

  return option;
}

/**
 * 验证图表配置是否有效
 * @param dataset 数据集
 * @param config 图表配置
 * @returns { valid: boolean, message?: string }
 */
export function validateChartConfig(
  dataset: Dataset,
  config: ChartConfiguration
): { valid: boolean; message?: string } {
  const { xAxisColumn, yAxisColumns } = config;
  const { headers } = dataset;

  if (!xAxisColumn) {
    return { valid: false, message: '请选择 X 轴列' };
  }

  if (!headers.includes(xAxisColumn)) {
    return { valid: false, message: `X 轴列 "${xAxisColumn}" 不存在于数据中` };
  }

  if (yAxisColumns.length === 0) {
    return { valid: false, message: '请至少选择一个 Y 轴列' };
  }

  for (const yColumn of yAxisColumns) {
    if (!headers.includes(yColumn)) {
      return { valid: false, message: `Y 轴列 "${yColumn}" 不存在于数据中` };
    }
  }

  return { valid: true };
}
