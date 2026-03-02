# Quickstart: 设备台账管理 (Device Ledger)

**Feature**: 004-device-ledger | **Date**: 2026-03-02

## 前置条件

- Node.js >= 24.11
- pnpm >= 9.0.0
- 项目已完成 `001-monorepo-scaffold` 的搭建

## 快速启动

```bash
# 1. 切换到功能分支
git checkout 004-device-ledger

# 2. 安装依赖
pnpm install

# 3. 生成 Prisma 客户端 + 执行数据库迁移
cd apps/server
npx prisma generate
npx prisma migrate dev --name add-device-model
cd ../..

# 4. 启动开发服务器 (前后端并行)
pnpm dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3000
- 设备管理页面: http://localhost:5173/#/devices (或 /devices)

## API 快速验证

```bash
# 健康检查
curl http://localhost:3000/health

# 创建设备
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "空调机组 A-01",
    "serialNumber": "SN-2026-0001",
    "model": "格力 KFR-72LW",
    "status": "IN_USE",
    "location": "3号楼 B区 2层"
  }'

# 获取设备列表 (分页)
curl "http://localhost:3000/api/devices?page=1&pageSize=20"

# 搜索设备
curl "http://localhost:3000/api/devices?search=空调"

# 获取单个设备
curl http://localhost:3000/api/devices/{id}

# 更新设备
curl -X PUT http://localhost:3000/api/devices/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "空调机组 A-01",
    "serialNumber": "SN-2026-0001",
    "status": "MAINTENANCE",
    "location": "维修车间"
  }'

# 删除设备
curl -X DELETE http://localhost:3000/api/devices/{id}
```

## 运行测试

```bash
# 全部测试
pnpm test

# 仅后端测试
pnpm test:server

# 仅前端测试
pnpm test:web
```

## 关键文件

| 文件                                      | 说明             |
| ----------------------------------------- | ---------------- |
| `apps/server/prisma/schema.prisma`        | Device 数据模型  |
| `apps/server/src/routes/devices.ts`       | 设备 CRUD API    |
| `apps/web/src/views/DeviceView.vue`       | 设备管理页面     |
| `apps/web/src/stores/device.ts`           | 设备 Pinia Store |
| `apps/web/src/types/device.ts`            | 设备类型定义     |
| `specs/004-device-ledger/contracts/api.yaml` | API 契约文档  |

## 状态枚举参考

| 值            | 中文   | 说明         |
| ------------- | ------ | ------------ |
| `IN_USE`      | 使用中 | 设备正在使用 |
| `STORAGE`     | 库存   | 设备在仓库中 |
| `MAINTENANCE` | 维修中 | 设备正在维修 |
| `SCRAPPED`    | 报废   | 设备已报废   |
