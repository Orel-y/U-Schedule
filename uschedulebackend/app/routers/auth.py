from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.auth.security import verify_password, create_access_token
from app.core.database import get_session
from app.repositories.user_repo import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse, RegisterRequest, RegisterResponse
from app.services.user_services import UserService
from app.schemas.user import UserResponse, UserUpdate
from app.auth.dependencies import get_current_user
from app.models.user import User
from uuid import UUID



router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=RegisterResponse)
async def register_user(payload: RegisterRequest, db: AsyncSession = Depends(get_session)):
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)

    return await user_service.register_user(
        full_name=payload.full_name,
        username=payload.username,
        email=str(payload.email),
        password=payload.password,
        role=payload.role,

    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    repo = UserRepository(session)
    user = await repo.get_by_username(payload.username)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    repo = UserRepository(session)
    service = UserService(repo)
    return await service.get_profile(current_user.id)


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
        session: AsyncSession = Depends(get_session),
        current_user: User = Depends(get_current_user)):

    repo = UserRepository(session)
    service = UserService(repo)
    return await service.list_users()

@router.put("/user/{user_id}", response_model=UserResponse)
async def update_user(
        user_id: UUID,
        payload: UserUpdate,
        session: AsyncSession = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ):

    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admin can update user")

    repo = UserRepository(session)
    service = UserService(repo)

    return await service.update_user(user_id, payload)