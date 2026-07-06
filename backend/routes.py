from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user
from database import get_db

router = APIRouter()


# ─── Auth ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=schemas.Token, tags=["Auth"])
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.UserOut], tags=["Users"])
def get_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Return all users (for assignee dropdown)."""
    return db.query(models.User).order_by(models.User.username).all()


# ─── Tasks ────────────────────────────────────────────────────────────────────

@router.get("/tasks", response_model=List[schemas.TaskOut], tags=["Tasks"])
def get_tasks(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Return all tasks with assignee info."""
    return db.query(models.Task).order_by(models.Task.created_at.desc()).all()


@router.post("/tasks", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Create a new task."""
    task = models.Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=schemas.TaskOut, tags=["Tasks"])
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Update a task by ID."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_200_OK, tags=["Tasks"])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    """Delete a task by ID. Returns confirmation message."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_title = task.title
    db.delete(task)
    db.commit()
    return {"message": f"Task '{task_title}' deleted successfully", "id": task_id}
