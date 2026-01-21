from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, async_session_factory
from .models import Usuario
from .utils import get_password_hash
from sqlalchemy import select
from .routers import auth, servicios, citas, horarios, pages, users, configuracion
from contextlib import asynccontextmanager
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist
    retries = 5
    while retries > 0:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Database connected and tables created successfully.")
            
            # Crear usuario admin por defecto si no existe
            async with async_session_factory() as session:
                result = await session.execute(select(Usuario).where(Usuario.user == "admin"))
                user = result.scalars().first()
                if not user:
                    print("Creando usuario admin por defecto...")
                    hashed_pwd = get_password_hash("admin123")
                    new_user = Usuario(
                        name="Administrador",
                        user="admin",
                        pwd=hashed_pwd,
                        email="admin@nailsbyanais.com",
                        phone="0000000000",
                        usr_lvl=1
                    )
                    session.add(new_user)
                    await session.commit()
                    print("Usuario admin creado: admin / admin123")
            break
        except Exception as e:
            print(f"Database connection failed: {e}")
            retries -= 1
            if retries == 0:
                raise e
            print(f"Retrying in 5 seconds... ({retries} attempts left)")
            await asyncio.sleep(5)
    yield

app = FastAPI(lifespan=lifespan, title="Nails by Anais API")

# CORS (matches old server.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router)
app.include_router(servicios.router)
app.include_router(citas.router)
app.include_router(horarios.router)
app.include_router(users.router)
app.include_router(configuracion.router)
app.include_router(pages.router)

# Serve Static Files (Frontend) using standard HTML
# We mount /static for assets
app.mount("/static", StaticFiles(directory="app/static"), name="static")
