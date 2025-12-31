<script setup lang="ts">
/**
 * 数据预览组件
 * 使用 el-table 显示 CSV 数据的前 10 行
 * 包含列类型指示器
 */
import { computed } from 'vue';
import { useChartStore } from '@/stores/chart';
import type { ColumnType } from '@/types/chart';

const chartStore = useChartStore();

const headers = computed(() => chartStore.headers);
const previewData = computed(() => chartStore.previewData);
const totalRows = computed(() => chartStore.dataset?.data.length ?? 0);

/**
 * 获取列类型标签
 */
const getTypeLabel = (type: ColumnType): string => {
  const labels: Record<ColumnType, string> = {
    string: '文本',
    number: '数值',
    date: '日期',
  };
  return labels[type] || '未知';
};

/**
 * 获取列类型样式
 */
const getTypeClass = (type: ColumnType): string => {
  const classes: Record<ColumnType, string> = {
    string: 'type-string',
    number: 'type-number',
    date: 'type-date',
  };
  return classes[type] || '';
};

/**
 * 格式化单元格值
 */
const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'number') {
    // 保留最多 4 位小数
    return Number.isInteger(value) ? value.toString() : value.toFixed(4).replace(/\.?0+$/, '');
  }
  return String(value);
};
</script>

<template>
  <div class="data-preview">
    <div class="preview-header">
      <span class="preview-info">
        显示前 {{ Math.min(10, totalRows) }} 行数据，共 {{ totalRows }} 行
      </span>
    </div>
    
    <el-table
      :data="previewData"
      stripe
      border
      size="small"
      class="preview-table"
      max-height="400"
    >
      <el-table-column
        v-for="header in headers"
        :key="header"
        :prop="header"
        :label="header"
        :min-width="120"
        show-overflow-tooltip
      >
        <template #header>
          <div class="column-header">
            <span class="column-name">{{ header }}</span>
            <span 
              class="column-type" 
              :class="getTypeClass(chartStore.getColumnType(header) || 'string')"
            >
              {{ getTypeLabel(chartStore.getColumnType(header) || 'string') }}
            </span>
          </div>
        </template>
        <template #default="{ row }">
          <span :class="{ 'null-value': row[header] === null }">
            {{ formatCellValue(row[header]) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="totalRows > 10" class="preview-footer">
      <span class="footer-hint">
        仅显示前 10 行预览数据，完整数据将用于图表生成
      </span>
    </div>
  </div>
</template>

<style scoped>
.data-preview {
  width: 100%;
}

.preview-header {
  margin-bottom: 12px;
}

.preview-info {
  font-size: 13px;
  color: #909399;
}

.preview-table {
  width: 100%;
}

.column-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.column-name {
  font-weight: 500;
  color: #303133;
}

.column-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.type-string {
  background: #f0f0f0;
  color: #606266;
}

.type-number {
  background: #ecf5ff;
  color: #409eff;
}

.type-date {
  background: #fdf6ec;
  color: #e6a23c;
}

.null-value {
  color: #c0c4cc;
  font-style: italic;
}

.preview-footer {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f4f4f5;
  border-radius: 4px;
}

.footer-hint {
  font-size: 12px;
  color: #909399;
}
</style>
