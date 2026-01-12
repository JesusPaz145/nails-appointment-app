from typing import Annotated
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import get_db
from .models import Usuario
from .utils import SECRET_KEY, ALGORITHM
from .schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token", auto_error=False) # Allow missing header

async def get_current_user(
    request: Request,
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
):
    # Try getting token from cookie if header is missing
    if not token:
        token = request.cookies.get("token")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # We used "user" column for username
    result = await db.execute(select(Usuario).where(Usuario.user == token_data.username))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(current_user: Annotated[Usuario, Depends(get_current_user)]):
    if current_user.usr_lvl != 1:
        raise HTTPException(status_code=400, detail="Not enough privileges")
    return current_user
