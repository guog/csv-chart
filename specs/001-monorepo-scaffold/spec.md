# Feature Specification: Monorepo 项目脚手架

**Feature Branch**: `001-monorepo-scaffold`  
**Created**: 2025-12-31  
**Status**: Draft  
**Input**: User description: "创建mono仓库，包括前后端框架，镜像源使用国内阿里镜像源"

## 概述

创建一个完整的 Monorepo（单体仓库）项目脚手架，包含前端和后端应用框架，所有依赖使用阿里云镜像源以加速国内开发者的安装体验。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 初始化 Monorepo 项目结构 (Priority: P1)

作为开发者，我希望能够快速拥有一个标准的 Monorepo 项目结构，包含前后端独立的应用目录，以便团队可以在统一的代码仓库中协作开发。

**Why this priority**: 这是项目的基础结构，没有这个结构，后续的开发工作无法进行。

**Independent Test**: 可以通过查看目录结构确认 monorepo 的 packages/apps 目录划分是否符合标准，验证工作区配置是否正确。

**Acceptance Scenarios**:

1. **Given** 一个空的 Git 仓库, **When** 项目初始化完成, **Then** 应包含标准的 monorepo 目录结构（apps/web、apps/server、packages）
2. **Given** 项目初始化完成, **When** 开发者查看根目录, **Then** 应看到 pnpm-workspace.yaml 工作区配置文件
3. **Given** 项目初始化完成, **When** 开发者查看根目录, **Then** 应看到 .npmrc 文件配置了阿里云镜像源

---

### User Story 2 - 前端应用框架搭建 (Priority: P1)

作为前端开发者，我希望有一个预配置好的 Vue 3 前端应用框架，包含必要的开发工具链，以便立即开始业务开发。

**Why this priority**: 前端框架是用户交互的入口，与后端同等重要。

**Independent Test**: 可以通过运行前端开发服务器，验证页面是否正常渲染。

**Acceptance Scenarios**:

1. **Given** 前端应用目录存在, **When** 运行开发命令, **Then** 应启动开发服务器并在浏览器中展示默认页面
2. **Given** 前端应用配置完成, **When** 查看依赖, **Then** 应包含 Vue 3、Vite、TypeScript、Element-plus、Vue Router、Pinia 等核心依赖
3. **Given** 前端应用配置完成, **When** 查看配置文件, **Then** 应有正确的 TypeScript 和 Vite 配置

---

### User Story 3 - 后端应用框架搭建 (Priority: P1)

作为后端开发者，我希望有一个预配置好的 Node.js 后端应用框架，包含基本的项目结构和工具链，以便快速开发 API 服务。

**Why this priority**: 后端是业务逻辑和数据处理的核心，与前端同等重要。

**Independent Test**: 可以通过运行后端开发服务器，验证 API 是否可访问。

**Acceptance Scenarios**:

1. **Given** 后端应用目录存在, **When** 运行开发命令, **Then** 应启动开发服务器并监听端口 3000
2. **Given** 后端应用配置完成, **When** 查看依赖, **Then** 应包含 TypeScript、Prisma 等核心依赖
3. **Given** 后端应用配置完成, **When** 查看项目结构, **Then** 应有标准的分层架构目录

---

### User Story 4 - 依赖安装与镜像源配置 (Priority: P2)

作为国内开发者，我希望所有 npm/pnpm 依赖都通过阿里云镜像源下载，以获得更快的安装速度。

**Why this priority**: 镜像源配置提升开发效率，但不影响核心功能。

**Independent Test**: 可以通过执行 pnpm install 验证下载速度和镜像源是否生效。

**Acceptance Scenarios**:

1. **Given** .npmrc 配置了阿里云镜像源, **When** 运行 pnpm install, **Then** 依赖应从阿里云镜像源下载
2. **Given** 项目配置完成, **When** 查看 .npmrc 文件, **Then** 应包含 registry=https://registry.npmmirror.com 配置

---

### User Story 5 - 统一的代码质量工具配置 (Priority: P2)

