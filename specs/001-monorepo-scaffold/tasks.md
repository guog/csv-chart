# Tasks: Monorepo 项目脚手架

**Input**: Design documents from `/specs/001-monorepo-scaffold/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: 未明确要求，本任务列表不包含测试任务。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3, US4, US5）
- 描述中包含精确文件路径

---

## Phase 1: Setup (项目初始化)

**Purpose**: 创建 Monorepo 基础结构和根目录配置

- [ ] T001 创建根目录 package.json，配置 workspaces 和 engines 字段 in package.json
- [ ] T002 创建 pnpm 工作区配置 in pnpm-workspace.yaml
- [ ] T003 [P] 创建 npm 镜像源配置 in .npmrc
- [ ] T004 [P] 创建 TypeScript 基础配置 in tsconfig.base.json
- [ ] T005 [P] 创建 Prettier 配置 in .prettierrc
- [ ] T006 [P] 创建 Prettier 忽略规则 in .prettierignore
- [ ] T007 [P] 创建 Git 忽略规则 in .gitignore
- [ ] T008 [P] 创建项目说明文档 in README.md
- [ ] T009 [P] 创建 packages 目录占位文件 in packages/.gitkeep
- [ ] T010 创建 apps 目录结构 in apps/

**Checkpoint**: 根目录配置完成，可验证 pnpm 工作区识别

---

## Phase 2: Foundational (前后端共享基础设施)

**Purpose**: 无阻塞性基础设施，跳过此阶段直接进入用户故事

> 本功能为项目脚手架创建，无需共享基础设施层。用户故事可立即开始。

---

## Phase 3: User Story 1 - 初始化 Monorepo 项目结构 (Priority: P1) 🎯 MVP

**Goal**: 创建标准的 pnpm Monorepo 工作区结构，包含 apps/web、apps/server、packages 目录

**Independent Test**: 运行 `pnpm install` 验证工作区配置正确，各子项目被识别

### Implementation for User Story 1

- [ ] T011 [US1] 创建前端应用 package.json in apps/web/package.json
- [ ] T012 [US1] 创建后端应用 package.json in apps/server/package.json
- [ ] T013 [US1] 更新根 package.json 添加工作区脚本 in package.json

**Checkpoint**: 运行 `pnpm install` 成功，`pnpm -r list` 显示所有子项目

---

## Phase 4: User Story 2 - 前端应用框架搭建 (Priority: P1)

**Goal**: 搭建完整的 Vue 3 前端应用框架，可运行开发服务器

**Independent Test**: 运行 `pnpm dev:web` 在 http://localhost:5173 展示默认页面

### Implementation for User Story 2

- [ ] T014 [P] [US2] 创建前端 TypeScript 配置 in apps/web/tsconfig.json
- [ ] T015 [P] [US2] 创建前端 Vite 配置 in apps/web/vite.config.ts
- [ ] T016 [P] [US2] 创建 HTML 模板 in apps/web/index.html
- [ ] T017 [US2] 创建前端入口文件 in apps/web/src/main.ts
- [ ] T018 [US2] 创建根组件 in apps/web/src/App.vue
- [ ] T019 [P] [US2] 创建 Vue Router 配置 in apps/web/src/router/index.ts
- [ ] T020 [P] [US2] 创建 Pinia 状态管理配置 in apps/web/src/stores/index.ts
- [ ] T021 [P] [US2] 创建示例 Pinia store in apps/web/src/stores/counter.ts
- [ ] T022 [P] [US2] 创建 API 服务基础配置 in apps/web/src/services/api.ts
- [ ] T023 [P] [US2] 创建前端类型定义 in apps/web/src/types/index.ts
- [ ] T024 [P] [US2] 创建首页组件 in apps/web/src/pages/HomePage.vue
- [ ] T025 [P] [US2] 创建布局组件 in apps/web/src/layouts/DefaultLayout.vue
- [ ] T026 [P] [US2] 创建 assets 目录占位 in apps/web/src/assets/.gitkeep
- [ ] T027 [P] [US2] 创建 components 目录占位 in apps/web/src/components/.gitkeep

**Checkpoint**: 运行 `pnpm dev:web`，访问 http://localhost:5173 显示欢迎页面

---

## Phase 5: User Story 3 - 后端应用框架搭建 (Priority: P1)

**Goal**: 搭建完整的 Express 后端应用框架，可运行开发服务器并响应健康检查

**Independent Test**: 运行 `pnpm dev:server`，访问 http://localhost:3000/health 返回 JSON

### Implementation for User Story 3

- [ ] T028 [P] [US3] 创建后端 TypeScript 配置 in apps/server/tsconfig.json
- [ ] T029 [P] [US3] 创建环境变量配置 in apps/server/.env
- [ ] T030 [P] [US3] 创建环境变量示例 in apps/server/.env.example
- [ ] T031 [US3] 创建后端入口文件 in apps/server/src/index.ts
- [ ] T032 [P] [US3] 创建 Prisma 数据库模型 in apps/server/prisma/schema.prisma
- [ ] T033 [P] [US3] 创建后端类型定义 in apps/server/src/types/index.ts
- [ ] T034 [P] [US3] 创建 API 响应工具函数 in apps/server/src/utils/response.ts
- [ ] T035 [US3] 创建健康检查路由 in apps/server/src/routes/health.ts
- [ ] T036 [P] [US3] 创建示例路由 in apps/server/src/routes/examples.ts
- [ ] T037 [P] [US3] 创建示例控制器 in apps/server/src/controllers/exampleController.ts
- [ ] T038 [P] [US3] 创建示例服务 in apps/server/src/services/exampleService.ts
- [ ] T039 [P] [US3] 创建错误处理中间件 in apps/server/src/middlewares/errorHandler.ts
- [ ] T040 [P] [US3] 创建 models 目录占位 in apps/server/src/models/.gitkeep

**Checkpoint**: 运行 `pnpm dev:server`，访问 http://localhost:3000/health 返回 `{"code":0,"message":"success","data":{"status":"ok"}}`

---

## Phase 6: User Story 4 - 依赖安装与镜像源配置 (Priority: P2)

**Goal**: 确保所有依赖通过阿里云镜像源安装

**Independent Test**: 删除 node_modules 后重新运行 `pnpm install`，观察下载速度

### Implementation for User Story 4

> 已在 Phase 1 (T003) 中完成 .npmrc 配置

- [ ] T041 [US4] 验证镜像源配置生效，运行 pnpm install 安装所有依赖
- [ ] T042 [US4] 初始化 Prisma 客户端，运行 pnpm --filter @csv-chart/server prisma generate

**Checkpoint**: `pnpm install` 成功完成，依赖从 npmmirror.com 下载

---

## Phase 7: User Story 5 - 统一的代码质量工具配置 (Priority: P2)

**Goal**: 配置 Prettier 代码格式化工具

**Independent Test**: 运行 `pnpm format` 验证代码格式化正常工作

### Implementation for User Story 5

> 已在 Phase 1 (T005, T006) 中完成 Prettier 配置

- [ ] T043 [US5] 在根 package.json 中添加 format 脚本 in package.json
- [ ] T044 [US5] 运行 pnpm format 验证格式化功能

**Checkpoint**: 运行 `pnpm format` 和 `pnpm format:check` 正常工作

---

## Phase 8: Polish & 验证

**Purpose**: 最终验证和文档完善

- [ ] T045 [P] 运行完整的 quickstart.md 验证流程
- [ ] T046 验证前后端同时启动 pnpm dev
- [ ] T047 [P] 更新 README.md 添加最终说明

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────────────────┐
    │                                                                    │
    └──► Phase 3 (US1: Monorepo 结构) ───────────────────────────────────┤
              │                                                          │
              ├──► Phase 4 (US2: 前端框架) ─┬────► Phase 6 (US4: 镜像源) │
              │                             │            │               │
              └──► Phase 5 (US3: 后端框架) ─┘            │               │
                                                         │               │
                                           Phase 7 (US5: 代码质量) ◄─────┘
                                                         │
                                                         ▼
                                                 Phase 8 (Polish)
```

