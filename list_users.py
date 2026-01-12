import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

encoded_user = urllib.parse.quote_plus(DB_USER)
encoded_pass = urllib.parse.quote_plus(DB_PASS)
DATABASE_URL = f"postgresql+asyncpg://{encoded_user}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

async def check_users():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        print(f"Connecting to database: {DB_NAME} on {DB_HOST}:{DB_PORT}")
        try:
            # Check Users
            result_users = await conn.execute(text("SELECT id, \"user\", email, usr_lvl FROM usuarios_sistema"))
            users = result_users.fetchall()
            print(f"Users found: {len(users)}")
            for u in users:
                 print(f" - User: {u.user}, Level: {u.usr_lvl}")

            # Check Services
            result_services = await conn.execute(text("SELECT id, nombre_servicio FROM servicios"))
            services = result_services.fetchall()
            print(f"Services found: {len(services)}")
            if services:
                print(f" - First Service: {services[0].nombre_servicio}")
        except Exception as e:
            print(f"Error querying users: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_users())
