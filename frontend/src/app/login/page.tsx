"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const hints = [
    { user: "admin", pass: "admin123" },
    { user: "alice", pass: "alice123" },
    { user: "bob", pass: "bob123" },
  ];

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="3" fill="#6c63ff" />
              <rect x="15" y="2" width="11" height="11" rx="3" fill="#6c63ff" opacity="0.6" />
              <rect x="2" y="15" width="11" height="11" rx="3" fill="#6c63ff" opacity="0.6" />
              <rect x="15" y="15" width="11" height="11" rx="3" fill="#22d3ee" />
            </svg>
          </div>
          <h1 className={styles.brandName}>TaskFlow</h1>
        </div>

        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to manage your tasks</p>

        <form onSubmit={handleSubmit} className={styles.form} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username-input">Username</label>
            <input
              id="username-input"
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.errorMsg} role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className={styles.hints}>
          <p className={styles.hintsLabel}>Demo Credentials</p>
          <div className={styles.hintsList}>
            {hints.map((h) => (
              <button
                key={h.user}
                type="button"
                className={styles.hintChip}
                onClick={() => { setUsername(h.user); setPassword(h.pass); setError(""); }}
              >
                {h.user}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
