# Feature Specification: Device Ledger Management (设备台账管理)

**Feature Branch**: `004-device-ledger`  
**Created**: 2026-03-02  
**Status**: Draft  
**Input**: User description: "实现设备台账管理功能，能够进行设备基本信息的管理。"

## Clarifications

### Session 2026-03-02

- Q: 如何处理设备“位置”(Location)字段的数据格式？ → A: 使用自由文本字符串(Free text string)，简单直接，适合 MVP。
- Q: 设备“状态”(Status)字段应包含哪些枚举值？ → A: 使用预定义枚举(Enum)：IN_USE(使用中), STORAGE(库存), MAINTENANCE(维修中), SCRAPPED(报废)。
- Q: 删除设备时采取何种策略？ → A: 硬删除(Hard Delete)，物理移除数据，简化实现。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Device List (查看设备列表) (Priority: P1)

作为设施经理或管理员，我需要查看所有注册设备的完整列表，以维护准确的资产清单。

**Why this priority**: 可见性是任何管理系统的基础需求。无法查看现有数据，其他操作就无法有效进行。

**Independent Test**: 可以通过在数据库中预置设备记录，并验证它们是否正确显示在带有分页的列表视图中来进行测试。

**Acceptance Scenarios**:

1. **Given** 存在已注册设备的列表，**When** 我导航到设备管理页面，**Then** 我看到一个分页表格，显示设备信息（名称、型号、序列号、状态）。
2. **Given** 设备列表页面，**When** 我在搜索框中输入关键字，**Then** 列表更新为仅显示名称或序列号匹配的设备。
3. **Given** 有多页设备数据，**When** 我点击“下一页”按钮，**Then** 显示下一组设备。

---

### User Story 2 - Register New Device (注册新设备) (Priority: P1)

作为设施经理，我需要在采购新设备时将其添加到系统中，以便可以对其进行跟踪和管理。

**Why this priority**: 向系统填充数据的必要步骤。没有这一步，台账无法增长或反映实际情况。

**Independent Test**: 可以通过填写“添加设备”表单并验证新记录是否出现在数据库和列表视图中来进行测试。

**Acceptance Scenarios**:

1. **Given** 我在设备列表页面，**When** 我点击“添加设备”，**Then** 出现一个表单，要求输入设备详细信息（名称、型号、序列号、购买日期、状态、位置）。
2. **Given** 添加设备表单，**When** 我提交有效信息，**Then** 新设备被保存，我看到一条成功消息。
3. **Given** 添加设备表单，**When** 我尝试提交重复的序列号，**Then** 系统阻止保存并显示错误消息，指出序列号已存在。
4. **Given** 添加设备表单，**When** 我将必填字段（名称、序列号）留空，**Then** 系统高亮显示缺失字段并阻止提交。

---

### User Story 3 - Update Device Information (更新设备信息) (Priority: P2)

作为设施经理，我需要更新设备详细信息（如状态变更、位置移动或纠正错误），以确保台账保持最新。

**Why this priority**: 随着时间的推移维护数据准确性至关重要，尽管对于系统初始化填充数据的“快乐路径”不是严格必须的。

**Independent Test**: 可以通过修改现有记录并验证更改是否持久化来进行测试。

**Acceptance Scenarios**:

1. **Given** 存在某个设备，**When** 我选择该设备的“编辑”操作，**Then** 显示一个预先填充了设备当前信息的表单。
2. **Given** 编辑表单，**When** 我修改状态或位置并保存，**Then** 更改立即反映在设备列表中。
3. **Given** 编辑表单，**When** 我尝试将序列号更改为属于另一个设备的序列号，**Then** 系统阻止保存并显示验证错误。

---

### User Story 4 - Remove Device (移除设备) (Priority: P3)

作为设施经理，我需要移除已报废、出售或错误输入的设备，以保持台账清洁。

**Why this priority**: 对于生命周期管理是必要的，但优先级低于创建和更新。

**Independent Test**: 可以通过删除记录并确保它不再出现在列表中来进行测试。

**Acceptance Scenarios**:

1. **Given** 存在某个设备，**When** 我点击“删除”操作，**Then** 出现一个确认对话框以防止意外删除。
2. **Given** 确认对话框，**When** 我确认删除，**Then** 该设备从活动列表中移除。

### Edge Cases

- **Duplicate Entry**: 尝试添加具有已存在序列号的设备（由验证处理）。
- **Network Failure**: 当服务器不可达时创建/更新设备（应显示用户友好的错误）。
- **Concurrent Edits**: 两个用户同时编辑同一设备（最后写入者胜出或乐观锁 - 暂时假设简单的最后写入者胜出）。
- **Empty List**: 当没有设备存在时查看设备列表（应显示“未找到设备”的空状态，并提示添加设备）。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 系统必须允许用户创建包含以下字段的新设备记录：名称、型号、序列号（唯一）、购买日期、状态、位置和描述。
- **FR-002**: 系统必须验证序列号在所有活动设备中是唯一的。
- **FR-003**: 系统必须提供设备列表视图，至少显示：名称、型号、序列号、状态和位置。
- **FR-004**: 系统必须支持设备列表的分页，以处理大量记录。
- **FR-005**: 系统必须允许用户按名称或序列号搜索/过滤设备列表。
- **FR-006**: 系统必须允许用户更新现有设备的所有可编辑字段（名称、型号、序列号、状态、购买日期、位置、描述）。
- **FR-007**: 系统必须允许用户删除设备记录（硬删除，物理移除数据，操作不可逆）。
- **FR-008**: 系统必须要求在创建和更新期间，名称和序列号不得为空。

### Key Entities

- **Device (设备)**: 代表要跟踪的物理资产。
  - **Attributes**: ID (UUID/自增), Name (名称 - 字符串), Model (型号 - 字符串), Serial Number (序列号 - 字符串, 唯一), Status (状态 - 枚举: IN_USE/使用中, STORAGE/库存, MAINTENANCE/维修中, SCRAPPED/报废), Purchase Date (购买日期 - 日期), Location (位置 - 自由文本字符串), CreatedAt (创建时间 - 时间戳), UpdatedAt (更新时间 - 时间戳)。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 用户可以在标准 4G 网络下，2秒内完成设备列表的首次内容绘制 (FCP)。
- **SC-002**: 用户可以在1分钟内成功注册新设备（假设数据已准备好）。
- **SC-003**: 对于多达 10,000 台设备的数据库，搜索查询在 500ms 内返回结果。
- **SC-004**: 系统保证活动设备的序列号 100% 唯一。

## Assumptions

- 用户具有访问此模块的适当权限（身份验证/授权范围超出此特定功能，但假设已存在）。
- “基本信息”是指文本/日期字段，在此阶段不包括复杂的文档附件或图像上传。
- 虽然不严格以移动优先为主要目标，但要求适应平板电脑/桌面的移动响应式设计（设施经理经常使用平板电脑/笔记本电脑）。
