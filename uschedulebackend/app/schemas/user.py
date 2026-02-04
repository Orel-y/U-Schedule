from uuid import UUID
from pydantic import EmailStr
from app.schemas.base import BaseSchema
from app.models.enums import UserStatus

class UserCreate(BaseSchema):
    username: str
    email: str
    password: str
    full_name: str | None = None
    role_names: list[str]  # client sends role names

class UserUpdate(BaseSchema):
    username: str
    email: str
    full_name: str | None = None
    status: UserStatus | None = None
    role: str

    class Config:
        orm_mode = True

class UserResponse(BaseSchema):
    id: UUID
    username: str
    email: str
    full_name: str | None
    status: UserStatus
    role: str

    class Config:
        from_attributes = True