import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Build DB URL from env vars
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

if not all([DB_USER, DB_HOST, DB_PORT, DB_NAME]):
    # Note: DB_PASS might be empty in some local configs, but usually required in prod.
    # Adjust logic if empty password is allowed.
    print("Warning: Some database environment variables are missing.")

import urllib.parse

encoded_user = urllib.parse.quote_plus(DB_USER)
encoded_pass = urllib.parse.quote_plus(DB_PASS)

# AsyncPG URL
# AsyncPG URL
DATABASE_URL = f"postgresql+asyncpg://{encoded_user}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"DEBUG: Intentando conectar a la DB en host='{DB_HOST}', port='{DB_PORT}', name='{DB_NAME}'")

engine = create_async_engine(DATABASE_URL, echo=False)

async_session_factory = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session_factory() as session:
        yield session
