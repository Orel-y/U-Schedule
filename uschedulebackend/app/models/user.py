import uuid
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.config import BaseModel
from app.models.enums import UserStatus
from app.models.mixins import AuditableMixin
from app.models.enums import Role

class User(BaseModel, AuditableMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column( primary_key=True, default=uuid.uuid4 )
    full_name: Mapped[str | None] = mapped_column(String(255))
    username: Mapped[str] = mapped_column( String(100), unique=True, nullable=False )
    email: Mapped[str] = mapped_column( String(255), unique=True, nullable=False )
    hashed_password: Mapped[str] = mapped_column( String(255), nullable=False )
    status: Mapped[UserStatus] = mapped_column( Enum(UserStatus), default=UserStatus.ACTIVE )

    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.DATA_MANAGER)