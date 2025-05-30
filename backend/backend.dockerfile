FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install build tools
RUN pip install --no-cache-dir --upgrade pip

# Install dependencies directly (based on your pyproject.toml)
RUN pip install --no-cache-dir \
    "inboard[fastapi]==0.56.*" \
    "python-multipart>=0.0.5" \
    "email-validator>=1.3.0" \
    "requests>=2.28.1" \
    "celery>=5.2.7" \
    "passlib[bcrypt]>=1.7.4" \
    "tenacity>=8.1.0" \
    "emails>=0.6.0" \
    "sentry-sdk>=2.13.0" \
    "jinja2>=3.1.2" \
    "python-jose[cryptography]>=3.3.0" \
    "pydantic>=2.0,<2.7" \
    "pydantic-settings>=2.0.3" \
    "httpx>=0.23.1" \
    "psycopg2-binary>=2.9.5" \
    "setuptools>=65.6.3" \
    "motor>=3.3.1" \
    "pytest==7.4.2" \
    "pytest-cov==4.1.0" \
    "pytest-asyncio>=0.21.0" \
    "argon2-cffi==23.1.0" \
    "argon2-cffi-bindings==21.2.0" \
    "odmantic>=1.0,<2.0" \
    geopy \
    haversine \
    faker \
    uvicorn[standard] \
    fastapi

# Copy the application code
COPY ./app/ .

# Set environment variables
ENV PYTHONPATH=/app
ENV HOST=0.0.0.0

EXPOSE 8000

# Start the application directly
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info"]