作为开发团队成员，我希望项目有统一的代码格式化和质量检查工具，以保持代码风格一致。

**Why this priority**: 代码质量工具提升长期维护效率，但不阻塞基础功能。

**Independent Test**: 可以通过运行格式化命令验证代码是否被正确格式化。

**Acceptance Scenarios**:

1. **Given** 代码质量工具配置完成, **When** 运行格式化命令, **Then** 代码应按照预设规则格式化
2. **Given** 项目根目录, **When** 查看配置文件, **Then** 应包含 Prettier 配置文件

---

### Edge Cases

- 当开发者使用不同版本的 Node.js 时，通过 package.json engines 字段在安装依赖时给出警告提示
- 当阿里云镜像源临时不可用时，开发者可临时注释 .npmrc 中的 registry 配置使用官方源
- 当前后端端口冲突时，修改 apps/web/vite.config.ts 或 apps/server/.env 中的端口配置

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 创建标准的 pnpm monorepo 工作区结构
- **FR-002**: 系统 MUST 包含前端应用目录 (apps/web)，使用 Vue 3 + Vite + TypeScript 技术栈
- **FR-003**: 系统 MUST 包含后端应用目录 (apps/server)，使用 Node.js + Express + TypeScript 技术栈
- **FR-004**: 系统 MUST 配置 .npmrc 使用阿里云 npm 镜像源 (https://registry.npmmirror.com)
- **FR-005**: 系统 MUST 配置 pnpm-workspace.yaml 定义工作区包
- **FR-006**: 前端应用 MUST 包含 Element-plus UI 组件库依赖
- **FR-007**: 前端应用 MUST 包含 axios HTTP 请求库依赖
- **FR-008**: 前端应用 MUST 包含 Vue Router 路由管理库
- **FR-009**: 前端应用 MUST 包含 Pinia 状态管理库
- **FR-010**: 后端应用 MUST 包含 Prisma ORM 依赖
- **FR-011**: 系统 MUST 配置 Prettier 代码格式化工具
- **FR-012**: 系统 MUST 提供根目录的 package.json，包含常用的 monorepo 脚本命令
- **FR-013**: 系统 MUST 配置 TypeScript，前后端各有独立的 tsconfig.json
- **FR-014**: 根目录 package.json MUST 配置 engines 字段指定 Node.js 版本要求 (>=24.11)

### Key Entities

- **Workspace Root**: 项目根目录，包含工作区配置和共享配置文件
- **Web App (前端)**: Vue 3 前端应用，负责用户界面展示
- **Server App (后端)**: Node.js 后端应用，负责业务逻辑和 API 服务
- **Shared Packages**: 空的共享代码包目录 (packages/)，用于后续按需添加跨应用复用代码

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 开发者可以在 5 分钟内完成依赖安装并启动前后端开发服务器
- **SC-002**: 前端开发服务器可以在本地 http://localhost:5173 正常访问并展示默认页面
- **SC-003**: 后端开发服务器可以在 http://localhost:3000 响应基础的健康检查请求
- **SC-004**: 使用 pnpm 从根目录可以统一管理所有应用的依赖
- **SC-005**: 代码格式化命令可以正确格式化所有 TypeScript/Vue 文件

## Clarifications

### Session 2025-12-31

- Q: 后端应使用哪个 HTTP 框架？ → A: Express
- Q: 前后端开发服务器端口？ → A: 前端 5173，后端 3000
- Q: Node.js 版本不一致时如何处理？ → A: 仅使用 package.json engines 字段
- Q: 前端是否需要 Vue Router 和 Pinia？ → A: 同时包含两者
- Q: 共享代码包目录是否预创建？ → A: 仅创建空的 packages 目录
- Q: 阿里云镜像源不可用时如何处理？ → A: 开发者可临时注释 .npmrc 中的 registry 配置，使用官方源

## Assumptions

- 开发者已安装 Node.js 24.11+ 和 pnpm
- 开发者有稳定的网络连接（可访问阿里云镜像源）
- 项目使用 Git 进行版本控制
- 开发环境数据库使用 SQLite，生产环境使用 PostgreSQL
