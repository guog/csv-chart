# Data Model: 设备台账管理 (Device Ledger)

**Feature**: 004-device-ledger | **Date**: 2026-03-02

## Entities

### Device (设备)

代表要跟踪的物理资产设备。

| Field          | Type      | Constraints               | Description        |
| -------------- | --------- | ------------------------- | ------------------ |
| `id`           | String    | PK, UUID, auto-generated  | 设备唯一标识       |
| `name`         | String    | NOT NULL                  | 设备名称           |
| `model`        | String    | nullable                  | 设备型号           |
| `serialNumber` | String    | NOT NULL, UNIQUE          | 序列号（全局唯一） |
| `status`       | String    | NOT NULL, default: IN_USE | 设备状态           |
| `purchaseDate` | DateTime  | nullable                  | 购买日期           |
| `location`     | String    | nullable                  | 设备位置（自由文本）|
| `description`  | String    | nullable                  | 设备描述           |
| `createdAt`    | DateTime  | NOT NULL, auto            | 创建时间           |
| `updatedAt`    | DateTime  | NOT NULL, auto            | 更新时间           |

### Status Enum (状态枚举)

应用层枚举，SQLite 存储为 String。

| Value         | Label    | Description          |
| ------------- | -------- | -------------------- |
| `IN_USE`      | 使用中   | 设备正在使用         |
| `STORAGE`     | 库存     | 设备在仓库中         |
| `MAINTENANCE` | 维修中   | 设备正在维修         |
| `SCRAPPED`    | 报废     | 设备已报废           |

## Prisma Schema

```prisma
/// 设备台账
model Device {
  id           String   @id @default(uuid())
  name         String
  model        String?
  serialNumber String   @unique
  status       String   @default("IN_USE")
  purchaseDate DateTime?
  location     String?
  description  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("devices")
}
```

## Validation Rules

### Creation (POST /api/devices)

| Field          | Rule                                                     |
| -------------- | -------------------------------------------------------- |
| `name`         | Required, string, 1-200 chars                            |
| `serialNumber` | Required, string, 1-100 chars, unique across all devices |
| `model`        | Optional, string, max 200 chars                          |
| `status`       | Optional, must be one of enum values, defaults to IN_USE |
| `purchaseDate` | Optional, valid ISO 8601 date string                     |
| `location`     | Optional, string, max 500 chars                          |
| `description`  | Optional, string, max 1000 chars                         |

### Update (PUT /api/devices/:id)

- Same rules as creation
- `serialNumber` uniqueness checked excluding current record
- All fields can be updated

### Deletion (DELETE /api/devices/:id)

- Hard delete (物理删除)
- Requires valid existing device ID
- Operation is irreversible

## Relationships

无外键关系。Device 是独立实体，MVP 阶段不与其他实体关联。

## State Transitions

```
IN_USE ←→ STORAGE
IN_USE ←→ MAINTENANCE
STORAGE ←→ MAINTENANCE
IN_USE → SCRAPPED
STORAGE → SCRAPPED
MAINTENANCE → SCRAPPED
```

> 注意：MVP 阶段不强制状态转换规则，允许任意状态变更。状态转换约束可在后续迭代中添加。

## Indexes

| Index            | Columns        | Type   | Purpose       |
| ---------------- | -------------- | ------ | ------------- |
| Primary Key      | `id`           | Unique | 主键          |
| Serial Number    | `serialNumber` | Unique | 序列号唯一查找 |
| (implicit)       | `createdAt`    | —      | 默认排序字段  |

> SQLite 在万级数据下，`name` 和 `serialNumber` 的 LIKE 查询性能可接受，暂不建索引。
