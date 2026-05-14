# 路由重定向实现计划

## 概述

当前项目使用条件渲染在一个组件内处理登录/未登录状态，需要改为基于 Next.js 路由的重定向方式：

1. 未登录用户访问任意页面（除登录页外）→ 重定向到 `/login`
2. 已登录用户访问 `/` → 显示选择角色页面（picker view）
3. 已登录用户访问 `/login` → 重定向到 `/`

## 现状分析

- 当前入口：`/src/app/page.tsx` → 渲染 `HoldoumenApp` 组件
- `HoldoumenApp` 组件内通过 `isLoggedIn` 状态条件渲染不同内容
- 已有独立登录页路由：`/login`

## 实现方案

### 1. 创建路由中间件（Middleware）

文件：`src/middleware.ts`（新增）

- 使用 Next.js Middleware 在服务端处理路由保护
- 检查认证状态
- 未登录时重定向到 `/login`
- 已登录访问 `/login` 时重定向到 `/`

### 2. 重构 HoldoumenApp 组件

修改文件：`src/app/HoldoumenApp.tsx`

- 移除登录状态的条件渲染逻辑
- 默认显示选择角色页面（picker view）
- 保持现有的聊天功能和视图切换逻辑

### 3. 更新登录页面重定向

修改文件：`src/app/login/page.tsx`

- 登录成功后使用 `useRouter` 进行路由跳转，而非 `window.location.href`
- 检查登录状态，已登录用户访问登录页时立即重定向

### 4. 创建认证状态检查 Hook（可选，为了更好的复用）

文件：`src/hooks/useAuthRedirect.ts`（可选新增）

- 封装认证状态与路由重定向逻辑
- 可在需要的组件中复用

## 文件修改清单

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| `src/middleware.ts` | 新增 | Next.js 路由中间件，处理认证重定向 |
| `src/app/HoldoumenApp.tsx` | 修改 | 移除登录条件渲染，默认显示 picker |
| `src/app/login/page.tsx` | 修改 | 使用 useRouter 跳转，添加已登录检查 |
| `src/app/page.tsx` | 保持不变 | 继续渲染 HoldoumenApp |

## 实现步骤

1. 创建 `src/middleware.ts` 实现路由保护逻辑
2. 修改 `HoldoumenApp.tsx` 移除登录状态检查
3. 更新 `login/page.tsx` 使用 Next.js router 并添加状态检查
4. 测试验证各项重定向逻辑

## 技术细节

### Middleware 实现要点

- 使用 `NextRequest` 和 `NextResponse` 处理请求与响应
- 通过检查 Cookie 判断认证状态（后端使用 HttpOnly Cookie）
- 白名单路由：`/login` 不需要认证
- 其他路由需要认证，未登录则重定向到 `/login`

### 登录页实现要点

- 导入 `useRouter` 和 `useEffect`
- 在 `useEffect` 中检查 `isLoggedIn`，已登录则立即 `router.push('/')`
- 登录成功后使用 `router.push('/')` 替代 `window.location.href`

### HoldoumenApp 重构要点

- 移除 `if (!isLoggedIn)` 条件渲染块
- 移除 `LoginPage` 组件导入
- 保持 `isLoading` 状态的加载动画（用于初始化用户信息）
- 默认 `viewMode` 保持为 `"picker"`

## 风险与注意事项

1. **Middleware 与 Client 认证状态同步**
   - Middleware 通过 Cookie 判断，Client 通过 Context 判断
   - 需要确保两者逻辑一致

2. **Next.js 16 特性兼容性**
   - 确保使用符合 Next.js 16.2.1 的 Middleware API
   - 查阅 `node_modules/next/dist/docs/` 确认最新用法

3. **构建验证**
   - 完成后运行 `npm run lint` 和 `npm run build` 确保无错误
