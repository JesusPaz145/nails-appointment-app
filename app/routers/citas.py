from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Annotated, Optional
from datetime import date, datetime, timedelta, time

from ..database import get_db
from ..models import Cita, Servicio, Horario, Usuario
from ..schemas import Appointment, AppointmentCreate
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/citas",
    tags=["citas"],
)

@router.get("/", response_model=List[Appointment])
async def get_citas(
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if current_user.usr_lvl == 1:
        # Admin sees all
        result = await db.execute(
            select(Cita)
            .options(selectinload(Cita.servicio))
            .order_by(Cita.fecha_cita.desc(), Cita.hora_inicio.desc())
        )
        return result.scalars().all()
    else:
        # User sees own
        result = await db.execute(
            select(Cita)
            .where(Cita.usuario_id == current_user.id)
            .options(selectinload(Cita.servicio))
            .order_by(Cita.id.desc())
        )
        return result.scalars().all()

@router.post("/", response_model=Appointment)
async def create_cita(
    cita_in: AppointmentCreate,
    current_user: Annotated[Usuario, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    # 1. Get Service Duration
    svc_result = await db.execute(select(Servicio).where(Servicio.id == cita_in.servicio_id))
    servicio = svc_result.scalars().first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio not found")
    
    duration = servicio.duracion_minutos
    
    # 2. Calculate End Time
    # Combine date and time to datetime
    start_dt = datetime.combine(cita_in.fecha_cita, cita_in.hora_inicio)
    end_dt = start_dt + timedelta(minutes=duration)
    
    # Extract time ensures we stay within same day logic (though backend js didn't seem to enforce single day strictness beyond simple time string logic, but SQL time type handles it)
    hora_fin = end_dt.time()
    
    # 3. Check Availability (Overlap)
    # (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
    query = select(Cita).where(
        Cita.fecha_cita == cita_in.fecha_cita,
        Cita.estado != 'cancelada',
        and_(
            Cita.hora_inicio < hora_fin,
            Cita.hora_fin > cita_in.hora_inicio
        )
    )
    overlap_result = await db.execute(query)
    if overlap_result.scalars().first():
        raise HTTPException(status_code=400, detail="Slot not available, please choose another time.")
    
    # 4. Create Appointment
    # Fill missing user details from current_user
    cita_data = cita_in.model_dump()
    if not cita_data.get('cliente_nombre'):
        cita_data['cliente_nombre'] = current_user.name or current_user.user or "Cliente"
    if not cita_data.get('cliente_email'):
        cita_data['cliente_email'] = current_user.email
    if not cita_data.get('cliente_telefono'):
        cita_data['cliente_telefono'] = current_user.phone

    new_cita = Cita(
        **cita_data,
        hora_fin=hora_fin,
        usuario_id=current_user.id,
        estado="pendiente"
    )
    db.add(new_cita)
    await db.commit()
    # Eager load relationship to prevent MissingGreenlet error
    result = await db.execute(
        select(Cita).options(selectinload(Cita.servicio)).where(Cita.id == new_cita.id)
    )
    return result.scalars().first()

@router.get("/disponibilidad")
async def get_availability(
    fecha: date,
    servicio_id: int,
    db: AsyncSession = Depends(get_db)
):
    # 0. Check Blocked Days
    from ..models import DiaBloqueado
    blocked_res = await db.execute(select(DiaBloqueado).where(DiaBloqueado.fecha == fecha))
    if blocked_res.scalars().first():
        return []

    # 1. Get Day of Week
    py_weekday = fecha.weekday()
    js_weekday = (py_weekday + 1) % 7 
    
    # 2. Get Business Hours
    horario_res = await db.execute(select(Horario).where(Horario.dia_semana == js_weekday, Horario.activo == True))
    horario = horario_res.scalars().first()
    
    if not horario:
        return [] 
    
    # 3. Get Service Duration
    svc_res = await db.execute(select(Servicio).where(Servicio.id == servicio_id))
    servicio = svc_res.scalars().first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Service not found")
    duration = servicio.duracion_minutos
    
    # 4. Get Existing Appointments
    citas_res = await db.execute(select(Cita).where(Cita.fecha_cita == fecha, Cita.estado != 'cancelada'))
    existing_citas = citas_res.scalars().all()
    
    # 5. Generate Slots
    def to_minutes(t: time):
        return t.hour * 60 + t.minute
    
    def from_minutes(m):
        h = m // 60
        mn = m % 60
        return time(h, mn)
        
    start_mins = to_minutes(horario.hora_inicio)
    end_mins = to_minutes(horario.hora_fin)
    step = 30
    
    slots = []
    
    current_time = start_mins
    while current_time + duration <= end_mins:
        slot_start = current_time
        slot_end = current_time + duration
        
        is_free = True
        for cita in existing_citas:
            c_start = to_minutes(cita.hora_inicio)
            c_end = to_minutes(cita.hora_fin)
            if slot_start < c_end and slot_end > c_start:
                is_free = False
                break
        
        t_obj = from_minutes(slot_start)
        slots.append({
            "hora": t_obj.strftime("%H:%M:%S"),
            "disponible": is_free
        })
            
        current_time += step
        
    return slots

@router.put("/{id}")
async def update_cita_status(
    id: int, 
    estado: str = Body(embed=True), # expects {"estado": "..."}
    current_user: Annotated[Usuario, Depends(get_current_user)] = None,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Cita).where(Cita.id == id))
    cita = res.scalars().first()
    
    if not cita:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Check permissions
    if current_user.usr_lvl != 1:
        # Non-admin can only CANCEL their own appointment
        if cita.usuario_id != current_user.id:
             raise HTTPException(status_code=403, detail="Not authorized")
        if estado != 'cancelada':
             raise HTTPException(status_code=403, detail="Users can only cancel appointments")

    cita.estado = estado
    await db.commit()
    await db.refresh(cita)
    return cita
