
from pydantic import BaseModel
from enum import Enum
from typing import Optional

class UserRole(str, Enum):
    HEAD = "HEAD"
    VIEWER = "VIEWER"

class UserBase(BaseModel):
    username: str
    full_name: str
    role: UserRole

class User(UserBase):
    id: str
    hashed_password: str

class UserOut(UserBase):
    id: str
