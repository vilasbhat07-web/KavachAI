# KAVACH Backend

Private, on-premise industrial AI copilot. Embeddings, LLM inference, and vector storage run locally (Ollama + Qdrant). No cloud AI APIs.

## Local tokenization prerequisite

KAVACH uses `tiktoken` only for chunk sizing. The configured `cl100k_base`
encoding is not bundled in this repository or present in the current local
cache, so `tiktoken` may download its encoding asset on first use. This is not
an AI inference API, but it is a network dependency and therefore the one
exception to fully air-gapped operation. Pre-populate the `tiktoken` cache on
an approved connected machine, then transfer that cache to each offline host
and set `TIKTOKEN_CACHE_DIR` to its local path before starting KAVACH.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements-dev.txt
copy .env.example .env
```

Copy `.env.example` to `.env` and set model names, ports, and URLs for your local Ollama and Qdrant. Do not hardcode those values in application code.

## Run

```bash
python -c "from app.config import get_settings; import uvicorn; s = get_settings(); uvicorn.run('app.main:app', host=s.api_host, port=s.api_port)"
```

## Security

The Python analysis tool is the highest-risk module. It will run with a timeout, memory cap, and import whitelist. Do not expose it on an untrusted network without additional isolation (container/seccomp).
