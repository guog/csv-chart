# Implementation Plan: Monorepo 项目脚手架

**Branch**: `001-monorepo-scaffold` | **Date**: 2025-12-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-monorepo-scaffold/spec.md`

## Summary

创建一个完整的 pnpm Monorepo 项目脚手架，包含 Vue 3 前端应用和 Express 后端应用，使用阿里云镜像源加速依赖安装。技术栈经过澄清确认：前端使用 Vue 3 + Vite + TypeScript + Element-plus + Vue Router + Pinia，后端使用 Node.js + Express + TypeScript + Prisma。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js >=24.11  
**Primary Dependencies**: 
- 前端: Vue 3, Vite, Element-plus, Vue Router, Pinia, axios
- 后端: Express, Prisma, TypeScript
- 工具: Prettier, pnpm

**Storage**: SQLite (开发环境), PostgreSQL (生产环境)  
**Testing**: Vitest (前端), Jest/Vitest (后端)  
**Target Platform**: Web 应用 (B/S 架构)  
**Project Type**: Monorepo (pnpm workspace)  
**Performance Goals**: 开发服务器启动 < 10s  
**Constraints**: 使用阿里云镜像源 (https://registry.npmmirror.com)  
**Scale/Scope**: 单团队协作开发的中小型项目

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution 文件为模板状态，无特定项目约束。以下为通用最佳实践检查：

| 原则 | 状态 | 说明 |
|------|------|------|
| 模块化设计 | ✅ Pass | Monorepo 结构天然支持模块化 |
| 类型安全 | ✅ Pass | 全栈使用 TypeScript |
| 可测试性 | ✅ Pass | 前后端独立可测试 |
| 代码质量 | ✅ Pass | 配置 Prettier 统一格式化 |
| 依赖管理 | ✅ Pass | pnpm workspace 统一管理 |

**Gate Result**: ✅ PASS - 无违规项

## Project Structure

### Documentation (this feature)

```text
specs/001-monorepo-scaffold/
├── plan.md              # 本文件 (实施计划)
├── research.md          # Phase 0 研究输出
├── data-model.md        # Phase 1 数据模型
├── quickstart.md        # Phase 1 快速入门指南
├── contracts/           # Phase 1 API 契约
│   └── api.yaml
└── tasks.md             # Phase 2 任务分解 (/speckit.tasks 生成)
```

### Source Code (repository root)

```text
# Monorepo 结构
apps/
├── web/                     # Vue 3 前端应用
│   ├── src/
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 通用组件
│   │   ├── layouts/         # 布局组件
│   │   ├── pages/           # 页面组件
│   │   ├── router/          # Vue Router 配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── services/        # API 服务层
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── App.vue          # 根组件
│   │   └── main.ts          # 入口文件
│   ├── public/              # 公共静态资源
│   ├── index.html           # HTML 模板
│   ├── vite.config.ts       # Vite 配置
│   ├── tsconfig.json        # TypeScript 配置
│   └── package.json         # 前端依赖
│
└── server/                  # Express 后端应用
    ├── src/
    │   ├── controllers/     # 控制器层
    │   ├── services/        # 业务逻辑层
    │   ├── models/          # 数据模型
    │   ├── routes/          # 路由定义
    │   ├── middlewares/     # 中间件
    │   ├── types/           # TypeScript 类型定义
    │   ├── utils/           # 工具函数
    │   └── index.ts         # 入口文件
    ├── prisma/
    │   └── schema.prisma    # Prisma 数据库模型
    ├── tsconfig.json        # TypeScript 配置
    └── package.json         # 后端依赖

packages/                    # 共享代码包 (空目录，按需添加)
    └── .gitkeep

# 根目录配置文件
package.json                 # 根 package.json (工作区脚本)
pnpm-workspace.yaml          # pnpm 工作区配置
.npmrc                       # npm 镜像源配置
.prettierrc                  # Prettier 配置
.prettierignore              # Prettier 忽略规则
tsconfig.base.json           # TypeScript 基础配置
.gitignore                   # Git 忽略规则
README.md                    # 项目说明
```

**Structure Decision**: 采用 pnpm Monorepo 结构，apps/ 目录下放置独立应用 (web/server)，packages/ 目录预留给共享代码包。前后端各自独立配置，根目录提供统一的工作区管理和代码质量工具。

## Complexity Tracking

> 无复杂度违规，本功能遵循最小必要原则。

| 项目 | 说明 |
|------|------|
| 目录数量 | 3 个顶级目录 (apps, packages, specs) - 符合 Monorepo 标准 |
| 配置文件 | 根目录统一配置，子项目继承 - 无冗余 |
| 依赖管理 | pnpm workspace 统一管理 - 避免重复安装 |

## Phase 0: Research Summary

见 [research.md](research.md)

## Phase 1: Design Artifacts

- 数据模型: [data-model.md](data-model.md)
- API 契约: [contracts/](contracts/)
- 快速入门: [quickstart.md](quickstart.md)
