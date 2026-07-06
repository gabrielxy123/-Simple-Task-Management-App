from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "supersecretkey_changeme_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
