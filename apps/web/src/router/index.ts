import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // 路由懒加载
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/visualization',
      name: 'visualization',
      // CSV 图表可视化页面
      component: () => import('@/views/VisualizationView.vue'),
    },
  ],
})

export default router
