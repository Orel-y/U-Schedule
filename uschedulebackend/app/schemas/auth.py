from pydantic import BaseModel, EmailStr
from app.schemas.base import BaseSchema
from uuid import UUID


class LoginRequest(BaseSchema):
    username: str
    password: str

class TokenResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseSchema):
    username: str
    email: EmailStr
    password: str
    full_name: str | None = None
    role: str | None = None

class RegisterResponse(BaseSchema):
    id: UUID
    username: str
    email: EmailStr
    full_name: str | None = None