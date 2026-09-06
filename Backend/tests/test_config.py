"""Settings load exclusively from the environment."""

import pytest
from pydantic import ValidationError

from app.config import Settings, get_settings


def test_defaults_use_kavach_branding() -> None:
    settings = Settings(_env_file=None)
    assert settings.app_name == "KAVACH"
    assert "openai" not in settings.ollama_base_url.lower()
    assert settings.qdrant_collection.startswith("kavach")


def test_env_overrides_model_and_ports(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("OLLAMA_LLM_MODEL", "mistral")
    monkeypatch.setenv("API_PORT", "9001")
    monkeypatch.setenv("CHUNK_SIZE", "256")
    get_settings.cache_clear()
    settings = Settings(_env_file=None)
    assert settings.ollama_llm_model == "mistral"
    assert settings.api_port == 9001
    assert settings.chunk_size == 256


def test_chunk_overlap_must_be_less_than_size() -> None:
    with pytest.raises(ValidationError):
        Settings(chunk_size=128, chunk_overlap=128, _env_file=None)


def test_mime_and_import_sets_parse_csv() -> None:
    settings = Settings(
        allowed_mime_types="application/pdf, text/plain",
        analysis_allowed_imports="pandas, numpy",
        _env_file=None,
    )
    assert "application/pdf" in settings.allowed_mime_type_set
    assert "numpy" in settings.analysis_allowed_import_set


def test_vision_enabled_false_when_blank() -> None:
    settings = Settings(ollama_vision_model="  ", _env_file=None)
    assert settings.vision_enabled is False
