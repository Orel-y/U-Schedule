
import time
from typing import Dict, Any, Optional
from jose import jwt
from fastapi import HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from ..models.user import User, UserRole

SECRET_KEY = "super_secret_university_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mock User Storage
MOCK_USERS = {
    "head_admin": {
        "id": "u-1",
        "username": "head_admin",
        "full_name": "Dr. Sarah Miller",
        "role": UserRole.HEAD,
        "password": "password" # Real apps use bcrypt.hash
    },
    "viewer_user": {
        "id": "u-2",
        "username": "viewer_user",
        "full_name": "James Wilson",
        "role": UserRole.VIEWER,
        "password": "password"
    }
}

def create_access_token(data: Dict[str, Any]):
    to_encode = data.copy()
    expire = time.time() + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Security(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user_dict = MOCK_USERS.get(username)
    if user_dict is None:
        raise credentials_exception
    return user_dict

async def check_is_head(current_user: Dict = Security(get_current_user)):
    if current_user["role"] != UserRole.HEAD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to Academic Heads only."
        )
    return current_user
