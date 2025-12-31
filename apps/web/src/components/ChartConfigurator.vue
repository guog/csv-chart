<script setup lang="ts">
/**
 * 图表配置组件
 * 允许用户选择图表类型、X轴和Y轴列
 */
import { computed } from 'vue';
import { useChartStore } from '@/stores/chart';

const chartStore = useChartStore();

const chartConfig = computed(() => chartStore.chartConfig);
const xAxisColumns = computed(() => chartStore.xAxisAvailableColumns);
const yAxisColumns = computed(() => chartStore.numericColumns);
const allHeaders = computed(() => chartStore.headers);

/**
 * 更新图表类型
 */
const handleChartTypeChange = (type: 'bar' | 'line') => {
  chartStore.updateChartConfig({ chartType: type });
};

/**
 * 更新 X 轴列
 */
const handleXAxisChange = (column: string) => {
  chartStore.updateChartConfig({ xAxisColumn: column });
};

/**
 * 更新 Y 轴列
 */
const handleYAxisChange = (columns: string[]) => {
  chartStore.updateChartConfig({ yAxisColumns: columns });
};

/**
 * 更新图表标题
 */
const handleTitleChange = (title: string) => {
  chartStore.updateChartConfig({ title });
};
</script>

<template>
  <div class="chart-configurator">
    <el-form label-position="top" size="default">
      <!-- 图表类型 -->
      <el-form-item label="图表类型">
        <el-radio-group 
          :model-value="chartConfig.chartType" 
          @update:model-value="handleChartTypeChange"
        >
          <el-radio-button value="bar">
            <span class="chart-type-option">
              <svg class="chart-icon" viewBox="0 0 24 24" width="18" height="18">
                <rect x="3" y="10" width="4" height="10" fill="currentColor" rx="1"/>
                <rect x="10" y="5" width="4" height="15" fill="currentColor" rx="1"/>
                <rect x="17" y="8" width="4" height="12" fill="currentColor" rx="1"/>
              </svg>
              柱状图
            </span>
          </el-radio-button>
          <el-radio-button value="line">
            <span class="chart-type-option">
              <svg class="chart-icon" viewBox="0 0 24 24" width="18" height="18">
                <polyline 
                  points="3,17 8,10 13,14 21,5" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="3" cy="17" r="2" fill="currentColor"/>
                <circle cx="8" cy="10" r="2" fill="currentColor"/>
                <circle cx="13" cy="14" r="2" fill="currentColor"/>
                <circle cx="21" cy="5" r="2" fill="currentColor"/>
              </svg>
              折线图
            </span>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <div class="form-row">
        <!-- X 轴列 -->
        <el-form-item label="X 轴（分类/日期）" class="form-item-half">
          <el-select
            :model-value="chartConfig.xAxisColumn"
            @update:model-value="handleXAxisChange"
            placeholder="选择 X 轴列"
            style="width: 100%"
          >
            <el-option
              v-for="column in xAxisColumns"
              :key="column"
              :label="column"
              :value="column"
            >
              <span class="column-option">
                <span>{{ column }}</span>
                <span class="column-type-badge">
                  {{ chartStore.getColumnType(column) === 'date' ? '日期' : '文本' }}
                </span>
              </span>
            </el-option>
            <!-- 如果没有字符串/日期列，允许选择所有列 -->
            <template v-if="xAxisColumns.length === 0">
              <el-option
                v-for="column in allHeaders"
                :key="column"
                :label="column"
                :value="column"
              />
            </template>
          </el-select>
          <template v-if="xAxisColumns.length === 0">
            <p class="field-hint warning">未检测到日期或文本列，已显示所有列</p>
          </template>
        </el-form-item>

        <!-- Y 轴列 -->
        <el-form-item label="Y 轴（数值）" class="form-item-half">
          <el-select
            :model-value="chartConfig.yAxisColumns"
            @update:model-value="handleYAxisChange"
            placeholder="选择 Y 轴列（可多选）"
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%"
          >
            <el-option
              v-for="column in yAxisColumns"
              :key="column"
              :label="column"
              :value="column"
            />
            <!-- 如果没有数值列，允许选择所有列 -->
            <template v-if="yAxisColumns.length === 0">
              <el-option
                v-for="column in allHeaders"
                :key="column"
                :label="column"
                :value="column"
              />
            </template>
          </el-select>
          <template v-if="yAxisColumns.length === 0">
            <p class="field-hint warning">未检测到数值列，已显示所有列</p>
          </template>
        </el-form-item>
      </div>

      <!-- 图表标题 -->
      <el-form-item label="图表标题（可选）">
        <el-input
          :model-value="chartConfig.title"
          @update:model-value="handleTitleChange"
          placeholder="输入图表标题"
          clearable
        />
      </el-form-item>
    </el-form>

    <!-- 配置状态提示 -->
    <div v-if="!chartStore.isChartConfigValid" class="config-hint">
      <el-icon><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg></el-icon>
      <span>请选择 X 轴和至少一个 Y 轴列以生成图表</span>
    </div>
  </div>
</template>

<style scoped>
.chart-configurator {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-item-half {
  flex: 1;
}

.chart-type-option {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-icon {
  color: currentColor;
}

.column-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.column-type-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #909399;
}

.field-hint {
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
}

.field-hint.warning {
  color: #e6a23c;
}

.config-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fdf6ec;
  border-radius: 6px;
  color: #e6a23c;
  font-size: 13px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
