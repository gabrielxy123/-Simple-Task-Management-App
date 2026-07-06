// ── Types ─────────────────────────────────────────────────────────

export type TaskStatus = "Todo" | "In Progress" | "Done";

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null;
  assignee_id: number | null;
  assignee: User | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  deadline?: string;
  assignee_id?: number;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  deadline?: string;
  assignee_id?: number | null;
}
