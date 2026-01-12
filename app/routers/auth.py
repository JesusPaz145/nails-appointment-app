from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated

from ..database import get_db
from ..models import Usuario
from ..schemas import UserCreate, User, Token, UserLogin
from ..utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(Usuario).where(Usuario.user == user_in.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    hashed_password = get_password_hash(user_in.password)
    new_user = Usuario(
        name=user_in.name,
        user=user_in.username,
        pwd=hashed_password,
        email=user_in.email,
        phone=user_in.phone,
        usr_lvl=2 # Default user
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.user}, expires_delta=access_token_expires
    )
    
    # Set cookie (for web app)
    response.set_cookie(key="token", value=access_token, httponly=True, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(response: Response, form_data: UserLogin, db: AsyncSession = Depends(get_db)): # custom body instead of OAuth2PasswordRequestForm
    result = await db.execute(select(Usuario).where(Usuario.user == form_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.pwd):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user}, expires_delta=access_token_expires
    )
    
    response.set_cookie(key="token", value=access_token, httponly=True, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[Usuario, Depends(get_current_user)]):
    return current_user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("token")
    return {"msg": "Logged out successfully"}
