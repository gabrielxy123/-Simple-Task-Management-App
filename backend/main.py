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

# CORS – allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
