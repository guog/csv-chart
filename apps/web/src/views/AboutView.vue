<script setup lang="ts">
// 关于页面
</script>

<template>
  <div class="about-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📖 关于项目</span>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item timestamp="技术栈" placement="top">
          <el-card>
            <h4>前端技术</h4>
            <p>Vue 3、TypeScript、Vite、Element Plus、Vue Router、Pinia</p>
          </el-card>
        </el-timeline-item>

        <el-timeline-item timestamp="后端" placement="top">
          <el-card>
            <h4>后端技术</h4>
            <p>Node.js、Express、TypeScript、Prisma ORM</p>
          </el-card>
        </el-timeline-item>

        <el-timeline-item timestamp="数据库" placement="top">
          <el-card>
            <h4>数据存储</h4>
            <p>开发环境: SQLite | 生产环境: PostgreSQL</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <div class="back-link">
        <router-link to="/">
          <el-button type="primary">← 返回首页</el-button>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.back-link {
  margin-top: 20px;
  text-align: center;
}
</style>
