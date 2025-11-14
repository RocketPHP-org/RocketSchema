import asyncio
import json
import os
import re
from pathlib import Path
from typing import Any

from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions, Server
from pydantic import AnyUrl
import mcp.server.stdio

# Store notes as a simple key-value dict to demonstrate state management
notes: dict[str, str] = {}

SOLUTIONS_ENV_VAR = "MCP_SOLUTIONS_PATH"
DOMAINS_ENV_VAR = "MCP_DOMAINS_PATH"
SCHEMA_CONTEXT = "https://rocketschema.org/context"
IDENTIFIER_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")
PROPERTY_MODES = {"stored", "enum", "computed"}

_catalog_cache: dict[str, tuple[Path, list[dict[str, Any]]]] = {}
_domain_names_cache: set[str] | None = None


def _resolve_data_file(env_var: str, filename: str) -> Path:
    """Resolve a data file location based on override env vars or repo layout."""
    override = os.getenv(env_var)
    if override:
        return Path(override).expanduser()

    current = Path(__file__).resolve()
    for parent in current.parents:
        candidate = parent / "data" / filename
        if candidate.exists():
            return candidate

    # Fallback to cwd/data for scenarios where the repo layout differs
    return Path.cwd() / "data" / filename


def _load_catalog(
    cache_key: str,
    env_var: str,
    filename: str,
    *,
    refresh: bool = False,
) -> list[dict[str, Any]]:
    """Generic JSON loader with caching for catalog-style data sets."""
    path = _resolve_data_file(env_var, filename)
    cached = _catalog_cache.get(cache_key)

    if refresh or cached is None or cached[0] != path:
        try:
            with path.open("r", encoding="utf-8") as file:
                data = json.load(file)
        except FileNotFoundError as exc:
            raise ValueError(
                f"Required data file not found at {path}. "
                f"Set {env_var} to override the location."
            ) from exc
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in data file at {path}: {exc}") from exc

        if not isinstance(data, list):
            raise ValueError(f"Expected an array in {path}, got {type(data).__name__}")

        cached = (path, data)
        _catalog_cache[cache_key] = cached

    return cached[1]


def _load_solutions(refresh: bool = False) -> list[dict[str, Any]]:
    return _load_catalog(
        "solutions",
        SOLUTIONS_ENV_VAR,
        "solutions.json",
        refresh=refresh,
    )


def _load_domains(refresh: bool = False) -> list[dict[str, Any]]:
    domains = _load_catalog(
        "domains",
        DOMAINS_ENV_VAR,
        "domains.json",
        refresh=refresh,
    )
    global _domain_names_cache
    if not refresh and _domain_names_cache is not None:
        return domains

    _domain_names_cache = {domain.get("name") for domain in domains if domain.get("name")}
    return domains


def _write_catalog(
    cache_key: str,
    env_var: str,
    filename: str,
    data: list[dict[str, Any]],
) -> Path:
    """Persist a catalog back to disk and refresh the cache."""
    path = _resolve_data_file(env_var, filename)
    path.parent.mkdir(parents=True, exist_ok=True)

    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")

    tmp_path.replace(path)
    _catalog_cache[cache_key] = (path, data)
    return path


def _write_solutions(data: list[dict[str, Any]]) -> Path:
    return _write_catalog("solutions", SOLUTIONS_ENV_VAR, "solutions.json", data)


def _write_domains(data: list[dict[str, Any]]) -> Path:
    path = _write_catalog("domains", DOMAINS_ENV_VAR, "domains.json", data)
    global _domain_names_cache
    _domain_names_cache = {domain.get("name") for domain in data if domain.get("name")}
    return path


def _data_root() -> Path:
    return _resolve_data_file(DOMAINS_ENV_VAR, "domains.json").parent


def _ensure_within_base(path: Path, base: Path) -> Path:
    resolved_base = base.resolve()
    resolved_path = path.resolve()
    if resolved_base == resolved_path or resolved_base in resolved_path.parents:
        return resolved_path
    raise ValueError("Computed path escapes data directory")


