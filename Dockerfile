FROM python:3.11-slim

# Set environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

WORKDIR /usr/src/app

# Install dependencies first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application via Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "--workers", "2", "app:app"]
