from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.auth.security import hash_password
from fastapi import HTTPException, status
from uuid import UUID

from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo


    async def register_user(self, full_name: str, username: str, email: str, password: str, role: str) -> User:
        # Check if email or username exists
        if await self.user_repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        if await self.user_repo.get_by_username(username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        hashed_password = hash_password(password[:72])  # ensure bcrypt limit

        # Create user
        return await self.user_repo.create_user(
            full_name,
            username,
            email,
            hashed_password,
            role
        )

    async def get_profile(self, user_id: UUID) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def list_users(self):
        users = await self.user_repo.list_all()
        return users

    async def update_user(self, user_id: UUID, payload: UserUpdate) -> User:
        user = await self.user_repo.get_by_id(user_id)

        update_data = payload.dict(exclude_unset=True)

        return await self.user_repo.update(user, update_data)