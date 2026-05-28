# 编码规范

## 组件设计

- Mobile First：所有样式从移动端写起，用 `md:` `lg:` 响应式断点扩展
- 组件粒度：一个组件只做一件事，超过 150 行考虑拆分
- Props 设计：必选 props 在前，可选 props 在后，提供合理默认值
- 所有交互元素必须有 hover / active / focus 视觉反馈

## TypeScript

- 接口用 `interface`，联合类型和工具类型用 `type`
- API 响应必须定义完整类型，不允许 `as any` 强制转换
- 泛型命名：T=类型, K=键, V=值, E=元素
- Supabase 表类型从 `database.types.ts` 自动生成

## 样式

- 间距体系：4px 倍数（p-1 = 4px, p-2 = 8px ...）
- 颜色：使用语义化 token（text-primary, bg-surface），不用裸色值
- 动画：优先 CSS transition，持续时间 150-300ms，使用 ease-out
- 避免 `!important`

## 文件组织

- 一个文件一个组件，文件名 = 组件名
- 工具函数按领域分组：`lib/supabase.ts`, `lib/ai.ts`, `lib/format.ts`
- 常量定义集中在 `constants/` 目录
- 页面级组件放在对应的 app 路由目录内

## 错误处理

- API 调用必须处理 loading / success / error 三态
- 用户操作失败时给出可理解的中文提示，不暴露技术细节
- 网络请求添加超时设置（默认 10s）
- 表单提交防止重复点击（提交中禁用按钮）
- AI 生成类操作需要加载动画和预计时间提示

## 可访问性

- 所有图片必须有 alt 文本
- 表单字段必须有关联的 label
- 键盘可操作：Tab 导航、Enter 确认、Escape 关闭
