# 多智能体协作工作空间：调研与架构研究

实习期间承担"多智能体协作工作空间"方向的调研工作，为产品研发提供架构参考：

- **主研究对象：HKUDS AgentSpace**（开源的 agent-native 协作工作空间）："Human + Agents. One Team. One Workspace"，把 Agent 当作"数字员工"管理（角色、属主、技能、知识、runtime 绑定），人与 Agent 在同一工作空间协作、审批、审计。技术栈为 TypeScript 全栈 monorepo：Next.js 16 + React 19 前端、PostgreSQL 持久化、packages/services 40+ 业务域（任务/审批/频道/知识库/预算/成本/绩效等）、daemon 远程执行守护进程。
- **核心机制 AgentRouter**：provider harness 归一化层——同一个 Agent 身份按任务路由到不同 runtime 执行（Claude Code / Codex / Hermes 等 adapter），统一事件流、会话发现与回退、能力注入、超时诊断。
- **对照研究四种 agent harness**：Anthropic Claude Code（插件与 hooks 体系）、OpenAI Codex（Rust workspace，数百 crate）、DeepSeek Harness（"everything-is-a-plugin" 的 Cordus 插件化架构）、NousResearch Hermes Agent（自改进技能闭环 + 多渠道 gateway + 7 种执行后端）。从事件协议、工具审批、会话持久化、沙箱隔离等维度做横向对比。
- 另对开源项目 **AiToEarn**（14 平台 AI 内容营销 Agent，NestJS + Electron monorepo）写过逐依赖、逐模块的详细技术分析报告。
- 调研产出沉淀为架构分析笔记，用于公司内部多智能体产品研发参考。
