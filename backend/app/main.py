from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.services.document_services import DocumentService
from app.services.rag_services import RAGService

from app.schemas.document import (
    DocumentUploadResponse,
    DocumentQuestion,
    DocumentAnswer,
    DocumentSummaryResponse,
    DocumentKeyPointsResponse,
)


app = FastAPI(
    title="AI Document Intelligence API",
    description="Backend API for AI Document Intelligence Platform",
    version="3.0.0"
)


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


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "AI Document Intelligence API is running"
    }


@app.post(
    "/documents/upload",
    response_model=DocumentUploadResponse
)
async def upload_document(
    file: UploadFile = File(...)
):
    """
    Upload, extract, and index a document.

    Uploading does NOT automatically run
    summarization or key-point extraction.
    """

    # Detect document type and extract its content.
    payload = await DocumentService.extract_document(file)

    # Store extracted content in Qdrant for RAG.
    document_id = await RAGService.store_document(
        text=payload.text,
        filename=payload.filename,
    )

    return {
        "document_id": document_id,
        "filename": payload.filename,
        "file_type": payload.file_type,
        "pages": payload.pages,
        "status": "ready",
    }


@app.post(
    "/ask-document",
    response_model=DocumentAnswer
)
async def ask_document(
    request: DocumentQuestion
):
    """
    Ask a conversation-aware question
    about an indexed document.
    """

    result = await RAGService.answer_question(
        document_id=request.document_id,
        question=request.question,
        history=request.history,
    )

    return result

@app.post(
    "/documents/{document_id}/summary",
    response_model=DocumentSummaryResponse,
)
async def summarize_document(
    document_id: str,
):
    """
    Generate a summary only when requested.
    """

    summary = await RAGService.summarize_document(
        document_id=document_id
    )

    return {
        "document_id": document_id,
        "summary": summary,
    }


@app.post(
    "/documents/{document_id}/key-points",
    response_model=DocumentKeyPointsResponse,
)
async def document_key_points(
    document_id: str,
):
    """
    Generate key points only when requested.
    """

    key_points = await RAGService.get_key_points(
        document_id=document_id
    )

    return {
        "document_id": document_id,
        "key_points": key_points,
    }

# Temporary RAG debugging endpoint.
# We will remove this later.
@app.get("/test-search")
async def test_search(
    document_id: str,
    question: str,
):
    return await RAGService.search_document(
        document_id=document_id,
        question=question,
    )