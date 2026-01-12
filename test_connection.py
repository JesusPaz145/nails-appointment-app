import asyncio
import asyncpg
import os
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

print(f"Testing connection to {DB_HOST}:{DB_PORT} as {DB_USER} for DB {DB_NAME}")
print(f"Password length: {len(DB_PASS) if DB_PASS else 0}")
print(f"Password starts with: {DB_PASS[:2] if DB_PASS else 'None'}")
print(f"Password ends with: {DB_PASS[-2:] if DB_PASS else 'None'}")

# Test 1: Direct asyncpg connection (no URL encoding needed for params)
async def test_connect():
    try:
        print("\nAttempting direct asyncpg connect...")
        conn = await asyncpg.connect(
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            host=DB_HOST,
            port=DB_PORT
        )
        print("SUCCESS: Connected via asyncpg directly!")
        await conn.close()
    except Exception as e:
        print(f"FAILURE: asyncpg direct connect failed: {e}")

# Test 2: URL style (simulating SQLAlchemy)
async def test_connect_url():
    try:
        print("\nAttempting URL connect (simulating SQLAlchemy string construction)...")
        encoded_user = urllib.parse.quote_plus(DB_USER)
        encoded_pass = urllib.parse.quote_plus(DB_PASS)
        # Note: asyncpg.connect(dsn)
        dsn = f"postgresql://{encoded_user}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        print(f"DSN (masked): postgresql://{encoded_user}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")
        
        conn = await asyncpg.connect(dsn)
        print("SUCCESS: Connected via DSN!")
        await conn.close()
    except Exception as e:
        print(f"FAILURE: DSN connect failed: {e}")

async def test_connect_postgres_db():
    try:
        print("\nAttempting connect to 'postgres' DB (maintenance db)...")
        conn = await asyncpg.connect(
            user=DB_USER,
            password=DB_PASS,
            database='postgres',
            host=DB_HOST,
            port=DB_PORT
        )
        print("SUCCESS: Connected to 'postgres' DB!")
        await conn.close()
    except Exception as e:
        print(f"FAILURE: 'postgres' DB connect failed: {e}")

async def test_connect_ssl():
    try:
        print("\nAttempting connect with ssl='require'...")
        # create SSL context if needed, but 'require' might just work if supported
        conn = await asyncpg.connect(
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            host=DB_HOST,
            port=DB_PORT,
            ssl='require'
        )
        print("SUCCESS: Connected with SSL!")
        await conn.close()
    except Exception as e:
        print(f"FAILURE: SSL connect failed: {e}")

async def main():
    await test_connect()
    # await test_connect_url() # Skipping URL test as it's redundant if direct fails
    await test_connect_postgres_db()
    await test_connect_ssl()


if __name__ == "__main__":
    asyncio.run(main())
