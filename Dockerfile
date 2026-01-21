# Usamos una versión ligera de Python
FROM python:3.11-slim

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo de requerimientos primero (para aprovechar la caché de Docker)
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos EL RESTO de los archivos (incluyendo run.py y la carpeta app)
COPY . .

# El comando que ejecuta tu app
CMD ["python", "run.py"]