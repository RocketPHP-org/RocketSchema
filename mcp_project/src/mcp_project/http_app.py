"""ASGI application that exposes the MCP server over HTTP Streamable."""

from __future__ import annotations

import contextlib
import os
from typing import Any

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, PlainTextResponse, Response
from starlette.routing import Mount, Route

from mcp.server.streamable_http_manager import StreamableHTTPSessionManager
from mcp.server.transport_security import TransportSecuritySettings

from .server import server


def _env_bool(name: str, default: bool = False) -> bool:
    """Convert environment variable to bool."""
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name: str) -> list[str]:
    """Parse a comma-separated environment variable."""
    value = os.getenv(name)
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class _MCPMountApp:
    """Lightweight ASGI wrapper that forwards requests to the session manager."""

    def __init__(self, manager: StreamableHTTPSessionManager) -> None:
        self._manager = manager

    async def __call__(self, scope: dict[str, Any], receive, send) -> None:
        if scope.get("type") != "http":
            response = PlainTextResponse("Not Found", status_code=404)
            await response(scope, receive, send)
            return
        await self._manager.handle_request(scope, receive, send)


def _build_security_settings() -> TransportSecuritySettings | None:
    allowed_hosts = _env_list("MCP_HTTP_ALLOWED_HOSTS")
    allowed_origins = _env_list("MCP_HTTP_ALLOWED_ORIGINS")
    dns_protection = _env_bool(
        "MCP_HTTP_ENABLE_DNS_PROTECTION",
        default=bool(allowed_hosts or allowed_origins),
    )

    if not dns_protection:
        return None

    return TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=allowed_hosts,
        allowed_origins=allowed_origins,
    )


def create_app() -> Starlette:
    """Create a Starlette app that exposes the MCP server over HTTP."""
    json_response = _env_bool("MCP_HTTP_JSON_RESPONSE")
    stateless = _env_bool("MCP_HTTP_STATELESS")

    base_path = os.getenv("MCP_HTTP_BASE_PATH", "/mcp").strip() or "/mcp"
    if not base_path.startswith("/"):
        base_path = f"/{base_path}"
    if base_path == "/":  # Avoid clobbering other routes
        base_path = "/mcp"
    base_path = base_path.rstrip("/") or "/mcp"

    session_manager = StreamableHTTPSessionManager(
        server,
        json_response=json_response,
        stateless=stateless,
        security_settings=_build_security_settings(),
    )

    async def root(_: Request) -> Response:
        return JSONResponse(
            {
                "service": server.name,
                "transport": "streamable-http",
                "endpoint": base_path,
            }
        )

    async def health(_: Request) -> Response:
        return JSONResponse({"status": "ok"})

    @contextlib.asynccontextmanager
    async def lifespan(app: Starlette):  # type: ignore[type-var]
        async with session_manager.run():
            yield

    routes = [
        Route("/", root, methods=["GET"]),
        Route("/healthz", health, methods=["GET"]),
        Mount(base_path, app=_MCPMountApp(session_manager)),
    ]

    return Starlette(routes=routes, lifespan=lifespan)


app = create_app()

__all__ = ["app", "create_app"]
