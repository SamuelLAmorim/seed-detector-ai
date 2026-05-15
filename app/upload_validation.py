from dataclasses import dataclass


@dataclass(frozen=True)
class UploadValidationError(Exception):
    status_code: int
    detail: str


def format_bytes_as_mb(size_bytes: int) -> str:
    return f"{size_bytes / (1024 * 1024):.1f} MB"


def validate_image_upload(content_type: str | None, image_bytes: bytes, max_upload_bytes: int) -> None:
    if not content_type or not content_type.startswith("image/"):
        raise UploadValidationError(status_code=400, detail="Envie apenas arquivos de imagem")

    if not image_bytes:
        raise UploadValidationError(status_code=400, detail="Arquivo vazio")

    if len(image_bytes) > max_upload_bytes:
        raise UploadValidationError(
            status_code=413,
            detail=f"Imagem muito grande. Limite: {format_bytes_as_mb(max_upload_bytes)}",
        )