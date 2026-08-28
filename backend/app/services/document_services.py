from pathlib import Path

from fastapi import UploadFile, HTTPException

from app.services.pdf_services import PDFService
from app.services.spreadsheet_services import SpreadsheetService
from app.schemas.document import DocumentPayload


class DocumentService:
    """
    Central service responsible for detecting an uploaded
    document type and routing it to the correct extractor.
    """

    SUPPORTED_EXTENSIONS = {
        ".pdf": "pdf",
        ".xlsx": "xlsx",
        ".csv": "csv",
    }

    @staticmethod
    async def extract_document(
        file: UploadFile,
    ) -> DocumentPayload:
        """
        Detect the uploaded document type and extract
        normalized content from it.
        """

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file has no filename."
            )

        # Use extension as our primary routing mechanism.
        extension = Path(file.filename).suffix.lower()

        file_type = DocumentService.SUPPORTED_EXTENSIONS.get(
            extension
        )

        if not file_type:
            raise HTTPException(
                status_code=415,
                detail=(
                    f"Unsupported file type: {extension}. "
                    "Currently supported: PDF, XLSX, CSV."
                )
            )

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        try:

            # -------------------------
            # PDF
            # -------------------------

            if file_type == "pdf":
                payload = PDFService.extract_text(
                    pdf_bytes=file_bytes,
                    filename=file.filename,
                )

                return DocumentPayload(
                    filename=payload.filename,
                    pages=payload.pages,
                    text=payload.text,
                    file_type="pdf",
                )

            # -------------------------
            # Excel
            # -------------------------

            if file_type == "xlsx":
                return SpreadsheetService.extract_xlsx(
                    file_bytes=file_bytes,
                    filename=file.filename,
                )

            # -------------------------
            # CSV
            # -------------------------

            if file_type == "csv":
                return SpreadsheetService.extract_csv(
                    file_bytes=file_bytes,
                    filename=file.filename,
                )

        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Failed to process "
                    f"{file.filename}: {str(exc)}"
                ),
            ) from exc

        raise HTTPException(
            status_code=415,
            detail="Unsupported document type."
        )