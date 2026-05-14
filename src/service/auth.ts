import type { LoginRequest, LoginResponse, LogoutResponse, User } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://holdoumenback-production.up.railway.app/");

function resolveUrl(path: string): string {
  return new URL(path, BASE_URL).toString();
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(resolveUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "登录失败");
  }

  return response.json();
}

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch(resolveUrl("/api/v1/auth/logout"), {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("退出登录失败");
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(resolveUrl("/api/v1/auth/me"), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("未登录");
  }

  return response.json();
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("密码至少8位");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("密码必须包含小写字母");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("密码必须包含大写字母");
  }
  if (!/\d/.test(password)) {
    errors.push("密码必须包含数字");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("密码必须包含特殊字符");
  }

  return errors;
}
