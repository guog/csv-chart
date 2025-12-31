<script setup lang="ts">
/**
 * 图表渲染组件
 * 使用 ECharts 渲染柱状图和折线图
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useChartStore } from '@/stores/chart';
import { generateChartOption, validateChartConfig } from '@/services/chartService';

const chartStore = useChartStore();

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const dataset = computed(() => chartStore.dataset);
const chartConfig = computed(() => chartStore.chartConfig);
const isConfigValid = computed(() => chartStore.isChartConfigValid);

/**
 * 初始化图表实例
 */
const initChart = () => {
  if (!chartContainer.value) return;
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartContainer.value);
  updateChart();
};

/**
 * 更新图表
 */
const updateChart = () => {
  if (!chartInstance || !dataset.value || !isConfigValid.value) return;
  
  // 验证配置
  const validation = validateChartConfig(dataset.value, chartConfig.value);
  if (!validation.valid) {
    console.warn('图表配置无效:', validation.message);
    return;
  }
  
  // 生成并设置图表选项
  const option = generateChartOption(dataset.value, chartConfig.value);
  chartInstance.setOption(option as echarts.EChartsOption, true);
};

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  chartInstance?.resize();
};

// 监听配置和数据变化
watch(
  [dataset, chartConfig],
  () => {
    if (chartInstance) {
      updateChart();
    }
  },
  { deep: true }
);

// 监听配置有效性变化
watch(isConfigValid, (valid) => {
  if (valid && chartInstance) {
    updateChart();
  }
});

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<template>
  <div class="chart-renderer">
    <div 
      ref="chartContainer" 
      class="chart-container"
      :class="{ 'chart-empty': !isConfigValid }"
    />
    
    <div v-if="!isConfigValid" class="chart-placeholder">
      <svg class="placeholder-icon" viewBox="0 0 64 64" width="64" height="64">
        <rect x="8" y="28" width="12" height="28" rx="2" fill="#e0e0e0"/>
        <rect x="26" y="16" width="12" height="40" rx="2" fill="#d0d0d0"/>
        <rect x="44" y="22" width="12" height="34" rx="2" fill="#e0e0e0"/>
      </svg>
      <p class="placeholder-text">完成配置后，图表将在此显示</p>
    </div>
  </div>
</template>

<style scoped>
.chart-renderer {
  position: relative;
  width: 100%;
  min-height: 400px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.chart-container.chart-empty {
  visibility: hidden;
}

.chart-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

.placeholder-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.placeholder-text {
  color: #909399;
  font-size: 14px;
  margin: 0;
}
</style>
