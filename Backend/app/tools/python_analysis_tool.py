"""Controlled Python analysis tool.

SECURITY CONSIDERATIONS (highest-risk module)
- Code is AST-checked in-process, then executed in `python -I` (isolated) subprocess.
- Import whitelist is env-configured; relative imports and dunder/private access are rejected.
- Timeout is enforced via subprocess. Timeout kills the child; no retry of user code.
- POSIX: RLIMIT_AS from ANALYSIS_MEMORY_MB. Windows: memory cap is NOT enforced — run this
  API only on trusted networks or wrap the worker in a job object / container.
- This is NOT a multi-tenant public sandbox. Treat it as a privileged plant-floor tool.
- stdout/stderr/return_value are captured separately. File bytes are never logged.
"""

import json
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.exceptions import ToolExecutionError
from app.schemas.analysis import AnalysisResponse
from app.schemas.common import EvidenceItem
from app.services import audit_service, document_service
from app.tools import PYTHON_ANALYSIS
from app.utils.security import validate_analysis_code


def _audit_execution(
    db: Optional[Session],
    *,
    user_id: Optional[str],
    code: str,
    document_id: Optional[str],
    latency_ms: int,
    status: str,
    output_payload: dict,
) -> None:
    """Persist a Python-tool execution when called within an application request."""
    if db is None:
        return
    audit_service.record(
        db,
        action_type="tool.python_analysis",
        status=status,
        latency_ms=latency_ms,
        user_id=user_id,
        input_payload={
            "tool": "python_analysis",
            "code_chars": len(code),
            "document_id": document_id,
        },
        output_payload=output_payload,
    )


def _tool_evidence(
    *,
    status: str,
    snippet: str = "",
    document_id: Optional[str] = None,
    filename: Optional[str] = None,
) -> list[EvidenceItem]:
    """Return evidence for tool-only analysis or analysis grounded in one CSV document."""
    summary = snippet.strip()[:280] or f"Python analysis execution status: {status}."
    if document_id:
        return [
            EvidenceItem(
                source_type="document",
                document_id=document_id,
                snippet=summary,
                filename=filename,
                confidence=0.0 if status in {"error", "timeout"} else 0.7,
            )
        ]
    return [
        EvidenceItem(
            source_type="tool",
            tool_name=PYTHON_ANALYSIS,
            snippet=summary,
            confidence=0.0 if status in {"error", "timeout"} else 0.7,
        )
    ]


def run_analysis(
    code: str,
    *,
    settings: Optional[Settings] = None,
    db: Optional[Session] = None,
    user_id: Optional[str] = None,
    document_id: Optional[str] = None,
) -> AnalysisResponse:
    """Validate, run, and persist an audit event for a sandboxed analysis execution."""
    cfg = settings or get_settings()
    started = time.perf_counter()
    tabular_document = None
    try:
        validate_analysis_code(code, cfg.analysis_allowed_import_set)
        if document_id:
            if db is None:
                raise ToolExecutionError(
                    "A database session is required for document-based analysis.",
                    detail={"document_id": document_id},
                )
            tabular_document = document_service.load_tabular_document(db, document_id)
        runner = Path(__file__).with_name("sandbox_runner.py")
        with tempfile.TemporaryDirectory(prefix="kavach_sandbox_") as tmp:
            tmp_path = Path(tmp)
            code_file = tmp_path / "user.py"
            result_file = tmp_path / "result.json"
            code_file.write_text(code, encoding="utf-8")
            document_data_file = None
            if tabular_document:
                document_data_file = tmp_path / "document_data.json"
                document_data_file.write_text(
                    json.dumps(
                        {
                            "document_id": tabular_document.document_id,
                            "filename": tabular_document.filename,
                            "columns": tabular_document.columns,
                            "rows": tabular_document.rows,
                        }
                    ),
                    encoding="utf-8",
                )
            cmd = [
                sys.executable,
                "-I",
                str(runner),
                "--code-file",
                str(code_file),
                "--result-file",
                str(result_file),
                "--allowed",
                ",".join(sorted(cfg.analysis_allowed_import_set)),
                "--memory-mb",
                str(cfg.analysis_memory_mb),
            ]
            if document_data_file:
                cmd.extend(["--document-data-file", str(document_data_file)])
            try:
                completed = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=cfg.analysis_timeout_seconds,
                    check=False,
                )
            except subprocess.TimeoutExpired:
                latency_ms = int((time.perf_counter() - started) * 1000)
                result = AnalysisResponse(
                    stdout="",
                    stderr="Analysis exceeded ANALYSIS_TIMEOUT_SECONDS.",
                    return_value=None,
                    timed_out=True,
                    evidence=_tool_evidence(
                        status="timeout",
                        document_id=tabular_document.document_id if tabular_document else None,
                        filename=tabular_document.filename if tabular_document else None,
                    ),
                    latency_ms=latency_ms,
                )
                _audit_execution(
                    db, user_id=user_id, code=code, document_id=document_id, latency_ms=latency_ms, status="timeout", output_payload={"timed_out": True}
                )
                return result

            latency_ms = int((time.perf_counter() - started) * 1000)
            if not result_file.exists():
                raise ToolExecutionError(
                    "Sandbox produced no result file.",
                    detail={"stderr": (completed.stderr or "")[:500]},
                )
            payload = json.loads(result_file.read_text(encoding="utf-8"))
            result = AnalysisResponse(
                stdout=str(payload.get("stdout") or ""),
                stderr=(
                    str(payload.get("stderr") or "")
                    if payload.get("ok")
                    else str(payload.get("error") or payload.get("stderr") or "sandbox error")
                ),
                return_value=payload.get("return_value") if payload.get("ok") else None,
                timed_out=False,
                evidence=_tool_evidence(
                    status="ok" if payload.get("ok") else "error",
                    snippet=(
                        str(payload.get("stdout") or "")
                        if payload.get("ok")
                        else str(payload.get("error") or payload.get("stderr") or "sandbox error")
                    ),
                    document_id=tabular_document.document_id if tabular_document else None,
                    filename=tabular_document.filename if tabular_document else None,
                ),
                latency_ms=latency_ms,
            )
            _audit_execution(
                db,
                user_id=user_id,
                code=code,
                document_id=document_id,
                latency_ms=latency_ms,
                status="ok" if payload.get("ok") else "error",
                output_payload={"stdout_chars": len(result.stdout), "sandbox_ok": bool(payload.get("ok"))},
            )
            return result
    except Exception as exc:
        _audit_execution(
            db,
            user_id=user_id,
            code=code,
            document_id=document_id,
            latency_ms=int((time.perf_counter() - started) * 1000),
            status="error",
            output_payload={"error_type": type(exc).__name__},
        )
        raise
