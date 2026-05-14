"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { validatePassword } from "@/service/auth";
import styles from "./LoginPage.module.scss";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  // 已登录用户重定向到首页
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("请填写用户名和密码");
      setSuccess("");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join("，"));
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await login(username.trim(), password);
      setSuccess("登录成功！正在跳转...");
      // 登录成功后直接使用 router 跳转，由 AuthContext 更新触发上面的 useEffect 处理
    } catch (err) {
      setError((err as Error).message || "登录失败，请重试");
    }
  }

  return (
    <div className={styles.loginScreen}>
      <div className={styles.loginHeader}>
        <div className={styles.loginLogo}>后</div>
        <h1 className={styles.loginTitle}>后陡门 58 号</h1>
        <p className={styles.loginSubtitle}>登录或注册您的账号</p>
      </div>

      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>用户名</label>
          <input
            className={styles.formInput}
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>密码</label>
          <input
            className={styles.formInput}
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <div className={styles.passwordRules}>
            <ul>
              <li>至少8位字符</li>
              <li>包含小写字母</li>
              <li>包含大写字母</li>
              <li>包含数字</li>
              <li>包含特殊字符</li>
            </ul>
          </div>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <button type="submit" className={styles.loginButton} disabled={isLoading}>
          {isLoading ? <span className={styles.loader} /> : "登录"}
        </button>

        <p className={styles.loginHint}>
          新用户直接登录即可自动注册
        </p>
      </form>
    </div>
  );
}