def _normalize_identifier(value: Any, field: str) -> str:
    cleaned = _normalize_string(value, field)
    if not IDENTIFIER_PATTERN.fullmatch(cleaned):
        raise ValueError(
            f"'{field}' must contain only letters, numbers, hyphens, or underscores"
        )
    return cleaned


def _entity_schema_path(domain_id: str, entity_name: str) -> Path:
    base = _data_root()
    domain = _normalize_identifier(domain_id, "domain")
    entity = _normalize_identifier(entity_name, "name")
    domain_dir = _ensure_within_base(base / domain / "schemas", base)
    return _ensure_within_base(domain_dir / f"{entity}.json", base)


def _load_entity_schema(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError as exc:
        raise ValueError("Entity schema not found") from exc


def _write_entity_schema(path: Path, schema: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with tmp_path.open("w", encoding="utf-8") as file:
        json.dump(schema, file, ensure_ascii=False, indent=2)
        file.write("\n")
    tmp_path.replace(path)


def _ensure_domain_exists(domain_id: str) -> None:
    domains = _load_domains(refresh=False)
    domain_names = _domain_names_cache or {domain.get("name") for domain in domains}
    if domain_id not in domain_names:
        raise ValueError(f"Domain '{domain_id}' not found in domains.json")


def _find_entity_path(
    entity_name: str,
    domain_filter: str | None = None,
) -> tuple[str, Path]:
    normalized_name = _normalize_identifier(entity_name, "name")

    if domain_filter:
        domain_id = _normalize_identifier(domain_filter, "domain")
        _ensure_domain_exists(domain_id)
        path = _entity_schema_path(domain_id, normalized_name)
        if not path.exists():
            raise ValueError(
                f"Entity '{normalized_name}' not found under domain '{domain_id}'"
            )
        return domain_id, path

    for domain_id, schema_dir in _enumerate_domain_dirs():
        candidate = schema_dir / f"{normalized_name}.json"
        if candidate.exists():
            candidate = _ensure_within_base(candidate, _data_root())
            return domain_id, candidate

    raise ValueError(
        f"Entity '{normalized_name}' not found in any domain. Provide 'domain' to disambiguate."
    )


def _enumerate_domain_dirs(domain_filter: str | None = None) -> list[tuple[str, Path]]:
    base = _data_root()
    domains = []

    if domain_filter:
        domain_id = _normalize_identifier(domain_filter, "domain")
        _ensure_domain_exists(domain_id)
        domains = [domain_id]
    else:
        domain_names = sorted(_domain_names_cache or [])
        if not domain_names:
            _load_domains(refresh=False)
            domain_names = sorted(_domain_names_cache or [])
        domains = domain_names

    result: list[tuple[str, Path]] = []
    for domain in domains:
        domain_dir = base / domain / "schemas"
        if domain_dir.exists() and domain_dir.is_dir():
            result.append((domain, domain_dir))
    return result


def _list_entities(domain_filter: str | None = None) -> list[dict[str, Any]]:
    entities: list[dict[str, Any]] = []
    for domain, schema_dir in _enumerate_domain_dirs(domain_filter):
        for schema_path in sorted(schema_dir.glob("*.json")):
            try:
                with schema_path.open("r", encoding="utf-8") as file:
                    data = json.load(file)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON in {schema_path}: {exc}") from exc

            entities.append(
                {
                    "domain": domain,
                    "name": data.get("name") or schema_path.stem,
                    "description": data.get("description", ""),
                    "path": str(schema_path),
                }
            )

    return entities


def _get_entity(domain_id: str | None, entity_name: str) -> dict[str, Any]:
    resolved_domain, path = _find_entity_path(entity_name, domain_id)
    schema = _load_entity_schema(path)
    schema.setdefault("@context", SCHEMA_CONTEXT)
    schema.setdefault("@type", "Schema")
    schema["name"] = schema.get("name", entity_name)
    schema["domain"] = resolved_domain
    schema["path"] = str(path)
    return schema


def _normalize_string(value: Any, field: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"'{field}' must be a string")
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"'{field}' cannot be empty")
    return cleaned


def _normalize_string_list(
    value: Any,
    field: str,
    *,
    min_items: int = 0,
) -> list[str]:
    if not isinstance(value, list):
        raise ValueError(f"'{field}' must be an array of strings")
    normalized: list[str] = []
    for item in value:
        normalized.append(_normalize_string(item, field))

    if len(normalized) < min_items:
        raise ValueError(f"'{field}' must contain at least {min_items} item(s)")
    return normalized


def _validate_solution_payload(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("'solution' must be an object")

    required_fields = ["name", "label", "description", "icon", "color"]
    normalized = {field: _normalize_string(payload.get(field), field) for field in required_fields}

    if "domains" not in payload:
        raise ValueError("'domains' is required and must reference at least one domain")
    domains = _normalize_string_list(payload["domains"], "domains", min_items=1)

    features = payload.get("features", [])
    features_list = _normalize_string_list(features, "features", min_items=1)

    use_cases = payload.get("useCases", [])
    use_cases_list = _normalize_string_list(use_cases, "useCases", min_items=1)

    normalized.update(
        {
            "domains": domains,
            "features": features_list,
            "useCases": use_cases_list,
        }
    )

    return normalized


def _validate_solution_patch(patch: Any) -> dict[str, Any]:
    if not isinstance(patch, dict) or not patch:
        raise ValueError("'patch' must be a non-empty object")

    allowed_string_fields = {"label", "description", "icon", "color"}
    allowed_list_fields = {"domains", "features", "useCases"}
    normalized: dict[str, Any] = {}

    for key, value in patch.items():
        if key in allowed_string_fields:
            normalized[key] = _normalize_string(value, key)
        elif key in allowed_list_fields:
            normalized[key] = _normalize_string_list(value, key, min_items=1)
        else:
            raise ValueError(
                "'patch' contains unsupported field '"
                + key
                + "'. Allowed fields: label, description, icon, color, domains, features, useCases"
            )

    return normalized


def _validate_entity_properties(properties: Any) -> list[dict[str, Any]]:
    if not isinstance(properties, list) or not properties:
        raise ValueError("'properties' must be a non-empty array")

    normalized: list[dict[str, Any]] = []
    for index, prop in enumerate(properties):
        if not isinstance(prop, dict):
            raise ValueError(f"properties[{index}] must be an object")
        prefix = f"properties[{index}]"
        name = _normalize_string(prop.get("name"), f"{prefix}.name")
        prop_type = _normalize_string(prop.get("type"), f"{prefix}.type")
        description = _normalize_string(prop.get("description"), f"{prefix}.description")
        mode = _normalize_string(prop.get("mode"), f"{prefix}.mode")
        if mode not in PROPERTY_MODES:
            allowed = ", ".join(sorted(PROPERTY_MODES))
            raise ValueError(
                f"{prefix}.mode must be one of: {allowed}"
            )

        normalized_prop: dict[str, Any] = {
            "name": name,
            "type": prop_type,
            "mode": mode,
            "description": description,
        }

        if "required" in prop:
            normalized_prop["required"] = bool(prop["required"])

        if "format" in prop:
            normalized_prop["format"] = _normalize_string(prop["format"], f"{prefix}.format")

        if "example" in prop:
            normalized_prop["example"] = prop["example"]

        normalized.append(normalized_prop)

    return normalized


def _validate_entity_examples(examples: Any) -> list[dict[str, Any]]:
    if not isinstance(examples, list) or not examples:
        raise ValueError("'examples' must be a non-empty array")

    normalized: list[dict[str, Any]] = []
    for index, example in enumerate(examples):
        if not isinstance(example, dict):
            raise ValueError(f"examples[{index}] must be an object")
        if "@type" not in example:
            raise ValueError(f"examples[{index}] must include an '@type' field")
        _ = _normalize_string(example.get("@type"), f"examples[{index}].@type")
        normalized.append(example)

    return normalized


def _normalize_int(value: Any, field: str) -> int:
    if isinstance(value, bool):  # bool is subclass of int, guard explicitly
        raise ValueError(f"'{field}' must be an integer")
    if not isinstance(value, int):
        raise ValueError(f"'{field}' must be an integer")
    return value


def _validate_domain_payload(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("'domain' must be an object")

    required_fields = ["name", "label", "description", "icon", "order"]
    normalized = {field: _normalize_string(payload.get(field), field) for field in required_fields[:-1]}
    normalized["order"] = _normalize_int(payload.get("order"), "order")
    normalized["tags"] = _normalize_string_list(payload.get("tags", []), "tags", min_items=1)

    return normalized


def _validate_domain_patch(patch: Any) -> dict[str, Any]:
    if not isinstance(patch, dict) or not patch:
        raise ValueError("'patch' must be a non-empty object")

    normalized: dict[str, Any] = {}
    for key, value in patch.items():
        if key in {"label", "description", "icon"}:
            normalized[key] = _normalize_string(value, key)
        elif key == "order":
            normalized[key] = _normalize_int(value, key)
        elif key == "tags":
            normalized[key] = _normalize_string_list(value, key, min_items=1)
        else:
            raise ValueError(
                "'patch' contains unsupported field '"
                + key
                + "'. Allowed fields: label, description, icon, order, tags"
            )

    return normalized

server = Server("mcp_project")

@server.list_resources()
async def handle_list_resources() -> list[types.Resource]:
    """
    List available note resources.
    Each note is exposed as a resource with a custom note:// URI scheme.
    """
    return [
        types.Resource(
            uri=AnyUrl(f"note://internal/{name}"),
            name=f"Note: {name}",
            description=f"A simple note named {name}",
            mimeType="text/plain",
        )
        for name in notes
    ]

@server.read_resource()
async def handle_read_resource(uri: AnyUrl) -> str:
    """
    Read a specific note's content by its URI.
    The note name is extracted from the URI host component.
    """
    if uri.scheme != "note":
        raise ValueError(f"Unsupported URI scheme: {uri.scheme}")

    name = uri.path
    if name is not None:
        name = name.lstrip("/")
        return notes[name]
    raise ValueError(f"Note not found: {name}")

@server.list_prompts()
async def handle_list_prompts() -> list[types.Prompt]:
    """
    List available prompts.
    Each prompt can have optional arguments to customize its behavior.
    """
    return [
        types.Prompt(
            name="summarize-notes",
            description="Creates a summary of all notes",
            arguments=[
                types.PromptArgument(
                    name="style",
                    description="Style of the summary (brief/detailed)",
                    required=False,
                )
            ],
        )
    ]

@server.get_prompt()
async def handle_get_prompt(
    name: str, arguments: dict[str, str] | None
) -> types.GetPromptResult:
    """
    Generate a prompt by combining arguments with server state.
    The prompt includes all current notes and can be customized via arguments.
    """
    if name != "summarize-notes":
        raise ValueError(f"Unknown prompt: {name}")

    style = (arguments or {}).get("style", "brief")
    detail_prompt = " Give extensive details." if style == "detailed" else ""

    return types.GetPromptResult(
        description="Summarize the current notes",
        messages=[
            types.PromptMessage(
                role="user",
                content=types.TextContent(
                    type="text",
                    text=f"Here are the current notes to summarize:{detail_prompt}\n\n"
                    + "\n".join(
                        f"- {name}: {content}"
                        for name, content in notes.items()
                    ),
                ),
            )
        ],
    )

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """
    List available tools.
    Each tool specifies its arguments using JSON Schema validation.
    """
    solution_payload_schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "label": {"type": "string"},
            "description": {"type": "string"},
            "icon": {"type": "string"},
            "color": {"type": "string"},
            "domains": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
            "features": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
            "useCases": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
        },
        "required": [
            "name",
            "label",
            "description",
            "icon",
            "color",
            "domains",
            "features",
            "useCases",
        ],
    }

    solution_patch_schema = {
        "type": "object",
        "properties": {
            "label": {"type": "string"},
            "description": {"type": "string"},
            "icon": {"type": "string"},
            "color": {"type": "string"},
            "domains": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
            "features": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
            "useCases": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
        },
        "minProperties": 1,
        "additionalProperties": False,
    }

    domain_payload_schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "label": {"type": "string"},
            "description": {"type": "string"},
            "icon": {"type": "string"},
            "order": {"type": "integer"},
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
        },
        "required": ["name", "label", "description", "icon", "order", "tags"],
    }

    domain_patch_schema = {
        "type": "object",
        "properties": {
            "label": {"type": "string"},
            "description": {"type": "string"},
            "icon": {"type": "string"},
            "order": {"type": "integer"},
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
        },
        "minProperties": 1,
        "additionalProperties": False,
    }

    property_definition_schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "type": {"type": "string"},
            "mode": {
                "type": "string",
                "enum": sorted(PROPERTY_MODES),
            },
            "description": {"type": "string"},
            "required": {"type": "boolean"},
            "format": {"type": "string"},
            "example": {},
        },
        "required": ["name", "type", "mode", "description"],
    }

    properties_array_schema = {
        "type": "array",
        "items": property_definition_schema,
        "minItems": 1,
    }

    example_schema = {
        "type": "object",
        "properties": {
            "@type": {"type": "string"},
        },
        "required": ["@type"],
    }

    examples_array_schema = {
        "type": "array",
        "items": example_schema,
        "minItems": 1,
    }

    return [
        types.Tool(
            name="add-note",
            description="Add a new note",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["name", "content"],
            },
        ),
        types.Tool(
            name="list-solutions",
            description="Return every solution entry from data/solutions.json",
            inputSchema={
                "type": "object",
                "properties": {
                    "refresh": {
                        "type": "boolean",
                        "description": "Reload the JSON file instead of using the cache",
                    }
                },
            },
        ),
        types.Tool(
            name="list-domains",
            description="Return every domain entry from data/domains.json",
            inputSchema={
                "type": "object",
                "properties": {
                    "refresh": {
                        "type": "boolean",
                        "description": "Reload the JSON file instead of using the cache",
                    }
                },
            },
        ),
        types.Tool(
            name="create-solution",
            description="Append a new solution entry to data/solutions.json",
            inputSchema={
                "type": "object",
                "properties": {
                    "solution": solution_payload_schema,
                },
                "required": ["solution"],
            },
        ),
        types.Tool(
            name="update-solution",
            description="Update fields on an existing solution",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "patch": solution_patch_schema,
                },
                "required": ["name", "patch"],
            },
        ),
        types.Tool(
            name="delete-solution",
            description="Remove a solution from data/solutions.json",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="create-domain",
            description="Append a new domain entry to data/domains.json",
            inputSchema={
                "type": "object",
                "properties": {
                    "domain": domain_payload_schema,
                },
                "required": ["domain"],
            },
        ),
        types.Tool(
            name="update-domain",
            description="Update fields on an existing domain",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "patch": domain_patch_schema,
                },
                "required": ["name", "patch"],
            },
        ),
        types.Tool(
            name="delete-domain",
            description="Remove a domain from data/domains.json",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "force": {
                        "type": "boolean",
                        "description": "Allow deletion even if solutions reference the domain",
                    },
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="create-entity",
            description="Create a new entity schema under the specified domain",
            inputSchema={
                "type": "object",
                "properties": {
                    "domain": {"type": "string"},
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "properties": properties_array_schema,
                    "examples": examples_array_schema,
                },
                "required": ["domain", "name", "description", "properties", "examples"],
            },
        ),
        types.Tool(
            name="update-entity",
            description="Update an existing entity schema",
            inputSchema={
                "type": "object",
                "properties": {
                    "domain": {"type": "string"},
                    "name": {"type": "string"},
                    "description": {"type": "string"},
                    "properties": properties_array_schema,
                    "examples": examples_array_schema,
                },
                "required": ["name"],
                "anyOf": [
                    {"required": ["description"]},
                    {"required": ["properties"]},
                    {"required": ["examples"]},
                ],
            },
        ),
        types.Tool(
            name="delete-entity",
            description="Delete an entity schema file",
            inputSchema={
                "type": "object",
                "properties": {
                    "domain": {"type": "string"},
                    "name": {"type": "string"},
                },
                "required": ["domain", "name"],
            },
        ),
        types.Tool(
            name="list-entities",
            description="List entity schemas, optionally filtered by domain",
            inputSchema={
                "type": "object",
                "properties": {
                    "domain": {"type": "string"},
                },
            },
        ),
        types.Tool(
            name="get-entity",
            description="Fetch a single entity schema",
            inputSchema={
                "type": "object",
                "properties": {
                    "domain": {"type": "string"},
                    "name": {"type": "string"},
                },
                "required": ["name"],
            },
        ),
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict | None
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    """
    Handle tool execution requests.
    Tools can modify server state and notify clients of changes.
    """
    if name == "add-note":
        if not arguments:
            raise ValueError("Missing arguments")

        note_name = arguments.get("name")
        content = arguments.get("content")

        if not note_name or not content:
            raise ValueError("Missing name or content")

        # Update server state
        notes[note_name] = content

        # Notify clients that resources have changed
        await server.request_context.session.send_resource_list_changed()

        return [
            types.TextContent(
                type="text",
                text=f"Added note '{note_name}' with content: {content}",
            )
        ]

    if name == "list-solutions":
        refresh = bool((arguments or {}).get("refresh", False))
        solutions = _load_solutions(refresh=refresh)

        return [
            types.TextContent(
                type="text",
                text=json.dumps(solutions, indent=2),
            )
        ]

    if name == "list-domains":
        refresh = bool((arguments or {}).get("refresh", False))
        domains = _load_domains(refresh=refresh)

        return [
            types.TextContent(
                type="text",
                text=json.dumps(domains, indent=2),
            )
        ]

    if name == "create-solution":
        if not arguments or "solution" not in arguments:
            raise ValueError("Missing 'solution' payload")

        candidate = _validate_solution_payload(arguments["solution"])

        solutions = _load_solutions(refresh=True)
        if any(existing.get("name") == candidate["name"] for existing in solutions):
            raise ValueError(f"Solution '{candidate['name']}' already exists")

        domain_names = {domain.get("name") for domain in _load_domains(refresh=False)}
        missing_domains = [domain for domain in candidate["domains"] if domain not in domain_names]
        if missing_domains:
            raise ValueError(
                "Unknown domain references: " + ", ".join(sorted(missing_domains))
            )

        updated_catalog = [*solutions, candidate]
        path = _write_solutions(updated_catalog)

        return [
            types.TextContent(
                type="text",
                text=(
                    f"Solution '{candidate['name']}' created with "
                    f"{len(candidate['domains'])} domain(s) and saved to {path}"
                ),
            )
        ]

    if name == "update-solution":
        if not arguments or "name" not in arguments or "patch" not in arguments:
            raise ValueError("'name' and 'patch' are required")

        solution_name = _normalize_string(arguments["name"], "name")
        patch = _validate_solution_patch(arguments["patch"])

        solutions = _load_solutions(refresh=True)
        domain_names = {domain.get("name") for domain in _load_domains(refresh=False)}

        for index, solution in enumerate(solutions):
            if solution.get("name") == solution_name:
                if "domains" in patch:
                    missing_domains = [
                        domain for domain in patch["domains"] if domain not in domain_names
                    ]
                    if missing_domains:
                        raise ValueError(
                            "Unknown domain references: " + ", ".join(sorted(missing_domains))
                        )

                updated_solution = {**solution, **patch}
                solutions[index] = updated_solution
                path = _write_solutions(solutions)

                changed_fields = ", ".join(patch.keys())
                return [
                    types.TextContent(
                        type="text",
                        text=(
                            f"Solution '{solution_name}' updated ({changed_fields}) and saved to {path}"
                        ),
                    )
                ]

        raise ValueError(f"Solution '{solution_name}' not found")

    if name == "delete-solution":
        if not arguments or "name" not in arguments:
            raise ValueError("'name' is required")

        solution_name = _normalize_string(arguments["name"], "name")
        solutions = _load_solutions(refresh=True)
        remaining = [solution for solution in solutions if solution.get("name") != solution_name]

        if len(remaining) == len(solutions):
            raise ValueError(f"Solution '{solution_name}' not found")

        path = _write_solutions(remaining)

        return [
            types.TextContent(
                type="text",
                text=f"Solution '{solution_name}' deleted. Updated catalog saved to {path}",
            )
        ]

    if name == "create-domain":
        if not arguments or "domain" not in arguments:
            raise ValueError("Missing 'domain' payload")

        candidate = _validate_domain_payload(arguments["domain"])

        domains = _load_domains(refresh=True)
        if any(existing.get("name") == candidate["name"] for existing in domains):
            raise ValueError(f"Domain '{candidate['name']}' already exists")

        updated_catalog = [*domains, candidate]
        path = _write_domains(updated_catalog)

        return [
            types.TextContent(
                type="text",
                text=(
                    f"Domain '{candidate['name']}' created and saved to {path}"
                ),
            )
        ]

    if name == "update-domain":
        if not arguments or "name" not in arguments or "patch" not in arguments:
            raise ValueError("'name' and 'patch' are required")

        domain_name = _normalize_string(arguments["name"], "name")
        patch = _validate_domain_patch(arguments["patch"])

        domains = _load_domains(refresh=True)
        for index, domain in enumerate(domains):
            if domain.get("name") == domain_name:
                updated_domain = {**domain, **patch}
                domains[index] = updated_domain
                path = _write_domains(domains)
                changed_fields = ", ".join(patch.keys())
                return [
                    types.TextContent(
                        type="text",
                        text=(
                            f"Domain '{domain_name}' updated ({changed_fields}) and saved to {path}"
                        ),
                    )
                ]

        raise ValueError(f"Domain '{domain_name}' not found")

    if name == "delete-domain":
        if not arguments or "name" not in arguments:
            raise ValueError("'name' is required")

        domain_name = _normalize_string(arguments["name"], "name")
        force = bool(arguments.get("force", False))

        solutions = _load_solutions(refresh=False)
        referencing = [
            solution.get("name")
            for solution in solutions
            if domain_name in (solution.get("domains") or [])
        ]
        if referencing and not force:
            raise ValueError(
                "Domain is still referenced by solutions: "
                + ", ".join(sorted(referencing))
                + ". Pass force=true to override."
            )

        domains = _load_domains(refresh=True)
        remaining = [domain for domain in domains if domain.get("name") != domain_name]

        if len(remaining) == len(domains):
            raise ValueError(f"Domain '{domain_name}' not found")

        path = _write_domains(remaining)

        return [
            types.TextContent(
                type="text",
                text=f"Domain '{domain_name}' deleted. Updated catalog saved to {path}",
            )
        ]

    if name == "create-entity":
        if not arguments:
            raise ValueError("Missing arguments")

        domain_id = _normalize_identifier(arguments.get("domain"), "domain")
        entity_name = _normalize_identifier(arguments.get("name"), "name")
        description = _normalize_string(arguments.get("description"), "description")
        properties = _validate_entity_properties(arguments.get("properties"))
        examples = _validate_entity_examples(arguments.get("examples"))

        _ensure_domain_exists(domain_id)
        path = _entity_schema_path(domain_id, entity_name)
        if path.exists():
            raise ValueError(
                f"Entity '{entity_name}' already exists in domain '{domain_id}'"
            )

        schema = {
            "@type": "Schema",
            "@context": SCHEMA_CONTEXT,
            "name": entity_name,
            "description": description,
            "properties": properties,
            "examples": examples,
        }

        _write_entity_schema(path, schema)

        return [
            types.TextContent(
                type="text",
                text=(
                    f"Entity '{entity_name}' created in domain '{domain_id}' and saved to {path}"
                ),
            )
        ]

    if name == "update-entity":
        if not arguments:
            raise ValueError("Missing arguments")

        if "name" not in arguments:
            raise ValueError("'name' is required")

        domain_argument = arguments.get("domain")
        domain_filter = (
            _normalize_identifier(domain_argument, "domain") if domain_argument else None
        )

        entity_name = _normalize_identifier(arguments["name"], "name")
        resolved_domain, path = _find_entity_path(entity_name, domain_filter)

        fields_to_change: list[str] = []

        schema = _load_entity_schema(path)

        if "description" in arguments:
            schema["description"] = _normalize_string(arguments["description"], "description")
            fields_to_change.append("description")

        if "properties" in arguments:
            schema["properties"] = _validate_entity_properties(arguments["properties"])
            fields_to_change.append("properties")

        if "examples" in arguments:
            schema["examples"] = _validate_entity_examples(arguments["examples"])
            fields_to_change.append("examples")

        if not fields_to_change:
            raise ValueError("Provide at least one field to update (description, properties, examples)")

        schema.setdefault("@type", "Schema")
        schema.setdefault("@context", SCHEMA_CONTEXT)
        schema["name"] = schema.get("name", entity_name)
        schema["domain"] = resolved_domain

        _write_entity_schema(path, schema)

        return [
            types.TextContent(
                type="text",
                text=(
                    f"Entity '{entity_name}' updated ({', '.join(fields_to_change)}) and saved to {path}"
                ),
            )
        ]

    if name == "delete-entity":
        if not arguments:
            raise ValueError("Missing arguments")

        domain_id = _normalize_identifier(arguments.get("domain"), "domain")
        entity_name = _normalize_identifier(arguments.get("name"), "name")
        _ensure_domain_exists(domain_id)

        path = _entity_schema_path(domain_id, entity_name)
        if not path.exists():
            raise ValueError(
                f"Entity '{entity_name}' not found under domain '{domain_id}'"
            )

        path.unlink()

        return [
            types.TextContent(
                type="text",
                text=f"Entity '{entity_name}' deleted from domain '{domain_id}'",
            )
        ]

    if name == "list-entities":
        domain_filter = None
        if arguments and arguments.get("domain"):
            domain_filter = _normalize_identifier(arguments["domain"], "domain")

        entities = _list_entities(domain_filter)

        return [
            types.TextContent(
                type="text",
                text=json.dumps(entities, indent=2),
            )
        ]

    if name == "get-entity":
        if not arguments or "name" not in arguments:
            raise ValueError("'name' is required")

        entity_name = _normalize_identifier(arguments["name"], "name")

        domain_argument = arguments.get("domain")
        domain_filter = (
            _normalize_identifier(domain_argument, "domain") if domain_argument else None
        )

        schema = _get_entity(domain_filter, entity_name)

        return [
            types.TextContent(
                type="text",
                text=json.dumps(schema, indent=2),
            )
        ]

    raise ValueError(f"Unknown tool: {name}")

async def main():
    # Run the server using stdin/stdout streams
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="mcp_project",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )
