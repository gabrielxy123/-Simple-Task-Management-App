"""
Database seeder: Creates default users and sample tasks.
Run with: python seed.py
"""
from database import SessionLocal, engine, Base
import models
from auth import hash_password
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # Create users
        users_data = [
            {"username": "admin", "password": "admin123"},
            {"username": "alice", "password": "alice123"},
            {"username": "bob", "password": "bob123"},
            {"username": "charlie", "password": "charlie123"},
        ]
        users = []
        for u in users_data:
            user = models.User(username=u["username"], password_hash=hash_password(u["password"]))
            db.add(user)
            users.append(user)
        db.commit()
        for u in users:
            db.refresh(u)

        print(f"✅ Created {len(users)} users.")

        # Create sample tasks
        now = datetime.utcnow()
        tasks_data = [
            {
                "title": "Setup Project Repository",
                "description": "Initialize Git repository and configure CI/CD pipeline.",
                "status": models.TaskStatus.done,
                "deadline": now - timedelta(days=5),
                "assignee_id": users[0].id,
            },
            {
                "title": "Design UI Mockups",
                "description": "Create wireframes and high-fidelity mockups for the task board.",
                "status": models.TaskStatus.done,
                "deadline": now - timedelta(days=2),
                "assignee_id": users[1].id,
            },
            {
                "title": "Implement REST API",
                "description": "Build FastAPI backend with CRUD endpoints for tasks and JWT authentication.",
                "status": models.TaskStatus.in_progress,
                "deadline": now + timedelta(days=2),
                "assignee_id": users[0].id,
            },
            {
                "title": "Build Kanban Frontend",
                "description": "Develop Next.js frontend with drag-and-drop Kanban board.",
                "status": models.TaskStatus.in_progress,
                "deadline": now + timedelta(days=3),
                "assignee_id": users[1].id,
            },
            {
                "title": "Write Unit Tests",
                "description": "Cover all API endpoints with pytest unit tests.",
                "status": models.TaskStatus.todo,
                "deadline": now + timedelta(days=5),
                "assignee_id": users[2].id,
            },
            {
                "title": "Deploy to Production",
                "description": "Deploy backend to cloud server and frontend to Vercel.",
                "status": models.TaskStatus.todo,
                "deadline": now + timedelta(days=7),
                "assignee_id": users[3].id,
            },
            {
                "title": "AI Chatbot Integration",
                "description": "Integrate Google Gemini API for task-aware chatbot feature.",
                "status": models.TaskStatus.todo,
                "deadline": now + timedelta(days=4),
                "assignee_id": users[0].id,
            },
        ]
        for t in tasks_data:
            task = models.Task(**t)
            db.add(task)
        db.commit()

        print(f"✅ Created {len(tasks_data)} sample tasks.")
        print("\n🔑 Default Login Credentials:")
        for u in users_data:
            print(f"   username: {u['username']}  |  password: {u['password']}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
