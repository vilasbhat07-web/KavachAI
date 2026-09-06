"""Controlled Python analysis endpoint. Execution is sandboxed in the tool."""

from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession, SettingsDep
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.tools.python_analysis_tool import run_analysis

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/python", response_model=AnalysisResponse)
def python_analysis(
    body: AnalysisRequest,
    db: DbSession,
    settings: SettingsDep,
    user_id: CurrentUser,
) -> AnalysisResponse:
    """Run whitelist Python in an isolated subprocess."""
    return run_analysis(
        body.code,
        settings=settings,
        db=db,
        user_id=user_id,
        document_id=body.document_id,
    )
