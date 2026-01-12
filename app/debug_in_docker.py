
import sys
import os

# Ensure we can see the 'app' package from within 'app' folder or root
# If running from /app (WORKDIR), expecting 'app' package to be importable
current_dir = os.getcwd() # /app
sys.path.append(current_dir)

print(f"Current Directory: {current_dir}")
print(f"PYTHONPATH: {sys.path}")
print("Checking contents of current directory:")
print(os.listdir(current_dir))
if os.path.exists(os.path.join(current_dir, 'app')):
    print("Contents of 'app' subdir:")
    print(os.listdir(os.path.join(current_dir, 'app')))

try:
    print("\n--- ATTEMPTING IMPORT ---")
    # Try importing the components that Main uses
    print("1. Importing database...")
    from app import database
    print("   Database imported.")

    print("2. Importing models...")
    from app import models
    print("   Models imported.")

    print("3. Importing schemas...")
    from app import schemas
    print("   Schemas imported.")

    print("4. Importing routers...")
    from app.routers import auth, citas, servicios, horarios, pages, users, configuracion
    print("   Routers imported.")

    print("5. Importing main...")
    import app.main
    print("\nSUCCESS: app.main imported successfully. The error might be in Uvicorn command or paths.")

except Exception as e:
    print(f"\nFAILURE: Critical Import Error.")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {e}")
    import traceback
    traceback.print_exc()
