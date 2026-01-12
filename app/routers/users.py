from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Annotated

from ..database import get_db
from ..models import Usuario
from ..schemas import User, UserUpdateLevel
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/usuarios",
    tags=["usuarios"],
)

@router.get("/", response_model=List[User])
async def get_users(
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if current_user.usr_lvl != 1:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.execute(select(Usuario).order_by(Usuario.id))
    return result.scalars().all()

@router.put("/{id}/level", response_model=User)
async def update_user_level(
    id: int,
    user_in: UserUpdateLevel,
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if current_user.usr_lvl != 1:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.execute(select(Usuario).where(Usuario.id == id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.usr_lvl = user_in.usr_lvl
    await db.commit()
    await db.refresh(user)
    return user
