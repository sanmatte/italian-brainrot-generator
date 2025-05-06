# src/backend/Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install FFmpeg (for Debian-based 'slim' image) and clean up apt cache
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Install dependencies:
# Copy only requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define command to run the app using Uvicorn
# Use 0.0.0.0 to make it accessible from outside the container network
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
