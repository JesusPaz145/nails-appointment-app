from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    name: str
    username: str # mapped to "user" column
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    usr_lvl: int
    
    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    nombre_servicio: str
    precio: float
    duracion_minutos: int
    descripcion: Optional[str] = None
    categoria: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    servicio_id: int
    fecha_cita: date
    hora_inicio: time
    cliente_nombre: str
    cliente_telefono: str
    cliente_email: str
    notas: Optional[str] = None

class AppointmentCreate(BaseModel):
    servicio_id: int
    fecha_cita: date
    hora_inicio: time
    cliente_nombre: Optional[str] = None
    cliente_telefono: Optional[str] = None
    cliente_email: Optional[str] = None
    notas: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    usuario_id: int
    hora_fin: time
    estado: str
    
    # We might want to nest Service info here
    servicio: Optional[Service] = None

    class Config:
        from_attributes = True

# Availability Request
class AvailabilityQuery(BaseModel):
    fecha: date
    servicio_id: int

# Admin Schemas
class UserUpdateLevel(BaseModel):
    usr_lvl: int

class HorarioBase(BaseModel):
    dia_semana: int
    hora_inicio: time
    hora_fin: time
    activo: bool

class HorarioUpdate(BaseModel):
    hora_inicio: time
    hora_fin: time
    activo: bool

class Horario(HorarioBase):
    id: int
    class Config:
        from_attributes = True

class DiaBloqueadoBase(BaseModel):
    fecha: date
    motivo: Optional[str] = None

class DiaBloqueadoCreate(DiaBloqueadoBase):
    pass

class DiaBloqueado(DiaBloqueadoBase):
    id: int
    class Config:
        from_attributes = True
