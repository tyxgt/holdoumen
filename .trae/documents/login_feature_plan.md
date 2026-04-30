# 登录注册功能实现计划

## 概述

根据后端登录接口文档，前端需要实现以下功能：
- 登录页面（用户名+密码）
- 密码前端预校验
- 登录即注册模式
- 登录状态管理
- 退出登录功能

## 技术方案

### 1. 类型定义（新增）

文件：`src/types/auth.ts`

定义登录请求、响应和用户信息的类型。

### 2. 认证服务（新增）

文件：`src/service/auth.ts`

封装登录、登出、获取用户信息的 API 调用。

### 3. 登录状态管理（新增）

文件：`src/context/AuthContext.tsx`

使用 React Context 管理全局登录状态，包含：
- 当前用户信息
- 登录状态
- 登录/登出方法

### 4. 登录页面组件（新增）

文件：`src/app/login/page.tsx`
文件：`src/app/login/LoginPage.module.scss`

实现登录表单，包含：
- 用户名输入
- 密码输入（带规则校验）
- 登录按钮
- 错误提示

### 5. 主应用修改

修改文件：`src/app/HoldoumenApp.tsx`

在应用入口处检查登录状态，未登录时显示登录页面。

### 6. 退出登录按钮

在聊天页面添加退出登录按钮。

## 文件修改清单

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| `src/types/auth.ts` | 新增 | 认证相关类型定义 |
| `src/service/auth.ts` | 新增 | 认证 API 封装 |
| `src/context/AuthContext.tsx` | 新增 | 登录状态管理 |
| `src/app/login/page.tsx` | 新增 | 登录页面组件 |
| `src/app/login/LoginPage.module.scss` | 新增 | 登录页面样式 |
| `src/app/HoldoumenApp.tsx` | 修改 | 添加登录状态检查 |
| `src/app/chat/index.tsx` | 修改 | 添加退出登录按钮 |
| `src/service/api.ts` | 修改 | 更新 axios 配置支持 Cookie |

## 实现步骤

1. 创建类型定义文件
2. 创建认证服务文件
3. 创建 AuthContext
4. 创建登录页面组件
5. 修改主应用组件
6. 更新聊天页面添加退出按钮
7. 更新 API 配置支持 Cookie

## 注意事项

1. 所有认证请求必须设置 `credentials: 'include'`
2. 密码校验规则：至少8位，包含大小写字母、数字、特殊字符
3. 登录成功后后端会设置 HttpOnly Cookie，前端无需手动处理 token
4. 通过 `/api/v1/auth/me` 接口判断登录状态

## 测试账号

| 用户名 | 密码 |
|--------|------|
| TestUser | Abc123!@# |

新用户可直接使用新用户名登录，系统会自动注册。