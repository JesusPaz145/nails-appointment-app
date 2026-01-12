from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Annotated

from ..database import get_db
from ..models import Horario, DiaBloqueado, Usuario
from ..schemas import Horario as HorarioSchema, HorarioUpdate, DiaBloqueado as DiaBloqueadoSchema, DiaBloqueadoCreate
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/configuracion",
    tags=["configuracion"],
)

# --- Horarios ---

@router.get("/horarios", response_model=List[HorarioSchema])
async def get_horarios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Horario).order_by(Horario.dia_semana))
    return result.scalars().all()

@router.put("/horarios/{id}", response_model=HorarioSchema)
async def update_horario(
    id: int,
    horario_in: HorarioUpdate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if current_user.usr_lvl != 1:
        raise HTTPException(status_code=403, detail="Admin only")
        
    result = await db.execute(select(Horario).where(Horario.id == id))
    horario = result.scalars().first()
    
    if not horario:
        raise HTTPException(status_code=404, detail="Horario not found")
        
    horario.hora_inicio = horario_in.hora_inicio
    horario.hora_fin = horario_in.hora_fin
    horario.activo = horario_in.activo
    
    await db.commit()
    await db.refresh(horario)
    return horario

# --- Dias Bloqueados ---

@router.get("/bloqueos", response_model=List[DiaBloqueadoSchema])
async def get_bloqueos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DiaBloqueado).order_by(DiaBloqueado.fecha))
    return result.scalars().all()

@router.post("/bloqueos", response_model=DiaBloqueadoSchema)
async def create_bloqueo(
    bloqueo_in: DiaBloqueadoCreate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if current_user.usr_lvl != 1:
        raise HTTPException(status_code=403, detail="Admin only")
        
    # Check duplicate
    res = await db.execute(select(DiaBloqueado).where(DiaBloqueado.fecha == bloqueo_in.fecha))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="Date already blocked")
        
    new_bloqueo = DiaBloqueado(**bloqueo_in.model_dump())
    db.add(new_bloqueo)
    await db.commit()
    await db.refresh(new_bloqueo)
    return new_bloqueo

@router.delete("/bloqueos/{id}")
async def delete_bloqueo(
    id: int,
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if current_user.usr_lvl != 1:
        raise HTTPException(status_code=403, detail="Admin only")
        
    await db.execute(delete(DiaBloqueado).where(DiaBloqueado.id == id))
    await db.commit()
    return {"msg": "Deleted"}
