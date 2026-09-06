"""Image analysis endpoint. Upload lifecycle lives in image_service."""

from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from app.dependencies import CurrentUser, DbSession, LLMDep, SettingsDep
from app.schemas.image import ImageAnalyzeResponse
from app.services import image_service

router = APIRouter(prefix="/image", tags=["image"])

@router.post("/analyze", response_model=ImageAnalyzeResponse)
async def analyze(
    db: DbSession,
    settings: SettingsDep,
    llm: LLMDep,
    user_id: CurrentUser,
    file: Annotated[UploadFile, File()],
) -> ImageAnalyzeResponse:
    """Validate the multipart request shape and delegate image analysis."""
    return await image_service.analyze_upload(
        db,
        file,
        settings=settings,
        llm=llm,
        user_id=user_id,
    )
