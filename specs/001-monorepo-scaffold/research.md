# Research: Monorepo 项目脚手架

**Feature**: 001-monorepo-scaffold  
**Date**: 2025-12-31  
**Status**: Complete

## 研究任务

本阶段解决技术上下文中的所有待澄清项，为 Phase 1 设计提供依据。

---

## 1. pnpm Monorepo 最佳实践

### 决策

采用 pnpm workspace 作为 Monorepo 管理工具。

### 理由

- **磁盘效率**: pnpm 使用硬链接，节省 50%+ 磁盘空间
- **依赖隔离**: 严格的依赖解析，避免幽灵依赖
- **性能优势**: 安装速度比 npm/yarn 快 2-3 倍
- **Workspace 支持**: 原生支持 monorepo，无需额外工具

### 评估过的替代方案

| 方案            | 优点     | 放弃原因               |
| --------------- | -------- | ---------------------- |
| npm workspaces  | 原生支持 | 依赖安装慢，磁盘占用大 |
| yarn workspaces | 成熟稳定 | pnpm 性能更优          |
| Turborepo       | 构建缓存 | 对脚手架场景过于复杂   |
| Nx              | 功能丰富 | 学习曲线陡峭，配置繁重 |

### 配置要点

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 2. Vue 3 + Vite 项目结构

### 决策

采用 Vite 官方推荐的 Vue 3 项目结构，结合 Element-plus 按需导入。

### 理由

- **开发体验**: Vite 冷启动 < 1s，HMR 即时生效
- **生态成熟**: Vue 3 + Vite 是当前 Vue 生态主流选择
- **按需导入**: Element-plus 支持自动按需导入，减小打包体积

### 目录结构决策

```
src/
├── assets/       # 静态资源 (图片、字体等)
├── components/   # 可复用组件
├── layouts/      # 布局组件
├── pages/        # 页面组件 (路由视图)
├── router/       # Vue Router 配置
├── stores/       # Pinia 状态管理
├── services/     # API 请求服务
├── types/        # TypeScript 类型定义
├── App.vue       # 根组件
└── main.ts       # 入口文件
```

### 核心依赖版本

| 依赖         | 版本   | 说明       |
| ------------ | ------ | ---------- |
| vue          | ^3.5.x | Vue 3 核心 |
| vite         | ^6.x   | 构建工具   |
| typescript   | ^5.x   | 类型系统   |
| element-plus | ^2.9.x | UI 组件库  |
| vue-router   | ^4.5.x | 路由管理   |
| pinia        | ^2.3.x | 状态管理   |
| axios        | ^1.7.x | HTTP 请求  |

---

## 3. Express + TypeScript 后端结构

### 决策

采用经典的分层架构 (Controller-Service-Model)，配合 Prisma ORM。

### 理由

- **分层清晰**: 职责分明，易于维护和测试
- **Express 成熟**: 社区资源丰富，问题易排查
- **Prisma 类型安全**: 自动生成 TypeScript 类型

### 目录结构决策

```
src/
├── controllers/  # 处理 HTTP 请求/响应
├── services/     # 业务逻辑
├── models/       # 数据模型 (Prisma 生成)
├── routes/       # 路由定义
├── middlewares/  # Express 中间件
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数
└── index.ts      # 入口文件

prisma/
└── schema.prisma # 数据库模型定义
```

### 核心依赖版本

| 依赖           | 版本    | 说明                     |
| -------------- | ------- | ------------------------ |
| express        | ^4.21.x | Web 框架                 |
| typescript     | ^5.x    | 类型系统                 |
| prisma         | ^6.x    | ORM 工具                 |
| @prisma/client | ^6.x    | Prisma 客户端            |
| tsx            | ^4.x    | TypeScript 运行时 (开发) |

---

## 4. 阿里云镜像源配置

### 决策

在 .npmrc 中配置阿里云 npm 镜像源。

### 理由

- **国内加速**: 显著提升依赖安装速度
- **稳定可靠**: 阿里云镜像同步及时，可用性高
- **透明替换**: 无需修改代码，仅配置即可

### 配置内容

```ini
# .npmrc
registry=https://registry.npmmirror.com
```

### 备注

- 阿里云镜像源不可用时，开发者可临时注释该配置
- 发布到 npm 时需使用官方 registry

---

## 5. 代码质量工具配置

### 决策

使用 Prettier 进行代码格式化，暂不引入 ESLint。

### 理由

- **简化配置**: Prettier 开箱即用，配置简单
- **最小必要**: 脚手架阶段保持简洁，后续按需添加 ESLint
- **IDE 支持**: 主流 IDE 均良好支持 Prettier

### 配置内容

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## 6. TypeScript 配置策略

### 决策

根目录提供 tsconfig.base.json，子项目通过 extends 继承并覆盖。

### 理由

- **配置复用**: 避免重复配置，统一基础规则
- **灵活覆盖**: 前后端可根据需要调整特定配置
- **路径映射**: 各项目独立配置路径别名

### 配置层次

```
tsconfig.base.json          # 基础配置 (strict, module 等)
├── apps/web/tsconfig.json  # 前端配置 (Vue, DOM 类型)
└── apps/server/tsconfig.json # 后端配置 (Node 类型)
```

---

## 7. 开发脚本设计

### 决策

根目录 package.json 提供统一的开发脚本。

### 脚本设计

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "dev:web": "pnpm --filter @csv-chart/web dev",
    "dev:server": "pnpm --filter @csv-chart/server dev",
    "build": "pnpm -r run build",
    "format": "prettier --write \"**/*.{ts,tsx,vue,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,vue,json,md}\""
  }
}
```

---

## 研究结论

所有技术决策已完成，无待澄清项。可进入 Phase 1 设计阶段。

| 领域          | 决策                        | 状态      |
| ------------- | --------------------------- | --------- |
| Monorepo 工具 | pnpm workspace              | ✅ 已确定 |
| 前端框架      | Vue 3 + Vite + Element-plus | ✅ 已确定 |
| 后端框架      | Express + Prisma            | ✅ 已确定 |
| 镜像源        | 阿里云 npmmirror.com        | ✅ 已确定 |
| 代码质量      | Prettier                    | ✅ 已确定 |
| TypeScript    | 分层继承配置                | ✅ 已确定 |
