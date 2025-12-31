import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const examplesRouter = Router()

// 获取所有示例
examplesRouter.get('/', async (_req, res) => {
  try {
    const examples = await prisma.example.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ data: examples })
  } catch (error) {
    console.error('获取示例列表失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

// 获取单个示例
examplesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const example = await prisma.example.findUnique({
      where: { id },
    })

    if (!example) {
      return res.status(404).json({ error: '示例不存在' })
    }

    res.json({ data: example })
  } catch (error) {
    console.error('获取示例失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

// 创建示例
examplesRouter.post('/', async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name 字段是必需的' })
    }

    const example = await prisma.example.create({
      data: {
        name,
        description: description || null,
      },
    })

    res.status(201).json({ data: example })
  } catch (error) {
    console.error('创建示例失败:', error)
    res.status(500).json({ error: '创建数据失败' })
  }
})
