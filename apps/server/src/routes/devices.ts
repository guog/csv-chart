import { Router } from 'express'
import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export const devicesRouter: ReturnType<typeof Router> = Router()

// 设备状态枚举验证
const VALID_STATUSES = ['IN_USE', 'IDLE', 'REPAIRING', 'SCRAPPED']

/**
 * 获取设备列表 (带分页和搜索)
 * GET /api/devices?page=1&pageSize=10&keyword=xxx
 */
devicesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 10))
    const keyword = (req.query.keyword as string)?.trim() || ''

    const skip = (page - 1) * pageSize
    const take = pageSize

    // 构建搜索条件
    const where: Prisma.DeviceWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { serialNumber: { contains: keyword } },
            { model: { contains: keyword } },
            { location: { contains: keyword } },
          ],
        }
      : {}

    // 并行查询数据和总数
    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ])

    res.json({
      data: devices,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('获取设备列表失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

/**
 * 检查序列号是否存在
 * GET /api/devices/check-serial?serialNumber=xxx&excludeId=xxx
 */
devicesRouter.get('/check-serial', async (req: Request, res: Response) => {
  try {
    const serialNumber = (req.query.serialNumber as string)?.trim()
    const excludeId = req.query.excludeId as string

    if (!serialNumber) {
      return res.status(400).json({ error: '序列号不能为空' })
    }

    const where: Prisma.DeviceWhereInput = {
      serialNumber,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    }

    const existing = await prisma.device.findFirst({ where })
    res.json({ exists: !!existing })
  } catch (error) {
    console.error('检查序列号失败:', error)
    res.status(500).json({ error: '检查序列号失败' })
  }
})

/**
 * 获取单个设备
 * GET /api/devices/:id
 */
devicesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const device = await prisma.device.findUnique({
      where: { id },
    })

    if (!device) {
      return res.status(404).json({ error: '设备不存在' })
    }

    res.json(device)
  } catch (error) {
    console.error('获取设备失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

/**
 * 创建设备
 * POST /api/devices
 */
devicesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, model, serialNumber, status, purchaseDate, location, description } = req.body

    // 验证必填字段
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: '设备名称不能为空' })
    }

    if (!serialNumber || typeof serialNumber !== 'string' || !serialNumber.trim()) {
      return res.status(400).json({ error: '序列号不能为空' })
    }

    // 验证状态值
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `无效的状态值，可选值: ${VALID_STATUSES.join(', ')}` })
    }

    // 验证序列号长度
    if (serialNumber.trim().length > 100) {
      return res.status(400).json({ error: '序列号长度不能超过100个字符' })
    }

    const device = await prisma.device.create({
      data: {
        name: name.trim(),
        model: model?.trim() || null,
        serialNumber: serialNumber.trim(),
        status: status || 'IN_USE',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        location: location?.trim() || null,
        description: description?.trim() || null,
      },
    })

    res.status(201).json(device)
  } catch (error) {
    // 处理唯一约束冲突
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: '序列号已存在，请使用其他序列号' })
    }
    console.error('创建设备失败:', error)
    res.status(500).json({ error: '创建设备失败' })
  }
})

/**
 * 更新设备
 * PUT /api/devices/:id
 */
devicesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, model, serialNumber, status, purchaseDate, location, description } = req.body

    // 检查设备是否存在
    const existing = await prisma.device.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: '设备不存在' })
    }

    // 验证状态值
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `无效的状态值，可选值: ${VALID_STATUSES.join(', ')}` })
    }

    // 验证序列号长度
    if (serialNumber && serialNumber.trim().length > 100) {
      return res.status(400).json({ error: '序列号长度不能超过100个字符' })
    }

    // 构建更新数据
    const updateData: Prisma.DeviceUpdateInput = {}
    if (name !== undefined) updateData.name = name.trim()
    if (model !== undefined) updateData.model = model?.trim() || null
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber.trim()
    if (status !== undefined) updateData.status = status
    if (purchaseDate !== undefined)
      updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : null
    if (location !== undefined) updateData.location = location?.trim() || null
    if (description !== undefined) updateData.description = description?.trim() || null

    const device = await prisma.device.update({
      where: { id },
      data: updateData,
    })

    res.json(device)
  } catch (error) {
    // 处理唯一约束冲突
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: '序列号已存在，请使用其他序列号' })
    }
    console.error('更新设备失败:', error)
    res.status(500).json({ error: '更新设备失败' })
  }
})

/**
 * 删除设备 (硬删除)
 * DELETE /api/devices/:id
 */
devicesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 检查设备是否存在
    const existing = await prisma.device.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: '设备不存在' })
    }

    await prisma.device.delete({ where: { id } })

    res.status(204).send()
  } catch (error) {
    console.error('删除设备失败:', error)
    res.status(500).json({ error: '删除设备失败' })
  }
})
