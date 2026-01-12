from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Time, Text, Numeric
from sqlalchemy.orm import relationship
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios_sistema"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user = Column(String, unique=True, index=True)
    pwd = Column(String)
    email = Column(String)
    phone = Column(String)
    usr_lvl = Column(Integer, default=2)

    @property
    def username(self):
        return self.user

    citas = relationship("Cita", back_populates="usuario")

class Servicio(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True)
    nombre_servicio = Column(String)
    precio = Column(Numeric)
    duracion_minutos = Column(Integer)
    descripcion = Column(Text)

    citas = relationship("Cita", back_populates="servicio")

class Cita(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios_sistema.id"), nullable=True) # nullable if guest? Schema suggests user login required
    servicio_id = Column(Integer, ForeignKey("servicios.id"))
    
    cliente_nombre = Column(String)
    cliente_telefono = Column(String)
    cliente_email = Column(String)
    
    fecha_cita = Column(Date) # Stored as YYYY-MM-DD
    hora_inicio = Column(Time)
    hora_fin = Column(Time)
    
    notas = Column(Text, nullable=True)
    estado = Column(String, default="pendiente") # pendiente, confirmada, cancelada, completada

    usuario = relationship("Usuario", back_populates="citas")
    servicio = relationship("Servicio", back_populates="citas")

class Horario(Base):
    __tablename__ = "horarios_disponibles"

    id = Column(Integer, primary_key=True, index=True)
    dia_semana = Column(Integer) # 0-6
    hora_inicio = Column(Time)
    hora_fin = Column(Time)
    activo = Column(Boolean, default=True)

class DiaBloqueado(Base):
    __tablename__ = "dias_bloqueados"
    
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, unique=True)
    motivo = Column(String, nullable=True)
