import uvicorn
import os

if __name__ == "__main__":
    # Run the application using Uvicorn
    # allowing execution with "python run.py"
    print("Iniciando servidor en http://localhost:5000...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=4321, reload=True)
