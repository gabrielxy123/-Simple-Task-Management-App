"use client";

import { useState, useEffect, FormEvent } from "react";
import { Task, TaskStatus, User } from "@/lib/types";
import { createTask, updateTask } from "@/lib/api";
import styles from "./TaskModal.module.css";

interface Props {
  task?: Task | null;
  users: User[];
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS: TaskStatus[] = ["Todo", "In Progress", "Done"];

export default function TaskModal({ task, users, onClose, onSaved }: Props) {
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "Todo");
  const [deadline, setDeadline] = useState(
    task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
  );
  const [assigneeId, setAssigneeId] = useState<string>(
    task?.assignee_id?.toString() ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      assignee_id: assigneeId ? parseInt(assigneeId) : undefined,
    };

    try {
      if (isEdit && task) {
        await updateTask(task.id, payload);
      } else {
        await createTask(payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      id="task-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box" id="task-modal-box">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Edit Task" : "Create New Task"}</h2>
          <button id="modal-close-btn" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} id="task-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              className="form-input"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className={`form-input ${styles.textarea}`}
              placeholder="Add more details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Status + Deadline row */}
          <div className={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="task-deadline">Deadline</label>
              <input
                id="task-deadline"
                className="form-input"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">Assignee</label>
            <select
              id="task-assignee"
              className="form-input"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          {/* Footer buttons */}
          <div className={styles.btnRow}>
            <button
              id="modal-cancel-btn"
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              id="modal-save-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
