<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCounterStore } from '@/stores/counter'
import request from '@/utils/request'

const counterStore = useCounterStore()

const healthStatus = ref<string>('检查中...')
const healthLoading = ref(true)

// 检查后端健康状态
const checkHealth = async () => {
  healthLoading.value = true
  try {
    const response = await request.get('/health')
    healthStatus.value = response.data.status === 'ok' ? '✅ 服务正常' : '⚠️ 服务异常'
  } catch (error) {
    healthStatus.value = '❌ 无法连接'
  } finally {
    healthLoading.value = false
  }
}

onMounted(() => {
  checkHealth()
})
</script>

<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>🚀 欢迎使用 CSV Chart</span>
        </div>
      </template>

      <el-descriptions title="项目信息" :column="1" border>
        <el-descriptions-item label="前端框架">Vue 3 + TypeScript</el-descriptions-item>
        <el-descriptions-item label="UI 组件库">Element Plus</el-descriptions-item>
        <el-descriptions-item label="状态管理">Pinia</el-descriptions-item>
        <el-descriptions-item label="后端框架">Express + Prisma</el-descriptions-item>
        <el-descriptions-item label="后端状态">
          <el-tag v-if="healthLoading" type="info">检查中...</el-tag>
          <el-tag v-else :type="healthStatus.includes('正常') ? 'success' : 'danger'">
            {{ healthStatus }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>📊 Pinia 状态演示</span>
        </div>
      </template>

      <div class="counter-demo">
        <el-statistic title="当前计数" :value="counterStore.count" />
        <el-statistic title="双倍值" :value="counterStore.doubleCount" />
      </div>

      <div class="counter-actions">
        <el-button type="primary" @click="counterStore.increment">增加</el-button>
        <el-button type="danger" @click="counterStore.decrement">减少</el-button>
        <el-button @click="counterStore.reset">重置</el-button>
        <el-button type="success" :loading="healthLoading" @click="checkHealth">刷新状态</el-button>
      </div>
    </el-card>

    <div class="nav-links">
      <router-link to="/about">
        <el-button type="primary" link>前往关于页面 →</el-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.welcome-card,
.demo-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.counter-demo {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.counter-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-links {
  text-align: center;
  margin-top: 20px;
}
</style>
