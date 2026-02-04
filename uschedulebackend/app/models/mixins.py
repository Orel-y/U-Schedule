import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, declared_attr

class AuditableMixin:
    @declared_attr
    def created_at(self, cls) -> Mapped[datetime]:
        return mapped_column(DateTime, default=datetime.now, nullable=False)

    @declared_attr
    def updated_at(self, cls) -> Mapped[datetime | None]:
        return mapped_column(DateTime, onupdate=datetime.now)

    @declared_attr
    def deleted_at(self, cls) -> Mapped[datetime | None]:
        return mapped_column(DateTime)

    @declared_attr
    def created_by_id(self, cls) -> Mapped[uuid.UUID | None]:
        return mapped_column(ForeignKey("users.id"), nullable=True)

    @declared_attr
    def updated_by_id(self, cls) -> Mapped[uuid.UUID | None]:
        return mapped_column(ForeignKey("users.id"), nullable=True)

    @declared_attr
    def created_by(self, cls):
        return relationship("User", foreign_keys=[cls.created_by_id], lazy="joined")

    @declared_attr
    def updated_by(self, cls):
        return relationship("User", foreign_keys=[cls.updated_by_id], lazy="joined")