<script setup lang="ts">
/**
 * CSV 图表可视化主视图
 * 整合上传、预览和图表渲染功能
 */
import { computed } from 'vue';
import { useChartStore } from '@/stores/chart';
import CsvUploader from '@/components/CsvUploader.vue';
import DataPreview from '@/components/DataPreview.vue';
import ChartConfigurator from '@/components/ChartConfigurator.vue';
import ChartRenderer from '@/components/ChartRenderer.vue';

const chartStore = useChartStore();

const hasData = computed(() => chartStore.hasData);
const isChartReady = computed(() => chartStore.isChartConfigValid);
</script>

<template>
  <div class="visualization-view">
    <header class="view-header">
      <h1>CSV 图表可视化</h1>
      <p class="subtitle">上传 CSV 文件，快速生成可视化图表</p>
    </header>

    <main class="view-content">
      <!-- 步骤 1: 上传 CSV 文件 -->
      <section class="step-section">
        <div class="step-header">
          <span class="step-number">1</span>
          <h2>上传文件</h2>
        </div>
        <CsvUploader />
      </section>

      <!-- 步骤 2: 数据预览 (有数据时显示) -->
      <section v-if="hasData" class="step-section">
        <div class="step-header">
          <span class="step-number">2</span>
          <h2>数据预览</h2>
        </div>
        <DataPreview />
      </section>

      <!-- 步骤 3: 图表配置 (有数据时显示) -->
      <section v-if="hasData" class="step-section">
        <div class="step-header">
          <span class="step-number">3</span>
          <h2>配置图表</h2>
        </div>
        <ChartConfigurator />
      </section>

      <!-- 步骤 4: 图表展示 (配置完成时显示) -->
      <section v-if="isChartReady" class="step-section chart-section">
        <div class="step-header">
          <span class="step-number">4</span>
          <h2>图表展示</h2>
        </div>
        <ChartRenderer />
      </section>
    </main>
  </div>
</template>

<style scoped>
.visualization-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.view-header {
  text-align: center;
  margin-bottom: 32px;
}

.view-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.step-header h2 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.chart-section {
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .visualization-view {
    padding: 16px;
  }
  
  .view-header h1 {
    font-size: 22px;
  }
  
  .step-section {
    padding: 16px;
  }
}
</style>
