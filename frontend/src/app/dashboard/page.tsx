"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchTasks, fetchUsers, logout, getCurrentUser } from "@/lib/api";
import { Task, TaskStatus, User } from "@/lib/types";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import Chatbot from "@/components/Chatbot";
import styles from "./dashboard.module.css";

const COLUMNS: { status: TaskStatus; label: string; icon: string }[] = [
  { status: "Todo", label: "To Do", icon: "○" },
  { status: "In Progress", label: "In Progress", icon: "◑" },
  { status: "Done", label: "Done", icon: "●" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const loadData = useCallback(async () => {
    try {
      const [t, u] = await Promise.all([fetchTasks(), fetchUsers()]);
      setTasks(t);
      setUsers(u);
    } catch {
      // handled by api client (redirects on 401)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function openCreateModal() {
    setEditingTask(null);
    setShowModal(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setShowModal(true);
  }

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchAssignee =
      !filterAssignee || t.assignee_id?.toString() === filterAssignee;
    return matchSearch && matchAssignee;
  });

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "Todo").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Done").length,
  };

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Loading your workspace…</p>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className={styles.navbar} id="main-navbar">
        <div className={styles.navLeft}>
          <div className={styles.logoMark}>
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="11" height="11" rx="3" fill="#6c63ff" />
              <rect x="15" y="2" width="11" height="11" rx="3" fill="#6c63ff" opacity="0.6" />
              <rect x="2" y="15" width="11" height="11" rx="3" fill="#6c63ff" opacity="0.6" />
              <rect x="15" y="15" width="11" height="11" rx="3" fill="#22d3ee" />
            </svg>
          </div>
          <span className={styles.navBrand}>TaskFlow</span>
        </div>

        <div className={styles.navRight}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              {currentUser?.username.slice(0, 2).toUpperCase()}
            </div>
            <span className={styles.userName}>{currentUser?.username}</span>
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Stats Strip ─────────────────────────────────────────── */}
      <section className={styles.statsStrip} id="stats-section">
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total Tasks</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: "var(--status-todo-text)" }}>{stats.todo}</span>
          <span className={styles.statLabel}>To Do</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: "var(--status-inprogress-text)" }}>{stats.inProgress}</span>
          <span className={styles.statLabel}>In Progress</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: "var(--status-done-text)" }}>{stats.done}</span>
          <span className={styles.statLabel}>Done</span>
        </div>
        <div className={styles.statDivider} />
        {/* Progress bar */}
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span className={styles.statLabel}>Completion</span>
            <span className={styles.progressPct}>{completionPct}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className={styles.toolbar} id="toolbar-section">
        <div className={styles.toolbarLeft}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-tasks-input"
              type="text"
              className={styles.searchInput}
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter by assignee */}
          <select
            id="filter-assignee-select"
            className={`form-input ${styles.filterSelect}`}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </div>

        <button
          id="create-task-btn"
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      {/* ── Kanban Board ────────────────────────────────────────── */}
      <section className={styles.board} id="kanban-board">
        {COLUMNS.map(({ status, label, icon }) => {
          const col = tasksByStatus(status);
          return (
            <div key={status} className={styles.column} id={`column-${status.replace(" ", "-").toLowerCase()}`}>
              {/* Column Header */}
              <div className={styles.colHeader}>
                <div className={styles.colHeaderLeft}>
                  <span className={styles.colIcon}>{icon}</span>
                  <h2 className={styles.colTitle}>{label}</h2>
                  <span className={styles.colCount}>{col.length}</span>
                </div>
                <button
                  id={`add-task-${status.replace(" ", "-").toLowerCase()}`}
                  className={styles.colAddBtn}
                  title={`Add task to ${label}`}
                  onClick={openCreateModal}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Cards */}
              <div className={styles.colBody}>
                {col.length === 0 ? (
                  <div className={styles.emptyCol}>
                    <p>No tasks here</p>
                  </div>
                ) : (
                  col.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditModal}
                      onRefresh={loadData}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}

      {/* ── AI Chatbot ──────────────────────────────────────────── */}
      <Chatbot />
    </main>
  );
}
