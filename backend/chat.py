import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from config import settings

router = APIRouter()

# Groq OpenAI-compatible endpoint
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"


@router.post("/chat", response_model=schemas.ChatResponse, tags=["Chat"])
def chat_with_ai(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """AI Chatbot endpoint powered by Groq (Llama 3.1)."""
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set GROQ_API_KEY.",
        )

    # Fetch current tasks from database
    tasks = db.query(models.Task).all()
    tasks_text = "\n".join(
        [
            f"- ID {t.id}: '{t.title}' | Status: {t.status.value} | "
            f"Deadline: {t.deadline.strftime('%Y-%m-%d') if t.deadline else 'No deadline'} | "
            f"Assignee: {t.assignee.username if t.assignee else 'Unassigned'} | "
            f"Description: {t.description or 'N/A'}"
            for t in tasks
        ]
    ) or "No tasks found."

    system_prompt = f"""You are a helpful task management assistant. You have access to the current task data below.
Answer the user's questions clearly and concisely based on this data.
If the user asks to create, update, or delete tasks, politely inform them to use the task board UI.

Current Tasks Data:
{tasks_text}

User asking: {current_user.username}
"""

    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": payload.message},
                ],
                "max_tokens": 512,
                "temperature": 0.7,
            },
            timeout=30,
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"AI service error: {response.text}",
            )

        data = response.json()
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply}

    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI service timed out. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
