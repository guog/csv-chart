/**
 * 图表服务
 * 将 Dataset 和 ChartConfiguration 转换为 ECharts 配置
 */

import type { Dataset, ChartConfiguration, ChartOption, ChartSeriesData, ChartDataItem } from '@/types/chart';
import { HIGHLIGHT_CONFIG } from '@/types/chart';

/**
 * 应用高亮样式到数据点
 * @param value 数值
 * @param threshold 高亮阈值
 * @param chartType 图表类型
 * @returns 带样式的数据项
 */
export function applyHighlightStyle(
  value: number | null,
  threshold: number | null,
  chartType: 'bar' | 'line'
): number | null | ChartDataItem {
  // 如果没有阈值或值为空，返回原始值
  if (threshold === null || value === null) {
    return value;
  }

  const isHighlighted = value >= threshold;

  if (chartType === 'bar') {
    return {
      value,
      itemStyle: {
        color: isHighlighted ? HIGHLIGHT_CONFIG.HIGHLIGHT_COLOR : HIGHLIGHT_CONFIG.NORMAL_COLOR,
      },
    };
  }

  // 折线图
  return {
    value,
    itemStyle: {
      color: isHighlighted ? HIGHLIGHT_CONFIG.HIGHLIGHT_COLOR : HIGHLIGHT_CONFIG.NORMAL_COLOR,
    },
    symbolSize: isHighlighted ? HIGHLIGHT_CONFIG.HIGHLIGHT_SYMBOL_SIZE : HIGHLIGHT_CONFIG.NORMAL_SYMBOL_SIZE,
  };
}

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
  const { chartType, xAxisColumn, yAxisColumns, title, highlightThreshold } = config;
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

  // 生成系列数据（带高亮样式）
  const series: ChartSeriesData[] = yAxisColumns.map(yColumn => {
    const seriesData = validData.map(row => {
      const value = row[yColumn];
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return null;
      }
      // 应用高亮样式
      return applyHighlightStyle(numValue, highlightThreshold, chartType);
    });

    const seriesItem: ChartSeriesData = {
      name: yColumn,
      type: chartType,
      data: seriesData,
    };

    // 折线图始终显示数据点标记（以便高亮可见）
    if (chartType === 'line' && highlightThreshold !== null) {
      seriesItem.showSymbol = true;
    }

    return seriesItem;
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
      formatter: (params: unknown) => {
        // params 可能是数组或单个对象
        const items = Array.isArray(params) ? params : [params];
        if (items.length === 0) return '';

        // 获取 X 轴值
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const xValue = (items[0] as any)?.axisValue || '';
        let html = `<div style="font-weight: bold; margin-bottom: 6px;">${xValue}</div>`;

        for (const item of items) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const i = item as any;
          const seriesName = i.seriesName || '';
          const color = i.color || '#409EFF';
          // 获取原始值
          let value = i.value;
          // 如果 value 是对象（带样式），提取实际值
          if (typeof value === 'object' && value !== null && 'value' in value) {
            value = value.value;
          }

          // 检查是否超出阈值
          const isHighlighted = highlightThreshold !== null && typeof value === 'number' && value >= highlightThreshold;
          const warningBadge = isHighlighted ? ' <span style="color: #F56C6C;">⚠️ 超出阈值</span>' : '';

          html += `<div style="margin: 4px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 6px;"></span>
            ${seriesName}: <strong>${value ?? '-'}</strong>${warningBadge}
          </div>`;
        }

        return html;
      },
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
