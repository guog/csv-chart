# 快速入门指南: Monorepo 项目脚手架

**Feature**: 001-monorepo-scaffold  
**Date**: 2025-12-31

## 前置要求

- Node.js >= 24.11
- pnpm >= 9.x

### 安装 pnpm (如尚未安装)

```bash
npm install -g pnpm
```

---

## 快速开始

### 1. 安装依赖

在项目根目录执行：

```bash
pnpm install
```

> 依赖将从阿里云镜像源 (https://registry.npmmirror.com) 下载

### 2. 初始化数据库 (后端)

```bash
# 进入后端目录
cd apps/server

# 生成 Prisma 客户端
pnpm prisma generate

# 创建数据库并执行迁移
pnpm prisma db push
```

### 3. 启动开发服务器

#### 方式一：同时启动前后端 (推荐)

```bash
# 在根目录执行
pnpm dev
```

#### 方式二：分别启动

```bash
# 启动后端 (端口 3000)
pnpm dev:server

# 新开终端，启动前端 (端口 5173)
pnpm dev:web
```

### 4. 访问应用

- **前端**: http://localhost:5173
- **后端健康检查**: http://localhost:3000/health

---

## 常用命令

### 根目录脚本

| 命令                | 说明                     |
| ------------------- | ------------------------ |
| `pnpm dev`          | 同时启动前后端开发服务器 |
| `pnpm dev:web`      | 仅启动前端开发服务器     |
| `pnpm dev:server`   | 仅启动后端开发服务器     |
| `pnpm build`        | 构建所有应用             |
| `pnpm format`       | 格式化所有代码           |
| `pnpm format:check` | 检查代码格式             |

### 前端命令 (apps/web)

```bash
cd apps/web

pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览生产构建
```

### 后端命令 (apps/server)

```bash
cd apps/server

pnpm dev          # 启动开发服务器 (热重载)
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm prisma studio  # 打开 Prisma 数据库管理界面
```

---

## 项目结构

```
csv-chart/
├── apps/
│   ├── web/                 # Vue 3 前端应用
│   │   ├── src/
│   │   │   ├── components/  # 通用组件
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── router/      # 路由配置
│   │   │   ├── stores/      # Pinia 状态
│   │   │   ├── services/    # API 服务
│   │   │   └── types/       # 类型定义
│   │   └── package.json
│   │
│   └── server/              # Express 后端应用
│       ├── src/
│       │   ├── controllers/ # 控制器
│       │   ├── services/    # 业务逻辑
│       │   ├── routes/      # 路由
│       │   └── middlewares/ # 中间件
│       ├── prisma/          # Prisma 配置
│       └── package.json
│
├── packages/                # 共享代码包 (按需添加)
├── package.json             # 工作区根配置
├── pnpm-workspace.yaml      # pnpm 工作区配置
└── .npmrc                   # npm 镜像源配置
```

---

## 添加新依赖

### 添加到特定应用

```bash
# 添加到前端
pnpm --filter @csv-chart/web add <package-name>

# 添加到后端
pnpm --filter @csv-chart/server add <package-name>
```

### 添加到根目录 (开发依赖)

```bash
pnpm add -Dw <package-name>
```

---

## 创建共享包

1. 在 `packages/` 目录创建新包：

```bash
mkdir -p packages/shared
cd packages/shared
pnpm init
```

2. 编辑 `packages/shared/package.json`：

```json
{
  "name": "@csv-chart/shared",
  "version": "0.0.1",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

3. 在其他应用中使用：

```bash
# 在前端或后端目录
pnpm add @csv-chart/shared
```

---

## 故障排查

### 依赖安装失败

1. 检查 Node.js 版本：`node -v` (需要 >= 24.11)
2. 清理缓存重试：`pnpm store prune && pnpm install`
3. 检查网络连接和镜像源配置

### 端口被占用

- 前端端口 5173：修改 `apps/web/vite.config.ts` 中的 `server.port`
- 后端端口 3000：修改 `apps/server/.env` 中的 `PORT`

### Prisma 问题

```bash
# 重新生成客户端
cd apps/server
pnpm prisma generate

# 重置数据库
pnpm prisma db push --force-reset
```

---

## 下一步

- 查看 [API 契约](contracts/api.yaml) 了解后端接口规范
- 查看 [数据模型](data-model.md) 了解数据库设计
- 查看 [实施计划](plan.md) 了解完整技术方案
