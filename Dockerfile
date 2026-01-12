FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# build-essential and libpq-dev are often needed for psychopg2, though we use binary for now
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app directory into the container's /app/app
# We're running from the root context, and the code is in ./app
COPY app ./app

# Expose port (FastAPI default is usually 8000, but we can match the old backend 5000 or use 8000)
# Let's use 8000 for standard FastAPI, and map it in docker-compose.
EXPOSE 8000

# Command to run the application
# We run uvicorn on app.main:app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
