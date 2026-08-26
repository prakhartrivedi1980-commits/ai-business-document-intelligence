from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.services.pdf_services import PDFService
from app.services.ai_services import AIService
from app.services.rag_service import RAGService

from app.schemas.document import (
    AnalyzeDocumentResponse,
    DocumentQuestion,
    DocumentAnswer,
)


app = FastAPI(
    title="AI Document Intelligence API",
    description="Backend API for AI Document Intelligence Platform",
    version="2.0.0"
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
    "/analyze-document",
    response_model=AnalyzeDocumentResponse
)
async def analyze_document(
    file: UploadFile = File(...)
):
    """
    Upload and analyze a PDF document.

    Flow:
    1. Extract text or use OCR fallback
    2. Run AI document analysis through n8n
    3. Store document chunks and embeddings in Qdrant
    4. Return analysis and document_id
    """

    pdf_bytes = await file.read()

    payload = PDFService.extract_text(
        pdf_bytes=pdf_bytes,
        filename=file.filename
    )

    analysis = await AIService.summarize(payload)

    document_id = await RAGService.store_document(
        text=payload.text,
        filename=payload.filename
    )

    return {
        "document_id": document_id,
        "analysis": analysis
    }


@app.post(
    "/ask-document",
    response_model=DocumentAnswer
)
async def ask_document(
    request: DocumentQuestion
):
    """
    Ask a question about a previously uploaded document.
    """

    result = await RAGService.answer_question(
        document_id=request.document_id,
        question=request.question,
    )

    return result