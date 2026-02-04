from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository
from uuid import UUID

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str):
        stmt = select(User).where(User.email == email, User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_username(self, username: str):
        stmt = select(User).where(User.username == username, User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalars().first()


    async def get_by_id(self, user_id: UUID):
        return await super().get_by_id(user_id)

    async def create_user(self, full_name: str, username: str, email: str, hashed_password: str, role: str):
        new_user = User(
            full_name=full_name,
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=role
        )

        self.session.add(new_user)
        await self.session.commit()
        await self.session.refresh(new_user)
        return new_user

    async def update(self, user: User, data: dict):
        for key, value in data.items():
            setattr(user, key, value)
        await self.session.commit()
        await self.session.refresh(user)

        return user