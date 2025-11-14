# mcp_project MCP server

A MCP server project

## Components

### Resources

The server implements a simple note storage system with:
- Custom note:// URI scheme for accessing individual notes
- Each note resource has a name, description and text/plain mimetype

### Prompts

The server provides a single prompt:
- summarize-notes: Creates summaries of all stored notes
  - Optional "style" argument to control detail level (brief/detailed)
  - Generates prompt combining all current notes with style preference

### Tools

The server implements one tool:
- add-note: Adds a new note to the server
  - Takes "name" and "content" as required string arguments
  - Updates server state and notifies clients of resource changes
- list-solutions: Returns the entire `data/solutions.json` catalog
  - Optional `refresh` boolean argument reloads the JSON file on demand
  - Override the path with `MCP_SOLUTIONS_PATH` if you store the file elsewhere

## Configuration

[TODO: Add configuration details specific to your implementation]

## Quickstart

### Install

#### Claude Desktop

On MacOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

<details>
  <summary>Development/Unpublished Servers Configuration</summary>
  ```
  "mcpServers": {
    "mcp_project": {
      "command": "uv",
      "args": [
        "--directory",
        "/Users/yanis/Github/RocketSchema/mcp_project",
        "run",
        "mcp_project"
      ]
    }
  }
  ```
</details>

### Streamable HTTP server

Run the server over the HTTP Streamable transport (needed for n8n or any
client that uses the `mcpClientHttpApi` credentials):

```bash
uv run uvicorn mcp_project.http_app:app --host 0.0.0.0 --port 8080
```

Environment variables:

- `MCP_HTTP_BASE_PATH` (default `/mcp`) – path clients should call.
- `MCP_HTTP_JSON_RESPONSE` – return JSON instead of SSE (
  `HTTP Streamable` requires SSE, leave unset).
- `MCP_HTTP_STATELESS` – opt into stateless transports.
- `MCP_HTTP_ALLOWED_HOSTS` / `MCP_HTTP_ALLOWED_ORIGINS` – comma-separated
  host/origin allow lists; set alongside `MCP_HTTP_ENABLE_DNS_PROTECTION=1`
  to enable DNS-rebinding protection in production.
- `MCP_SOLUTIONS_PATH` – absolute path to `solutions.json` if it isn’t located
  under `./data/solutions.json`.

With Docker Compose:

```bash
docker compose up -d mcp_project
```

The container listens on `http://localhost:8080/mcp` and is reachable from
other compose services through `http://mcp_project:8080/mcp`.

<details>
  <summary>Published Servers Configuration</summary>
  ```
  "mcpServers": {
    "mcp_project": {
      "command": "uvx",
      "args": [
        "mcp_project"
      ]
    }
  }
  ```
</details>

## Development

### Building and Publishing

To prepare the package for distribution:

1. Sync dependencies and update lockfile:
```bash
uv sync
```

2. Build package distributions:
```bash
uv build
```

This will create source and wheel distributions in the `dist/` directory.

3. Publish to PyPI:
```bash
uv publish
```

Note: You'll need to set PyPI credentials via environment variables or command flags:
- Token: `--token` or `UV_PUBLISH_TOKEN`
- Or username/password: `--username`/`UV_PUBLISH_USERNAME` and `--password`/`UV_PUBLISH_PASSWORD`

### Debugging

Since MCP servers run over stdio, debugging can be challenging. For the best debugging
experience, we strongly recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).


You can launch the MCP Inspector via [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) with this command:

```bash
npx @modelcontextprotocol/inspector uv --directory /Users/yanis/Github/RocketSchema/mcp_project run mcp-project
```


Upon launching, the Inspector will display a URL that you can access in your browser to begin debugging.
