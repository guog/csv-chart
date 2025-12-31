# Data Model: Monorepo 项目脚手架

**Feature**: 001-monorepo-scaffold  
**Date**: 2025-12-31

## 概述

本功能主要是项目脚手架生成，数据模型相对简单。后端初始化时需要一个基础的 Prisma 模型作为示例。

## 实体定义

### 1. 项目配置实体

这些是配置文件中的逻辑实体，非数据库存储。

#### WorkspaceConfig (pnpm-workspace.yaml)

| 属性     | 类型     | 说明             |
| -------- | -------- | ---------------- |
| packages | string[] | 工作区包路径模式 |

#### PackageJson (package.json)

| 属性            | 类型   | 说明             |
| --------------- | ------ | ---------------- |
| name            | string | 包名称           |
| version         | string | 版本号           |
| scripts         | object | npm 脚本         |
| dependencies    | object | 生产依赖         |
| devDependencies | object | 开发依赖         |
| engines         | object | Node.js 版本要求 |

#### NpmConfig (.npmrc)

| 属性     | 类型   | 说明           |
| -------- | ------ | -------------- |
| registry | string | npm 镜像源地址 |

---

## 数据库模型 (Prisma Schema)

后端应用初始化时包含一个示例模型，用于验证 Prisma 配置正确。

### Example 模型 (示例)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

/// 示例模型 - 可根据业务需求修改或删除
model Example {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 字段说明

| 字段      | 类型     | 约束                  | 说明                 |
| --------- | -------- | --------------------- | -------------------- |
| id        | String   | @id, @default(cuid()) | 主键，使用 CUID 生成 |
| name      | String   | 必填                  | 名称字段             |
| createdAt | DateTime | @default(now())       | 创建时间             |
| updatedAt | DateTime | @updatedAt            | 更新时间             |

---

## 环境变量

### 后端 (.env)

```ini
# 数据库连接 (开发环境使用 SQLite)
DATABASE_URL="file:./dev.db"

# 服务端口
PORT=3000
```

### 前端 (.env)

```ini
# API 基础地址
VITE_API_BASE_URL=http://localhost:3000
```

---

## 类型定义

### 前端类型 (apps/web/src/types/)

```typescript
// api.ts - API 响应通用类型
export interface ApiResponse<T> {
  code: number
  message: string
  data?: T
}

// example.ts - 示例实体类型
export interface Example {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
```

### 后端类型 (apps/server/src/types/)

```typescript
// express.d.ts - Express 扩展类型
import { Request, Response, NextFunction } from 'express'

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

// api.ts - API 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}
```

---

## 关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Monorepo Root                            │
├─────────────────────────────────────────────────────────────────┤
│  package.json          - 工作区脚本                              │
│  pnpm-workspace.yaml   - 工作区配置                              │
│  .npmrc                - 镜像源配置                              │
│  tsconfig.base.json    - TypeScript 基础配置                     │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
    ┌───────────▼───────────┐       ┌─────────────▼─────────────┐
    │      apps/web         │       │       apps/server         │
    ├───────────────────────┤       ├───────────────────────────┤
    │  Vue 3 前端应用        │       │  Express 后端应用          │
    │  - Vue Router         │◄─────►│  - Prisma ORM             │
    │  - Pinia              │  API  │  - SQLite (dev)           │
    │  - Element-plus       │       │  - PostgreSQL (prod)      │
    │  - axios              │       │                           │
    └───────────────────────┘       └───────────────────────────┘
```

---

## 验证规则

### 后端验证 (示例)

| 字段 | 规则                  |
| ---- | --------------------- |
| name | 必填，长度 1-100 字符 |

### 前端验证 (示例)

使用 Element-plus Form 表单验证规则。

---

## 状态转换

本脚手架功能不涉及复杂状态转换。后续业务开发时可在此基础上扩展。
