from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 – ensures models are registered before create_all
import routes
import chat

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management API",
    description="REST API for Simple Task Management App – Moonlay Technologies Technical Test",
    version="1.0.0",
)

# CORS – allow Next.js dev server + Vercel production
import os

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add custom production frontend URL from environment (set via Railway/Vercel)
if os.getenv("FRONTEND_URL"):
    ALLOWED_ORIGINS.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routes.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {"message": "Task Management API is running 🚀", "docs": "/docs"}
