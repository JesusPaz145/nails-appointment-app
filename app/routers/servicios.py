from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Annotated

from ..database import get_db
from ..models import Servicio, Usuario
from ..schemas import Service, ServiceCreate
from ..dependencies import get_current_admin_user

router = APIRouter(
    prefix="/api/servicios",
    tags=["servicios"],
)

@router.get("/", response_model=List[Service])
async def get_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Servicio).order_by(Servicio.id))
    return result.scalars().all()

@router.post("/", response_model=Service)
async def create_service(
    service: ServiceCreate, 
    current_user: Annotated[Usuario, Depends(get_current_admin_user)],
    db: AsyncSession = Depends(get_db)
):
    new_service = Servicio(**service.model_dump())
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    return new_service

@router.put("/{id}", response_model=Service)
async def update_service(
    id: int, 
    service: ServiceCreate, 
    current_user: Annotated[Usuario, Depends(get_current_admin_user)],
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Servicio).where(Servicio.id == id))
    existing_service = result.scalars().first()
    if not existing_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for key, value in service.model_dump().items():
        setattr(existing_service, key, value)
    
    await db.commit()
    await db.refresh(existing_service)
    return existing_service

@router.delete("/{id}")
async def delete_service(
    id: int, 
    current_user: Annotated[Usuario, Depends(get_current_admin_user)],
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Servicio).where(Servicio.id == id))
    existing_service = result.scalars().first()
    if not existing_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    await db.delete(existing_service)
    await db.commit()
    return {"msg": "Service deleted"}
