<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDeviceStore } from '@/stores/device'
import { DeviceStatus, DeviceStatusLabel } from '@/types/device'
import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '@/types/device'
import { checkSerialNumber } from '@/api/device'

const deviceStore = useDeviceStore()

// 搜索关键字
const searchKeyword = ref('')

// 对话框状态
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogTitle = computed(() => (dialogMode.value === 'create' ? '新增设备' : '编辑设备'))

// 表单数据
const formData = ref<CreateDeviceRequest & { id?: string }>({
  name: '',
  model: '',
  serialNumber: '',
  status: DeviceStatus.IN_USE,
  purchaseDate: '',
  location: '',
  description: '',
})

// 表单验证
const formRules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { max: 100, message: '设备名称不能超过100个字符', trigger: 'blur' },
  ],
  serialNumber: [
    { required: true, message: '请输入序列号', trigger: 'blur' },
    { max: 100, message: '序列号不能超过100个字符', trigger: 'blur' },
  ],
}

// 序列号验证状态
const serialNumberChecking = ref(false)
const serialNumberExists = ref(false)

// 状态选项
const statusOptions = Object.entries(DeviceStatusLabel).map(([value, label]) => ({
  value,
  label,
}))

// 获取状态标签
function getStatusLabel(status: string) {
  return DeviceStatusLabel[status as DeviceStatus] || status
}

// 获取状态标签类型
function getStatusType(status: string) {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    [DeviceStatus.IN_USE]: 'success',
    [DeviceStatus.IDLE]: 'info',
    [DeviceStatus.REPAIRING]: 'warning',
    [DeviceStatus.SCRAPPED]: 'danger',
  }
  return typeMap[status] || 'info'
}

// 格式化日期
function formatDate(dateStr: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 加载设备列表
async function loadDevices() {
  try {
    await deviceStore.fetchDevices({
      keyword: searchKeyword.value,
    })
  } catch {
    ElMessage.error('加载设备列表失败')
  }
}

// 搜索
function handleSearch() {
  deviceStore.setKeyword(searchKeyword.value)
  loadDevices()
}

// 分页变化
function handlePageChange(page: number) {
  deviceStore.setPage(page)
  loadDevices()
}

// 每页数量变化
function handleSizeChange(size: number) {
  deviceStore.setPageSize(size)
  loadDevices()
}

// 打开新增对话框
function handleCreate() {
  dialogMode.value = 'create'
  formData.value = {
    name: '',
    model: '',
    serialNumber: '',
    status: DeviceStatus.IN_USE,
    purchaseDate: '',
    location: '',
    description: '',
  }
  serialNumberExists.value = false
  dialogVisible.value = true
}

// 打开编辑对话框
function handleEdit(device: Device) {
  dialogMode.value = 'edit'
  formData.value = {
    id: device.id,
    name: device.name,
    model: device.model || '',
    serialNumber: device.serialNumber,
    status: device.status,
    purchaseDate: device.purchaseDate ? device.purchaseDate.split('T')[0] : '',
    location: device.location || '',
    description: device.description || '',
  }
  serialNumberExists.value = false
  dialogVisible.value = true
}

// 检查序列号唯一性
async function checkSerial() {
  if (!formData.value.serialNumber.trim()) {
    serialNumberExists.value = false
    return
  }

  serialNumberChecking.value = true
  try {
    const result = await checkSerialNumber(
      formData.value.serialNumber,
      dialogMode.value === 'edit' ? formData.value.id : undefined
    )
    serialNumberExists.value = result.exists
  } catch {
    // 忽略检查错误
  } finally {
    serialNumberChecking.value = false
  }
}

// 保存设备
async function handleSave() {
  if (serialNumberExists.value) {
    ElMessage.warning('序列号已存在，请使用其他序列号')
    return
  }

  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入设备名称')
    return
  }

  if (!formData.value.serialNumber.trim()) {
    ElMessage.warning('请输入序列号')
    return
  }

  try {
    const data: CreateDeviceRequest | UpdateDeviceRequest = {
      name: formData.value.name.trim(),
      model: formData.value.model?.trim() || undefined,
      serialNumber: formData.value.serialNumber.trim(),
      status: formData.value.status,
      purchaseDate: formData.value.purchaseDate || undefined,
      location: formData.value.location?.trim() || undefined,
      description: formData.value.description?.trim() || undefined,
    }

    if (dialogMode.value === 'create') {
      await deviceStore.addDevice(data as CreateDeviceRequest)
      ElMessage.success('设备创建成功')
    } else {
      if (!formData.value.id) {
        ElMessage.error('设备ID不存在')
        return
      }
      await deviceStore.editDevice(formData.value.id, data)
      ElMessage.success('设备更新成功')
    }

    dialogVisible.value = false
    loadDevices()
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } } }
    if (err.response?.data?.error?.includes('序列号已存在')) {
      ElMessage.error('序列号已存在，请使用其他序列号')
    } else {
      ElMessage.error(dialogMode.value === 'create' ? '创建设备失败' : '更新设备失败')
    }
  }
}

// 删除设备
async function handleDelete(device: Device) {
  try {
    await ElMessageBox.confirm(`确定要删除设备"${device.name}"吗？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deviceStore.removeDevice(device.id)
    ElMessage.success('设备删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除设备失败')
    }
  }
}

// 监听搜索关键字变化（防抖搜索）
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchKeyword, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300)
})

// 组件挂载时加载数据
onMounted(() => {
  loadDevices()
})
</script>

<template>
  <div class="device-view">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h1>设备台账</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备名称、序列号、型号..."
          clearable
          style="width: 300px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增设备
        </el-button>
      </div>
    </div>

    <!-- 设备表格 -->
    <el-table
      v-loading="deviceStore.loading"
      :data="deviceStore.devices"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column prop="name" label="设备名称" min-width="150" />
      <el-table-column prop="serialNumber" label="序列号" min-width="150" />
      <el-table-column prop="model" label="型号" min-width="120">
        <template #default="{ row }">
          {{ row.model || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="存放位置" min-width="120">
        <template #default="{ row }">
          {{ row.location || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="purchaseDate" label="购置日期" width="120" align="center">
        <template #default="{ row }">
          {{ formatDate(row.purchaseDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="120" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)"> 编辑 </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="deviceStore.page"
        v-model:page-size="deviceStore.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="deviceStore.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="设备名称" prop="name" required>
          <el-input v-model="formData.name" placeholder="请输入设备名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="序列号" prop="serialNumber" required>
          <el-input
            v-model="formData.serialNumber"
            placeholder="请输入序列号"
            maxlength="100"
            @blur="checkSerial"
          />
          <div v-if="serialNumberChecking" class="form-tip">
            <el-icon class="is-loading"><Loading /></el-icon>
            检查中...
          </div>
          <div v-else-if="serialNumberExists" class="form-tip error">序列号已存在</div>
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="formData.model" placeholder="请输入型号" maxlength="100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="购置日期">
          <el-date-picker
            v-model="formData.purchaseDate"
            type="date"
            placeholder="请选择购置日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="formData.location" placeholder="请输入存放位置" maxlength="200" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            maxlength="500"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="deviceStore.loading"
          :disabled="serialNumberExists || serialNumberChecking"
          @click="handleSave"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.device-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.form-tip.error {
  color: var(--el-color-danger);
}
</style>
