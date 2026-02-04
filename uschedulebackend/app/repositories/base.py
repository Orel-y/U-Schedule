from datetime import datetime
from typing import Generic, TypeVar, Type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import select

ModelType = TypeVar("ModelType", bound=DeclarativeBase)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id):
        stmt = (
            select(self.model)
            .where(
                self.model.id == id,
                self.model.deleted_at.is_(None)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().unique().first()

    async def list_all(self):
        stmt = (select(self.model).where(self.model.deleted_at.is_(None)))
        result = await self.session.execute(stmt)
        return result.scalars().unique().all()