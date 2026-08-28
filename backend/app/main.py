from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.services.pdf_services import PDFService
from app.services.ai_services import AIService
from app.services.rag_services import RAGService

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
    Upload, analyze, and index a PDF document.
    """

    pdf_bytes = await file.read()

    # Extract normal PDF text or use OCR fallback.
    payload = PDFService.extract_text(
        pdf_bytes=pdf_bytes,
        filename=file.filename
    )

    # Generate structured document analysis through n8n.
    analysis = await AIService.summarize(payload)

    # Chunk, embed, and store the document in Qdrant.
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
    Ask a conversation-aware question about
    an indexed document.
    """

    result = await RAGService.answer_question(
        document_id=request.document_id,
        question=request.question,
        history=request.history,
    )

    return result


# Temporary debugging endpoint.
# We can remove this once RAG testing is complete.
@app.get("/test-search")
async def test_search(
    document_id: str,
    question: str,
):
    return await RAGService.search_document(
        document_id=document_id,
        question=question,
    )