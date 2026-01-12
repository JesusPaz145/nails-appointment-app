from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Annotated
from pydantic import BaseModel
from datetime import time

from ..database import get_db
from ..models import Horario, Usuario
from ..dependencies import get_current_admin_user

router = APIRouter(
    prefix="/api/horarios",
    tags=["horarios"],
)

class HorarioUpdate(BaseModel):
    hora_inicio: time
    hora_fin: time
    activo: bool

class HorarioResponse(BaseModel):
    id: int
    dia_semana: int
    hora_inicio: time
    hora_fin: time
    activo: bool
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[HorarioResponse])
async def get_horarios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Horario).order_by(Horario.dia_semana))
    return result.scalars().all()

@router.put("/{id}", response_model=HorarioResponse)
async def update_horario(
    id: int, 
    horario: HorarioUpdate, 
    current_user: Annotated[Usuario, Depends(get_current_admin_user)],
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Horario).where(Horario.id == id))
    existing_horario = result.scalars().first()
    
    if not existing_horario:
        raise HTTPException(status_code=404, detail="Horario not found")
    
    existing_horario.hora_inicio = horario.hora_inicio
    existing_horario.hora_fin = horario.hora_fin
    existing_horario.activo = horario.activo
    
    await db.commit()
    await db.refresh(existing_horario)
    return existing_horario
