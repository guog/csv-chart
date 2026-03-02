import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { examplesRouter } from './routes/examples.js'
import { devicesRouter } from './routes/devices.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/health', healthRouter)
app.use('/api/examples', examplesRouter)
app.use('/api/devices', devicesRouter)

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/health`)
  console.log(`📝 API 端点: http://localhost:${PORT}/api/examples`)
  console.log(`📱 设备管理: http://localhost:${PORT}/api/devices`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})
