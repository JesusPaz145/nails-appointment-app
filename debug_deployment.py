
import sys
import os

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.getcwd())

try:
    print("Attempting to import app.main...")
    import app.main
    print("SUCCESS: app.main imported successfully.")
except Exception as e:
    print(f"FAILURE: Could not import app.main.")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {e}")
    import traceback
    traceback.print_exc()
