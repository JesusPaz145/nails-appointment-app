from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, servicios, citas, horarios, pages, users, configuracion
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise e
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
