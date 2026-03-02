import request from '@/utils/request'
import type {
  Device,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  DeviceListParams,
  PaginatedResponse,
} from '@/types/device'

const BASE_URL = '/api/devices'

/**
 * 获取设备列表
 */
export function getDeviceList(params: DeviceListParams = {}): Promise<PaginatedResponse<Device>> {
  return request.get(BASE_URL, { params })
}

/**
 * 获取单个设备详情
 */
export function getDevice(id: string): Promise<Device> {
  return request.get(`${BASE_URL}/${id}`)
}

/**
 * 创建设备
 */
export function createDevice(data: CreateDeviceRequest): Promise<Device> {
  return request.post(BASE_URL, data)
}

/**
 * 更新设备
 */
export function updateDevice(id: string, data: UpdateDeviceRequest): Promise<Device> {
  return request.put(`${BASE_URL}/${id}`, data)
}

/**
 * 删除设备
 */
export function deleteDevice(id: string): Promise<void> {
  return request.delete(`${BASE_URL}/${id}`)
}

/**
 * 检查序列号是否已存在
 */
export function checkSerialNumber(
  serialNumber: string,
  excludeId?: string
): Promise<{ exists: boolean }> {
  return request.get(`${BASE_URL}/check-serial`, {
    params: { serialNumber, excludeId },
  })
}
