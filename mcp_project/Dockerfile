# syntax=docker/dockerfile:1

FROM python:3.13-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY pyproject.toml README.md uv.lock ./
COPY src ./src

RUN python -m pip install --upgrade pip \
    && python -m pip install .

EXPOSE 8080

ENV MCP_HTTP_BASE_PATH=/mcp \
    MCP_HTTP_ENABLE_DNS_PROTECTION=0

CMD ["python", "-m", "uvicorn", "mcp_project.http_app:app", "--host", "0.0.0.0", "--port", "8080"]
