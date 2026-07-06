"use client";

import { Task, TaskStatus } from "@/lib/types";
import { updateTask, deleteTask } from "@/lib/api";
import styles from "./TaskCard.module.css";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onRefresh: () => void;
}

const statusConfig: Record<TaskStatus, { label: string; badgeClass: string }> = {
  "Todo": { label: "Todo", badgeClass: "badge-todo" },
  "In Progress": { label: "In Progress", badgeClass: "badge-inprogress" },
  "Done": { label: "Done", badgeClass: "badge-done" },
};

const STATUS_ORDER: TaskStatus[] = ["Todo", "In Progress", "Done"];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diff < 0) return `${formatted} · Overdue`;
  if (diff === 0) return `${formatted} · Today`;
  if (diff === 1) return `${formatted} · Tomorrow`;
  return `${formatted} · ${diff}d left`;
}

function isOverdue(dateStr: string | null, status: TaskStatus): boolean {
  if (!dateStr || status === "Done") return false;
  return new Date(dateStr) < new Date();
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export default function TaskCard({ task, onEdit, onRefresh }: Props) {
  const { label, badgeClass } = statusConfig[task.status];
  const overdue = isOverdue(task.deadline, task.status);

  async function handleMoveStatus(direction: "prev" | "next") {
    const idx = STATUS_ORDER.indexOf(task.status);
    const nextIdx = direction === "next" ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return;
    await updateTask(task.id, { status: STATUS_ORDER[nextIdx] });
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    await deleteTask(task.id);
    onRefresh();
  }

  return (
    <div className={styles.card}>
      {/* Top row: badge + actions */}
      <div className={styles.topRow}>
        <span className={`badge ${badgeClass}`}>
          <span className={styles.badgeDot} />
          {label}
        </span>
        <div className={styles.actions}>
          <button
            id={`task-edit-${task.id}`}
            className={styles.actionBtn}
            title="Edit task"
            onClick={() => onEdit(task)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            id={`task-delete-${task.id}`}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            title="Delete task"
            onClick={handleDelete}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className={`${styles.title} ${task.status === "Done" ? styles.titleDone : ""}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        {/* Deadline */}
        {task.deadline && (
          <span className={`${styles.deadline} ${overdue ? styles.deadlineOverdue : ""}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {formatDate(task.deadline)}
          </span>
        )}

        {/* Move status buttons */}
        <div className={styles.moveButtons}>
          {task.status !== "Todo" && (
            <button
              id={`task-prev-${task.id}`}
              className={styles.moveBtn}
              title="Move back"
              onClick={() => handleMoveStatus("prev")}
            >
              ←
            </button>
          )}
          {task.status !== "Done" && (
            <button
              id={`task-next-${task.id}`}
              className={styles.moveBtn}
              title="Move forward"
              onClick={() => handleMoveStatus("next")}
            >
              →
            </button>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div className={styles.avatar} title={task.assignee.username}>
            {getInitials(task.assignee.username)}
          </div>
        )}
      </div>
    </div>
  );
}
