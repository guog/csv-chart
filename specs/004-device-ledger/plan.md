# Implementation Plan: 设备台账管理 (Device Ledger)

**Branch**: `004-device-ledger` | **Date**: 2026-03-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-device-ledger/spec.md`

## Summary

实现设备台账管理功能，提供设备基本信息的 CRUD 管理。后端在现有 Express + Prisma 架构上新增 Device 模型和 RESTful API 端点，支持分页与搜索；前端在现有 Vue 3 + Element Plus 架构上新增设备管理页面，包含列表、创建、编辑和删除操作。数据库使用 SQLite（开发环境），设备序列号唯一约束由数据库层保证，删除采用硬删除策略。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js >=24.11
**Primary Dependencies**:
- 前端: Vue 3, Vite, Element Plus, Vue Router, Pinia, Axios
- 后端: Express 4, Prisma 6, cors

**Storage**: SQLite (通过 Prisma ORM)
**Testing**: Vitest (前后端统一) + supertest (API) + @vue/test-utils (组件)
**Target Platform**: Web 应用 (B/S 架构，桌面/平板响应式)
**Project Type**: Monorepo (pnpm workspace) — Web 应用
**Performance Goals**: FCP < 2s (4G 网络)；搜索 < 500ms (10,000 设备)
**Constraints**: 设备序列号全局唯一；硬删除，不可逆
**Scale/Scope**: 最多 10,000 台设备记录；单用户/小团队使用

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Constitution 文件为模板状态，无特定项目约束。以下为通用最佳实践检查：

| 原则       | 状态    | 说明                                          |
| ---------- | ------- | --------------------------------------------- |
| 模块化设计 | ✅ Pass | 路由、模型、页面各自独立模块                  |
| 类型安全   | ✅ Pass | 全栈 TypeScript，Prisma 生成类型              |
| 可测试性   | ✅ Pass | API 路由可独立测试，组件可独立渲染            |
| 代码质量   | ✅ Pass | Prettier 统一格式化                          |
| 依赖管理   | ✅ Pass | pnpm workspace 统一管理，无新外部依赖        |
| 数据完整性 | ✅ Pass | 序列号唯一约束由数据库 + 应用层双重保证      |

**Gate Result**: ✅ PASS — 无违规项

### Post-Design Re-evaluation (Phase 1 完成后)

| 原则       | 状态    | 说明                                                        |
| ---------- | ------- | ----------------------------------------------------------- |
| 模块化设计 | ✅ Pass | Device 路由独立文件；Vue 视图/Store/类型分离；Prisma 模型独立 |
| 类型安全   | ✅ Pass | Prisma 生成 Device 类型；前端 `types/device.ts` 共享类型      |
| 可测试性   | ✅ Pass | Vitest + supertest 覆盖 API；@vue/test-utils 覆盖组件        |
| 代码质量   | ✅ Pass | Prettier 格式化；手动验证与现有模式一致                      |
| 依赖管理   | ✅ Pass | 仅测试依赖为新增 (vitest, supertest, @vue/test-utils)        |
| 数据完整性 | ✅ Pass | DB 唯一约束 + P2002 错误捕获 + 前端表单验证三重保证          |
| API 设计   | ✅ Pass | OpenAPI 3.0 契约；RESTful；与现有 examples API 风格一致      |

**Post-Design Gate Result**: ✅ PASS — 设计符合所有原则

## Project Structure

### Documentation (this feature)

```text
specs/004-device-ledger/
├── plan.md              # 本文件 (实施计划)
├── research.md          # Phase 0 研究输出
├── data-model.md        # Phase 1 数据模型
├── quickstart.md        # Phase 1 快速开始指南
├── contracts/           # Phase 1 API 契约
│   └── api.yaml
└── tasks.md             # Phase 2 输出 (由 /speckit.tasks 生成)
```

### Source Code (repository root)

```text
apps/server/
├── prisma/
│   └── schema.prisma        # 新增 Device 模型
├── src/
│   ├── index.ts             # 注册设备路由
│   ├── lib/
│   │   └── prisma.ts        # Prisma 客户端 (已有)
│   └── routes/
│       ├── examples.ts      # 已有
│       ├── health.ts        # 已有
│       └── devices.ts       # 新增：设备 CRUD 路由

apps/web/
├── src/
│   ├── router/
│   │   └── index.ts         # 新增设备管理路由
│   ├── views/
│   │   └── DeviceView.vue   # 新增：设备管理页面 (列表+CRUD)
│   ├── stores/
│   │   └── device.ts        # 新增：设备状态管理
│   └── types/
│       └── device.ts        # 新增：设备类型定义
```

**Structure Decision**: 遵循现有 Monorepo 结构，在 `apps/server` 和 `apps/web` 中分别扩展，不新增顶层目录。后端新增路由文件 `devices.ts`，前端新增视图、Store 和类型定义。

## Complexity Tracking

> 无违规项，无需填写。
