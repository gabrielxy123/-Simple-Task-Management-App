# 🚀 TaskFlow – Simple Task Management App

A modern, full-stack task management application built for the **Moonlay Technologies Technical Test**.

![Tech Stack](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Auth-JWT-orange)

---

## ✨ Features

- ✅ **Login** with JWT authentication
- ✅ **Kanban Board** – Drag/move tasks across Todo, In Progress, Done columns
- ✅ **Full CRUD** – Create, Read, Update, Delete tasks
- ✅ **Assignee** – Assign tasks to team members
- ✅ **Deadline tracking** with overdue indicator
- ✅ **Search & Filter** by keyword and assignee
- ✅ **Real-time stats** with completion progress bar
- ⭐ **Bonus: AI Chatbot** – Powered by Google Gemini, answers questions about your tasks

---

## 🛠️ Tech Stack

| Layer     | Technology                         |
|-----------|-------------------------------------|
| Frontend  | Next.js 15 (App Router) + TypeScript |
| Styling   | Vanilla CSS Modules (Dark Theme)   |
| Backend   | Python 3.12 + FastAPI              |
| ORM       | SQLAlchemy 2.0                     |
| Database  | PostgreSQL                         |
| Auth      | JWT (python-jose + passlib bcrypt) |
| AI Bonus  | Google Gemini API (gemini-1.5-flash)|

---

## ⚙️ Getting Started

### Prerequisites

- Python 3.10+ and `pip`
- Node.js 18+ and `npm`
- PostgreSQL (running locally or via Docker)

---

### 1. Clone & Setup

```bash
git clone <repo-url>
cd Simple-Task-Management-App
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskdb
SECRET_KEY=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here   # optional, for AI chatbot
```

```bash
# Create database (PostgreSQL must be running)
# Connect to psql and run: CREATE DATABASE taskdb;

# Run the seeder (creates tables + default users + sample tasks)
python seed.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

Backend running at: **http://localhost:8000**  
Swagger API Docs: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you ran npm install)
npm install

# Start the development server
npm run dev
```

Frontend running at: **http://localhost:3000**

---

## 🔑 Default Login Credentials

| Username  | Password    |
|-----------|-------------|
| `admin`   | `admin123`  |
| `alice`   | `alice123`  |
| `bob`     | `bob123`    |
| `charlie` | `charlie123`|

---

## 📖 API Documentation

Once the backend is running, visit **http://localhost:8000/docs** for the interactive Swagger UI.

### Key Endpoints

| Method | Endpoint            | Description               | Auth Required |
|--------|---------------------|---------------------------|---------------|
| POST   | `/api/login`        | Login & get JWT token     | ❌            |
| GET    | `/api/users`        | List all users            | ✅            |
| GET    | `/api/tasks`        | Get all tasks             | ✅            |
| POST   | `/api/tasks`        | Create a new task         | ✅            |
| PUT    | `/api/tasks/{id}`   | Update a task             | ✅            |
| DELETE | `/api/tasks/{id}`   | Delete a task             | ✅            |
| POST   | `/api/chat`         | AI chatbot (Bonus)        | ✅            |

---

## 📁 Project Structure

```
Simple-Task-Management-App/
├── backend/
│   ├── main.py          # FastAPI app entry point
│   ├── config.py        # Environment settings
│   ├── database.py      # SQLAlchemy setup
│   ├── models.py        # ORM models (User, Task)
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # JWT auth utilities
│   ├── routes.py        # API route handlers
│   ├── chat.py          # AI chatbot endpoint
│   ├── seed.py          # Database seeder
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/
        │   ├── globals.css      # Global design system
        │   ├── layout.tsx       # Root layout
        │   ├── page.tsx         # Root redirect
        │   ├── login/           # Login page
        │   └── dashboard/       # Kanban board dashboard
        ├── components/
        │   ├── TaskCard.tsx     # Individual task card
        │   ├── TaskModal.tsx    # Create/edit modal
        │   └── Chatbot.tsx      # AI chatbot FAB + panel
        └── lib/
            ├── api.ts           # API client
            └── types.ts         # TypeScript types
```

---

## 🤖 AI Chatbot (Bonus)

The chatbot is powered by **Google Gemini**. It automatically receives your current task data as context, so you can ask questions like:

- *"What tasks are overdue?"*
- *"Who is responsible for In Progress tasks?"*
- *"How many tasks are done?"*

To enable it, add your `GEMINI_API_KEY` to `backend/.env`.
