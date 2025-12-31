# CSV Chart

一个基于 pnpm Monorepo 的全栈 Web 应用项目。

## 技术栈

### 前端 (apps/web)

- Vue 3 + TypeScript
- Vite 构建工具
- Element-plus UI 组件库
- Vue Router 路由管理
- Pinia 状态管理
- axios HTTP 请求

### 后端 (apps/server)

- Node.js + TypeScript
- Express Web 框架
- Prisma ORM
- SQLite (开发) / PostgreSQL (生产)

## 前置要求

- Node.js >= 24.11
- pnpm >= 9.0.0

## 快速开始

```bash
# 安装依赖
pnpm install

# 初始化数据库 (首次运行)
cd apps/server
pnpm prisma generate
pnpm prisma db push
cd ../..

# 启动开发服务器
pnpm dev
```

## 访问地址

- 前端: http://localhost:5173
- 后端: http://localhost:3000
- 健康检查: http://localhost:3000/health

## 项目结构

```
csv-chart/
├── apps/
│   ├── web/          # Vue 3 前端应用
│   └── server/       # Express 后端应用
├── packages/         # 共享代码包
├── specs/            # 规格文档
└── package.json      # 根配置
```

## 常用命令

| 命令              | 说明                     |
| ----------------- | ------------------------ |
| `pnpm dev`        | 同时启动前后端开发服务器 |
| `pnpm dev:web`    | 仅启动前端               |
| `pnpm dev:server` | 仅启动后端               |
| `pnpm build`      | 构建所有应用             |
| `pnpm format`     | 格式化代码               |

## License

MIT
