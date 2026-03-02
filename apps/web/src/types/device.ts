/**
 * 设备状态枚举
 */
export enum DeviceStatus {
  /** 在用 */
  IN_USE = 'IN_USE',
  /** 闲置 */
  IDLE = 'IDLE',
  /** 维修中 */
  REPAIRING = 'REPAIRING',
  /** 已报废 */
  SCRAPPED = 'SCRAPPED',
}

/**
 * 设备状态显示文本映射
 */
export const DeviceStatusLabel: Record<DeviceStatus, string> = {
  [DeviceStatus.IN_USE]: '在用',
  [DeviceStatus.IDLE]: '闲置',
  [DeviceStatus.REPAIRING]: '维修中',
  [DeviceStatus.SCRAPPED]: '已报废',
}

/**
 * 设备实体接口
 */
export interface Device {
  id: string
  name: string
  model: string | null
  serialNumber: string
  status: DeviceStatus
  purchaseDate: string | null
  location: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

/**
 * 创建设备请求参数
 */
export interface CreateDeviceRequest {
  name: string
  model?: string
  serialNumber: string
  status?: DeviceStatus
  purchaseDate?: string
  location?: string
  description?: string
}

/**
 * 更新设备请求参数
 */
export interface UpdateDeviceRequest {
  name?: string
  model?: string
  serialNumber?: string
  status?: DeviceStatus
  purchaseDate?: string
  location?: string
  description?: string
}

/**
 * 设备列表查询参数
 */
export interface DeviceListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
