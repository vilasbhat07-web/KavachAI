"""Standalone subprocess entry for sandboxed analysis. Stdlib only plus whitelist imports.

SECURITY: This process must be launched with `python -I` (isolated). It does not
import the KAVACH app package. Parent still AST-checks code before spawn.
Memory limits apply on POSIX only; Windows has no rlimit equivalent here.
"""

from __future__ import annotations

import argparse
import ast
import json
import sys
from typing import Any

_BANNED = {
    "eval",
    "exec",
    "compile",
    "open",
    "input",
    "__import__",
    "breakpoint",
    "globals",
    "locals",
    "getattr",
    "setattr",
    "delattr",
    "vars",
    "dir",
    "exit",
    "quit",
    "memoryview",
}

_SAFE_BUILTINS = {
    "abs",
    "all",
    "any",
    "bool",
    "dict",
    "enumerate",
    "filter",
    "float",
    "int",
    "len",
    "list",
    "max",
    "min",
    "print",
    "range",
    "repr",
    "reversed",
    "round",
    "set",
    "sorted",
    "str",
    "sum",
    "tuple",
    "zip",
}


def _apply_posix_memory_limit(memory_mb: int) -> None:
    if memory_mb <= 0:
        return
    try:
        import resource

        cap = memory_mb * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (cap, cap))
    except Exception:
        return


def _check_ast(code: str, allowed: set[str]) -> None:
    tree = ast.parse(code)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split(".")[0] not in allowed:
                    raise RuntimeError(f"import not allowed: {alias.name}")
        elif isinstance(node, ast.ImportFrom):
            if node.level:
                raise RuntimeError("relative imports are not allowed")
            root = (node.module or "").split(".")[0]
            if root not in allowed:
                raise RuntimeError(f"import not allowed: {node.module}")
        elif isinstance(node, ast.Attribute) and node.attr.startswith("_"):
            raise RuntimeError("private attribute access is not allowed")
        elif isinstance(node, ast.Name) and node.id in _BANNED:
            raise RuntimeError(f"banned name: {node.id}")


def _requested_imports(code: str) -> set[str]:
    """Return only the allowlisted root modules explicitly imported by user code."""
    requested: set[str] = set()
    for node in ast.walk(ast.parse(code)):
        if isinstance(node, ast.Import):
            requested.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            requested.add(node.module.split(".")[0])
    return requested


def _restricted_builtins() -> dict[str, Any]:
    import builtins as _builtins

    allowed = {name: getattr(_builtins, name) for name in _SAFE_BUILTINS if hasattr(_builtins, name)}
    allowed["True"] = True
    allowed["False"] = False
    allowed["None"] = None
    return allowed


def _run(
    code: str,
    allowed_imports: list[str],
    *,
    initial_globals: dict[str, Any] | None = None,
) -> dict[str, Any]:
    allowed = set(allowed_imports)
    _check_ast(code, allowed)
    sandbox_globals: dict[str, Any] = {"__builtins__": _restricted_builtins()}
    if initial_globals:
        sandbox_globals.update(initial_globals)
    for name in _requested_imports(code):
        try:
            sandbox_globals[name] = __import__(name)
        except Exception as exc:
            return {"ok": False, "error": f"failed to import {name}: {exc}", "stdout": "", "stderr": "", "return_value": None}

    import io
    from contextlib import redirect_stderr, redirect_stdout

    stdout = io.StringIO()
    stderr = io.StringIO()
    return_value: Any = None
    try:
        with redirect_stdout(stdout), redirect_stderr(stderr):
            tree = ast.parse(code)
            body = tree.body
            if body and isinstance(body[-1], ast.Expr):
                exec(compile(ast.Module(body=body[:-1], type_ignores=[]), "<sandbox>", "exec"), sandbox_globals, sandbox_globals)
                return_value = eval(
                    compile(ast.Expression(body[-1].value), "<sandbox>", "eval"),
                    sandbox_globals,
                    sandbox_globals,
                )
            else:
                exec(compile(code, "<sandbox>", "exec"), sandbox_globals, sandbox_globals)
    except Exception as exc:  # noqa: BLE001
        return {
            "ok": False,
            "error": f"{type(exc).__name__}: {exc}",
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "return_value": None,
        }
    return {
        "ok": True,
        "error": None,
        "stdout": stdout.getvalue(),
        "stderr": stderr.getvalue(),
        "return_value": _jsonable(return_value),
    }


def _load_document_data(data_file: str | None) -> dict[str, Any]:
    """Read parent-provided JSON tabular data for the restricted globals namespace."""
    if not data_file:
        return {}
    with open(data_file, encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict):
        raise RuntimeError("document data must be a JSON object")
    return {"document_data": payload}


def _jsonable(value: Any) -> Any:
    if value is None or isinstance(value, (bool, int, float, str)):
        return value
    if isinstance(value, (list, tuple)):
        return [_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {str(key): _jsonable(val) for key, val in value.items()}
    return repr(value)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--code-file", required=True)
    parser.add_argument("--result-file", required=True)
    parser.add_argument("--allowed", default="")
    parser.add_argument("--memory-mb", type=int, default=0)
    parser.add_argument("--document-data-file")
    args = parser.parse_args()
    _apply_posix_memory_limit(args.memory_mb)
    with open(args.code_file, encoding="utf-8") as handle:
        code = handle.read()
    allowed = [part.strip() for part in args.allowed.split(",") if part.strip()]
    document_globals = _load_document_data(args.document_data_file)
    result = _run(code, allowed, initial_globals=document_globals)
    with open(args.result_file, "w", encoding="utf-8") as handle:
        json.dump(result, handle)
    return 0 if result.get("ok") else 2


if __name__ == "__main__":
    sys.exit(main())
