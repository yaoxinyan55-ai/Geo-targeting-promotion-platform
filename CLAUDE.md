@AGENTS.md

# AI提名官

帮IP/公司/产品被AI搜索（豆包/DeepSeek/Kimi）主动推荐的GEO自动化平台。

## 技术栈

- 框架：Next.js 15 (App Router)
- 样式：Tailwind CSS 4 + Shadcn/ui
- 语言：TypeScript
- 后端：Next.js API Routes + Supabase
- 数据库：Supabase (PostgreSQL + Auth + Storage)
- AI接口：Claude API (写稿) + DeepSeek API (批量任务)
- 包管理器：npm
- Node 版本：>=18

## 命令

- 启动开发：`npm run dev`
- 构建：`npm run build`
- 类型检查：`npx tsc --noEmit`
- 代码检查：`npm run lint`

## 目录结构

```
src/
  app/              # Next.js App Router 页面
    (marketing)/    # 官网落地页（无需登录）
    (dashboard)/    # 工作台页面（需登录）
    api/            # API Routes
  components/
    ui/             # Shadcn/ui 基础组件
    marketing/      # 落地页专用组件
    dashboard/      # 工作台专用组件
  hooks/            # 自定义 React hooks
  lib/              # 工具库（supabase client, AI client, utils）
  types/            # TypeScript 类型定义
  constants/        # 常量定义
```

## 代码规范

- 组件文件 PascalCase，工具文件 camelCase
- 所有导出使用 named export，禁止 default export（page.tsx 除外）
- 样式使用 Tailwind utility classes，避免自定义 CSS
- 错误处理：用户可见的操作必须有 loading + error + empty 三态

@docs/conventions.md

## 业务术语

- 目标搜索词：用户希望在AI回答中被提及时对应的搜索词
- plant公式：前缀词 + 主词 + 后缀词 = 目标搜索词
- 项目：一个客户/产品的完整GEO推广计划
- 主稿：AI生成的文章原稿
- 平台版本：主稿改写后适配特定平台（头条/搜狐/知乎）的版本
- 检测：在AI平台搜索目标词，检查是否被引用

## Git 规范

- commit 格式：`feat:` / `fix:` / `refactor:` / `style:` / `docs:` / `test:`
- 每个功能独立 commit，禁止一个 commit 混多个功能
- commit message 用中文描述，type 前缀用英文

## NEVER

- NEVER 使用 `any` 类型，必须定义明确的类型
- NEVER 在组件中直接调用 API，必须通过 hooks 或 lib 层
- NEVER 硬编码颜色/字号/间距，必须使用 Tailwind design token
- NEVER 提交 .env 文件或任何包含密钥的文件
- NEVER 使用 `git push --force`
- NEVER 删除你没有创建的文件，除非我明确要求
- NEVER 一次性重构超过 3 个文件，大重构必须分步进行
- NEVER 在前端暴露 Supabase service_role key，只用 anon key
- NEVER 跳过手机验证码校验逻辑，登录必须验证
- NEVER 在文章生成中使用极限词（最、第一、100%、顶级等）

## 压缩指令

当执行 /compact 或自动压缩时，必须保留：
- 当前正在开发的功能及其验收标准
- 已完成和未完成的任务列表
- 已知的 bug 或待修复问题
- 关键的架构决策和原因
- 数据库表结构设计
