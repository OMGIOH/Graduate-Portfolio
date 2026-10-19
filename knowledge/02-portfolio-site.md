# Oliver Huang 实习与项目经历（与作品集网站同口径）

## 实习经历：深圳市文德数慧科技开发有限责任公司 · AI Agent 算法工程师（2026.07 - 至今）

参与 AI 营销获客中台与多款 AI Agent 产品研发：基于 LangGraph 构建小红书获客决策 Agent，设计多阶段流水线完成身份识别、需求提取与自动评分，构建规则引擎与大模型协同的混合决策架构；承担数据采集链路重构，完成第三方数据接口对接与多端点采集脚本开发，搭建可复跑的采集流水线，并配套调用预算控制、计费核对与离线复现机制；融合 RAG 规则库与大模型语义审核，参与钉钉嵌入式财务报销审核 Agent 研发，实现从附件解析到报告生成的全流程自动化。

## 实习经历：贵州省科学技术情报研究所 · 项目专员（2025.07 - 2025.10）

搜集 & 清洗科技情报数据，录入台账并制作可视化图表；下级单位资料格式标准化，内部资料审核与统一；审核结项材料，协调专家日程，规划结项答辩。成功协助多个项目完成验收，统筹多场答辩会务，产出规范纪要，数据整理结果辅助科技情报报告撰写。

## 项目经历：AI 营销获客中台（AI Marketing Center）· AI Agent 算法工程师（2026.07 - 至今）

设计并实现基于 LangGraph 的多 Agent 获客引擎（L0-L8），涵盖数据爬取清洗、AI 身份分类（Demo 对 1400+ 条评论实现 91.7% 高置信度分类）、意向评分、个性化话术生成、风险与事实校验全链路；搭建全栈 SaaS 平台，FastAPI 后端 + Next.js 前端，实现 AI 内容写作、线索 CRM（AI 抽取+销售跟进+转化漏斗）、小红书数据采集调度器、BI 看板等核心功能模块；设计四域解耦流水线架构，支持各模块独立评估与迭代优化；通过 Docker Compose + Caddy 自动 HTTPS + PostgreSQL + Redis 完成生产环境部署。

## 项目经历：财务报销审核Agent（Finance Copilot）· AI Agent 算法工程师（2026.07 - 2026.09）

设计双 Agent 审核流水线：DataGovernanceAgent（附件 MinerU/pypdf 解析、LLM 表单提取含置信度评分与 regex 降级、金额勾稽）与 ContentJudgementAgent（确定性规则沙箱 + 可插拔策略引擎 + LLM 语义审核 + 决策引擎 PASS/RISK/BLOCK/REVIEW 四级判定）；实现三阶段审核流程（员工预审/主管审核/财务交叉审核），支持人工改判且保留原始 AI 结论；构建多车道审核架构（文档/正则/计算器/LLM/决策五车道），确保数值与规则算子不交由 LLM，保持确定性；集成钉钉审批连接器，实现直拉审批单、自动上传报告至钉盘、智能审核评论；基于 LaTeX 生成 PDF 审核报告，含证据引用、置信度分解与附件预览附录。

## 项目经历：数字人文视域下布依族古歌神话的沉浸式叙事设计研究 · 项目负责人（2026.01 - 至今）

主持课题总体设计，以 AIGC+VR 探索布依族古歌《造物古歌》的活态传承：通过文献梳理与田野调查提炼史诗母题与美学特征，构建文化知识图谱确保考据可追溯；设计 VR 叙事框架与标准化 AIGC 提示词流程，以"生成—考据—迭代"闭环校验 AI 生成内容与文化本意的平衡；结合游戏引擎制作 VR 概念验证原型并组织用户测试与学术评议，产出人机协同原型一份、可复用方法论一套，发表省级以上刊物论文一篇。曾携作品《卖浆图AI》参与第十九届挑战杯南京总决赛。

## 技术栈总览

作品集技术球上展示的技能标签：Unity、Unreal、Godot、Python、SQL、JavaScript、CSS、HTML、Transformer、LangChain、LSTM、PyTorch、LlamaIndex、Embedding、LangGraph、FastAPI、Next.js、Docker、PostgreSQL、Redis、TypeScript、RAG、Node.js、C++、C#、Git。其中 LangGraph/LangChain/FastAPI/Next.js/Docker/PostgreSQL/Redis 均有真实生产级项目实践。
