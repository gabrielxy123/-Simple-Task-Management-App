from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from models import TaskStatus


# ─── User Schemas ────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── Task Schemas ─────────────────────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    assignee: Optional[UserOut] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
