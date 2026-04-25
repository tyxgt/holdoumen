# Project Agent Guidelines

## 项目概况
- 这是一个基于 `Next.js 16.2.1`、`React 19`、`TypeScript` 的前端项目。
- 入口页位于 `src/app/page.tsx`，核心界面在 `src/app/HoldoumenApp.tsx`。
- 项目使用 `App Router`、`SCSS Modules` 和少量全局样式。
- 代码中存在 `client component`、流式消息请求、成员选择与聊天两种视图模式。

## 开发前必须注意
- 这是一个有破坏性变更的 Next.js 版本，涉及 API、约定和文件结构时，优先查阅 `node_modules/next/dist/docs/` 中的相关文档。
- 不要默认沿用旧版 Next.js / React 的习惯写法，尤其是与 `App Router`、Server/Client Component、路由、缓存和构建相关的行为。
- 修改 UI 或交互前，先确认组件是服务端还是客户端组件，避免误用浏览器 API。

## 目录约定
- `src/app/`：页面、布局、全局样式和视图容器。
- `src/components/`：可复用组件，如成员卡片、头像展示等。
- `src/data/holdoumen/`：业务文案、主题、成员数据和图片资源映射。
- `src/service/`：与后端或外部接口交互的请求封装。
- `src/types/`：共享类型定义。
- `public/`：静态资源。

## 编码规范
- 优先使用 TypeScript，保持类型明确，避免 `any`。
- 组件和样式按功能拆分，继续使用 `SCSS Modules`。
- 保持现有的命名风格：组件使用 PascalCase，工具函数使用 camelCase，常量使用大写命名。
- 修改数据结构时，同步更新相关类型、文案和组件调用处。
- 涉及聊天消息、成员回复、流式响应时，要考虑中断、回退回复和状态清理。

## 修改与验证建议
- 改动后优先检查：`npm run lint`。
- 如果改动涉及页面渲染或样式，建议再执行 `npm run build` 或至少手动核对相关页面。
- 尽量保持改动局部化，避免不必要地重构现有结构。

## 给 Agent 的操作原则
- 在实现新功能前，先理解现有数据流和视图切换逻辑。
- 如果需要新增文件，优先放入最符合职责的目录。
- 不要删除现有注释性配置文件中的关键说明，除非确认已经过时且有替代方案。