### Parallel Opportunities

**Phase 1 内部并行** (T003-T009):
- .npmrc, tsconfig.base.json, .prettierrc, .prettierignore, .gitignore, README.md, packages/.gitkeep

**Phase 4 内部并行** (T014-T027):
- 所有前端配置文件和目录结构可并行创建

**Phase 5 内部并行** (T028-T041):
- 所有后端配置文件和目录结构可并行创建

**Phase 4 和 Phase 5 可并行执行** (不同应用目录)

---

## Parallel Example: 前后端同时搭建

```bash
# 开发者 A: 前端框架 (Phase 4)
T014: apps/web/tsconfig.json
T015: apps/web/vite.config.ts
T016: apps/web/index.html
...

# 开发者 B: 后端框架 (Phase 5) - 可同时进行
T028: apps/server/tsconfig.json
T029: apps/server/.env
T031: apps/server/src/index.ts
...
```

---

## Implementation Strategy

### MVP First (仅 User Story 1-3)

1. 完成 Phase 1: Setup
2. 完成 Phase 3: Monorepo 结构 (US1)
3. 完成 Phase 4: 前端框架 (US2)
4. 完成 Phase 5: 后端框架 (US3)
5. **STOP and VALIDATE**: 测试前后端独立运行
6. 部署/演示 MVP

### 完整交付

1. 完成 MVP 后
2. 完成 Phase 6: 安装依赖验证 (US4)
3. 完成 Phase 7: 代码质量工具 (US5)
4. 完成 Phase 8: 最终验证

---

## Notes

- 本功能为脚手架创建，无复杂业务逻辑
- 前后端应用相互独立，可并行开发
- 所有文件路径均相对于仓库根目录
- 每个任务完成后建议提交一次 Git
- T042, T043 需要网络连接执行 pnpm 命令
