import os
import sys
import subprocess

def main():
    # 1. Check if running inside virtual environment
    # sys.prefix != sys.base_prefix is a common way to check for venv (Python 3.3+)
    in_venv = sys.prefix != sys.base_prefix

    if not in_venv:
        # 2. If not in venv, check if one exists in the standard location
        venv_path = os.path.join(os.getcwd(), "venv")
        venv_python = os.path.join(venv_path, "bin", "python")
        
        if os.path.exists(venv_python):
            print(f"🔄 Switching to virtual environment at: {venv_path}")
            # Re-execute this script using the venv python
            # os.execv replaces the current process
            try:
                os.execv(venv_python, [venv_python] + sys.argv)
            except OSError as e:
                print(f"❌ Failed to switch to venv: {e}")
                sys.exit(1)
        else:
            print("⚠️  Warning: No virtual environment found at './venv'.")
            print("   Running with system Python. If this fails, please install dependencies.")

    # 3. Import uvicorn (now we should be in venv or have deps installed)
    try:
        import uvicorn
    except ImportError:
        print("\n❌ Error: 'uvicorn' module not found.")
        print("   It looks like dependencies are missing.")
        print("   Please run: ./venv/bin/pip install -r requirements.txt")
        sys.exit(1)

    # 4. Run the server
    print("\n✅ Starting Nails Appointment App...")
    print("   Creating database tables if needed...")
    print("   Server will run at: http://localhost:5000")
    
    # Using port 5000 as configured in your previous file
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)

if __name__ == "__main__":
    main()
