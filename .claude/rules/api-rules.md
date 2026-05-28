---
globs: src/app/api/**/*
---

# API Routes 规则

- 所有 API Route 必须验证用户身份（检查 Supabase session）
- 请求参数必须做类型校验（使用 zod）
- AI API 调用必须设置超时和重试机制
- 返回统一格式：`{ success: boolean, data?: T, error?: string }`
- 敏感操作（删除、修改）必须检查资源所有权
- 不在 API 响应中暴露内部错误堆栈
