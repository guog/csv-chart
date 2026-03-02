import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Device, DeviceListParams, PaginatedResponse } from '@/types/device'
import { getDeviceList, getDevice, createDevice, updateDevice, deleteDevice } from '@/api/device'
import type { CreateDeviceRequest, UpdateDeviceRequest } from '@/types/device'

export const useDeviceStore = defineStore('device', () => {
  // 状态
  const devices = ref<Device[]>([])
  const currentDevice = ref<Device | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')

  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const isEmpty = computed(() => devices.value.length === 0 && !loading.value)

  // 获取设备列表
  async function fetchDevices(params: DeviceListParams = {}) {
    loading.value = true
    try {
      const queryParams: DeviceListParams = {
        page: params.page ?? page.value,
        pageSize: params.pageSize ?? pageSize.value,
        keyword: params.keyword ?? keyword.value,
      }

      const response: PaginatedResponse<Device> = await getDeviceList(queryParams)
      devices.value = response.data
      total.value = response.total
      page.value = response.page
      pageSize.value = response.pageSize
    } catch (error) {
      console.error('获取设备列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取单个设备
  async function fetchDevice(id: string) {
    loading.value = true
    try {
      currentDevice.value = await getDevice(id)
      return currentDevice.value
    } catch (error) {
      console.error('获取设备详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建设备
  async function addDevice(data: CreateDeviceRequest) {
    loading.value = true
    try {
      const device = await createDevice(data)
      // 刷新列表
      await fetchDevices()
      return device
    } catch (error) {
      console.error('创建设备失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新设备
  async function editDevice(id: string, data: UpdateDeviceRequest) {
    loading.value = true
    try {
      const device = await updateDevice(id, data)
      // 更新列表中的设备
      const index = devices.value.findIndex(d => d.id === id)
      if (index !== -1) {
        devices.value[index] = device
      }
      if (currentDevice.value?.id === id) {
        currentDevice.value = device
      }
      return device
    } catch (error) {
      console.error('更新设备失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除设备
  async function removeDevice(id: string) {
    loading.value = true
    try {
      await deleteDevice(id)
      // 刷新列表
      await fetchDevices()
    } catch (error) {
      console.error('删除设备失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 设置搜索关键字
  function setKeyword(value: string) {
    keyword.value = value
    page.value = 1 // 重置到第一页
  }

  // 设置分页
  function setPage(value: number) {
    page.value = value
  }

  function setPageSize(value: number) {
    pageSize.value = value
    page.value = 1 // 重置到第一页
  }

  // 重置状态
  function reset() {
    devices.value = []
    currentDevice.value = null
    total.value = 0
    page.value = 1
    pageSize.value = 10
    keyword.value = ''
  }

  return {
    // 状态
    devices,
    currentDevice,
    loading,
    total,
    page,
    pageSize,
    keyword,
    // 计算属性
    totalPages,
    isEmpty,
    // 方法
    fetchDevices,
    fetchDevice,
    addDevice,
    editDevice,
    removeDevice,
    setKeyword,
    setPage,
    setPageSize,
    reset,
  }
})
