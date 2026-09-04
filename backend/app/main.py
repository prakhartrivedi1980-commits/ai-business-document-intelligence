from typing import Annotated

from fastapi import (
    FastAPI,
    File,
    UploadFile,
)

from fastapi.middleware.cors import CORSMiddleware

from app.services.document_services import DocumentService
from app.services.rag_services import RAGService
from app.services.invoice_services import InvoiceService

from app.schemas.document import (
    DocumentUploadResponse,
    MultipleDocumentUploadResponse,
    DocumentQuestion,
    DocumentAnswer,
    MultiDocumentQuestion,
    MultiDocumentAnswer,
    DocumentSummaryResponse,
    DocumentKeyPointsResponse,
    InvoiceExtractionResponse,
)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="AI Document Intelligence API",
    description=(
        "Backend API for AI Document "
        "Intelligence Platform"
    ),
    version="3.1.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "status": "success",
        "message": (
            "AI Document Intelligence API "
            "is running"
        ),
    }


# =========================================================
# DOCUMENT UPLOAD
# =========================================================

@app.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
)
async def upload_document(
    file: UploadFile = File(...),
):
    """
    Upload, extract, and index a document.

    Supported formats:
    - PDF
    - DOCX
    - TXT
    - XLSX
    - CSV

    Uploading does not automatically run
    summarization, key-point extraction,
    or invoice extraction.
    """

    # -----------------------------------------------------
    # EXTRACT
    # -----------------------------------------------------

    payload = (
        await DocumentService.extract_document(
            file
        )
    )

    # -----------------------------------------------------
    # INDEX
    # -----------------------------------------------------

    document_id = (
        await RAGService.store_document(
            text=payload.text,
            filename=payload.filename,
        )
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "document_id": document_id,
        "filename": payload.filename,
        "file_type": payload.file_type,
        "status": "ready",
        "metadata": payload.metadata,
    }


# =========================================================
# MULTIPLE DOCUMENT UPLOAD
# =========================================================

@app.post(
    "/documents/upload-multiple",
    response_model=MultipleDocumentUploadResponse,
)
async def upload_multiple_documents(
    files: Annotated[
        list[UploadFile],
        File(
            json_schema_extra={
                "items": {
                    "type": "string",
                    "format": "binary",
                }
            }
        ),
    ],
):
    """
    Upload, extract, and index multiple documents.

    Supported formats:
    - PDF
    - DOCX
    - TXT
    - XLSX
    - CSV

    Each document is processed independently.

    If one document fails, the remaining
    documents will still be processed.
    """

    documents = []
    errors = []

    # -----------------------------------------------------
    # PROCESS FILES
    # -----------------------------------------------------

    for file in files:

        try:

            # -------------------------------------------------
            # EXTRACT
            # -------------------------------------------------

            payload = (
                await DocumentService.extract_document(
                    file
                )
            )

            # -------------------------------------------------
            # INDEX
            # -------------------------------------------------

            document_id = (
                await RAGService.store_document(
                    text=payload.text,
                    filename=payload.filename,
                )
            )

            # -------------------------------------------------
            # SUCCESS
            # -------------------------------------------------

            documents.append(
                {
                    "document_id": document_id,
                    "filename": payload.filename,
                    "file_type": payload.file_type,
                    "status": "ready",
                    "metadata": payload.metadata,
                }
            )

        except Exception as exc:

            # -------------------------------------------------
            # FAILURE
            # -------------------------------------------------

            errors.append(
                {
                    "filename": (
                        file.filename
                        or "unknown"
                    ),
                    "error": str(exc),
                }
            )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "total_files": len(files),
        "successful": len(documents),
        "failed": len(errors),
        "documents": documents,
        "errors": errors,
    }


# =========================================================
# DOCUMENT CHAT
# =========================================================

@app.post(
    "/ask-document",
    response_model=DocumentAnswer,
)
async def ask_document(
    request: DocumentQuestion,
):
    """
    Ask a conversation-aware question
    about an indexed document.
    """

    result = (
        await RAGService.answer_question(
            document_id=request.document_id,
            question=request.question,
            history=request.history,
        )
    )

    return result

# =========================================================
# MULTI-DOCUMENT CHAT
# =========================================================

@app.post(
    "/ask-documents",
    response_model=MultiDocumentAnswer,
)
async def ask_documents(
    request: MultiDocumentQuestion,
):
    """
    Ask a conversation-aware question across
    multiple indexed documents.

    Supports cross-document comparison,
    synthesis, and reasoning.
    """

    result = (
        await RAGService
        .answer_multi_document_question(
            document_ids=(
                request.document_ids
            ),
            question=(
                request.question
            ),
            history=(
                request.history
            ),
        )
    )

    return result
# =========================================================
# DOCUMENT SUMMARY
# =========================================================

@app.post(
    "/documents/{document_id}/summary",
    response_model=DocumentSummaryResponse,
)
async def summarize_document(
    document_id: str,
):
    """
    Generate a document summary only
    when requested.
    """

    summary = (
        await RAGService.summarize_document(
            document_id=document_id
        )
    )

    return {
        "document_id": document_id,
        "summary": summary,
    }


# =========================================================
# DOCUMENT KEY POINTS
# =========================================================

@app.post(
    "/documents/{document_id}/key-points",
    response_model=DocumentKeyPointsResponse,
)
async def document_key_points(
    document_id: str,
):
    """
    Generate document key points only
    when requested.
    """

    key_points = (
        await RAGService.get_key_points(
            document_id=document_id
        )
    )

    return {
        "document_id": document_id,
        "key_points": key_points,
    }


# =========================================================
# INVOICE EXTRACTION
# =========================================================

@app.post(
    "/documents/{document_id}/invoice",
    response_model=InvoiceExtractionResponse,
)
async def extract_invoice(
    document_id: str,
):
    """
    Extract structured invoice information
    from an indexed document.

    The original document may be any supported
    format, such as PDF, DOCX, TXT, XLSX, or CSV.
    """

    invoice = (
        await InvoiceService.extract_invoice(
            document_id=document_id
        )
    )

    return {
        "document_id": document_id,
        "invoice": invoice,
    }


# =========================================================
# TEMPORARY RAG DEBUGGING ENDPOINT
# =========================================================

# TODO:
# Remove this endpoint once RAG testing
# and retrieval tuning are complete.

@app.get("/test-search")
async def test_search(
    document_id: str,
    question: str,
):
    return await RAGService.search_document(
        document_id=document_id,
        question=question,
    )