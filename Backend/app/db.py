"""SQLAlchemy engine, session factory, and metadata Base. Engine is created lazily from settings."""

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

_engine: Engine | None = None
_SessionLocal: sessionmaker | None = None


class Base(DeclarativeBase):
    """Declarative base for KAVACH ORM models."""


def _engine_kwargs(url: str) -> dict:
    kwargs: dict = {"future": True}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs


def _ensure_sqlite_dir(url: str) -> None:
    if not url.startswith("sqlite:///"):
        return
    raw = url.removeprefix("sqlite:///")
    if raw in {":memory:", ""} or raw.startswith(":memory:"):
        return
    path = Path(raw)
    if path.parent and str(path.parent) not in {".", ""}:
        path.parent.mkdir(parents=True, exist_ok=True)


def get_engine() -> Engine:
    """Return (and cache) the SQLAlchemy engine for the current settings."""
    global _engine, _SessionLocal
    if _engine is None:
        settings = get_settings()
        _ensure_sqlite_dir(settings.database_url)
        _engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))
        _SessionLocal = sessionmaker(bind=_engine, autocommit=False, autoflush=False, class_=Session)
    return _engine


def get_session_factory() -> sessionmaker:
    """Return the cached sessionmaker."""
    get_engine()
    assert _SessionLocal is not None
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session."""
    db = get_session_factory()()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """Create tables. Called from application lifespan."""
    from app.models import audit_log, document  # noqa: F401

    Base.metadata.create_all(bind=get_engine())


def reset_engine() -> None:
    """Dispose the cached engine (tests)."""
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionLocal = None
