from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from config import settings

router = APIRouter()


@router.post("/chat", response_model=schemas.ChatResponse, tags=["Chat"])
def chat_with_ai(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """AI Chatbot endpoint powered by Google Gemini. Answers questions about tasks."""
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service is not configured. Please set GEMINI_API_KEY.")

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
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_prompt,
        )
        response = model.generate_content(payload.message)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
