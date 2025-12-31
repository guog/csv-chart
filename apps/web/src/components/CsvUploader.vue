<script setup lang="ts">
/**
 * CSV 文件上传组件
 * 使用 el-upload 进行文件选择
 * 验证文件大小和类型，解析 CSV 并存储到 Chart Store
 */
import { ref } from 'vue';
import { ElMessage, type UploadFile, type UploadRawFile } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { useChartStore } from '@/stores/chart';
import { parseCsvFile, validateCsvFile } from '@/services/csvParser';

const chartStore = useChartStore();

const uploading = ref(false);
const fileList = ref<UploadFile[]>([]);

/**
 * 处理文件上传前的验证
 */
const beforeUpload = (rawFile: UploadRawFile) => {
  const validation = validateCsvFile(rawFile);
  
  if (!validation.valid) {
    ElMessage.error(validation.message || '文件验证失败');
    return false;
  }
  
  return true;
};

/**
 * 处理文件变更（选择文件后）
 */
const handleChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return;
  
  // 验证文件
  const validation = validateCsvFile(uploadFile.raw);
  if (!validation.valid) {
    ElMessage.error(validation.message || '文件验证失败');
    fileList.value = [];
    return;
  }
  
  uploading.value = true;
  chartStore.setLoading(true);
  chartStore.setError(null);
  
  try {
    const dataset = await parseCsvFile(uploadFile.raw);
    chartStore.setDataset(dataset);
    
    ElMessage.success(`成功加载 ${dataset.data.length} 行数据`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '解析文件失败';
    chartStore.setError(errorMsg);
    ElMessage.error(errorMsg);
    fileList.value = [];
  } finally {
    uploading.value = false;
    chartStore.setLoading(false);
  }
};

/**
 * 清除已上传的文件
 */
const handleClear = () => {
  fileList.value = [];
  chartStore.clearData();
  ElMessage.info('已清除数据');
};
</script>

<template>
  <div class="csv-uploader">
    <el-upload
      v-model:file-list="fileList"
      class="upload-area"
      drag
      :auto-upload="false"
      :limit="1"
      accept=".csv"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :disabled="uploading"
    >
      <div class="upload-content">
        <el-icon class="upload-icon" :size="48">
          <UploadFilled />
        </el-icon>
        <div class="upload-text">
          <p class="primary-text">
            将 CSV 文件拖拽至此处，或<em>点击上传</em>
          </p>
          <p class="secondary-text">
            支持 .csv 格式，文件大小不超过 10MB
          </p>
        </div>
      </div>
    </el-upload>
    
    <!-- 已上传文件信息 -->
    <div v-if="chartStore.hasData" class="file-info">
      <div class="file-details">
        <span class="file-name">{{ chartStore.dataset?.fileName }}</span>
        <span class="file-meta">
          {{ (chartStore.dataset?.fileSize ?? 0 / 1024).toFixed(2) }} KB · 
          {{ chartStore.dataset?.data.length }} 行 · 
          {{ chartStore.dataset?.headers.length }} 列
        </span>
      </div>
      <el-button type="danger" plain size="small" @click="handleClear">
        清除数据
      </el-button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="uploading" class="loading-overlay">
      <el-icon class="loading-icon is-loading" :size="32">
        <svg viewBox="0 0 1024 1024">
          <path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 804a356 356 0 1 0 0-712 356 356 0 0 0 0 712z" fill="currentColor" opacity="0.2"/>
          <path d="M512 140a372 372 0 0 1 372 372h-64a308 308 0 0 0-308-308V140z" fill="currentColor"/>
        </svg>
      </el-icon>
      <span>正在解析文件...</span>
    </div>
  </div>
</template>

<style scoped>
.csv-uploader {
  position: relative;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 40px 20px;
  border-radius: 8px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: #c0c4cc;
}

.upload-text {
  text-align: center;
}

.primary-text {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.primary-text em {
  color: #409eff;
  font-style: normal;
}

.secondary-text {
  font-size: 12px;
  color: #909399;
  margin: 8px 0 0;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f9eb;
  border-radius: 6px;
  border: 1px solid #e1f3d8;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: #303133;
}

.file-meta {
  font-size: 12px;
  color: #67c23a;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 8px;
}

.loading-icon {
  color: #409eff;
}

.is-loading {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
