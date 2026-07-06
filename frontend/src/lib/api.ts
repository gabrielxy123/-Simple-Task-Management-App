import { Task, TaskCreatePayload, TaskUpdatePayload, User } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const data = await request<{ access_token: string; token_type: string; user: User }>(
    "/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }
  );
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

// ── Users ─────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

// ── Tasks ─────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  return request<Task[]>("/tasks");
}

export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  return request<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTask(id: number, payload: TaskUpdatePayload): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(id: number): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: "DELETE" });
}

// ── Chat ──────────────────────────────────────────────────────────

export async function sendChatMessage(message: string): Promise<{ reply: string }> {
  return request<{ reply: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
