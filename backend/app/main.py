from fastapi import FastAPI, UploadFile, File
from app.services.pdf_services import PDFService
from app.services.ai_services import AIService
from app.schemas.document import DocumentAnalysis
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="AI Document Intelligence API",
    description="Backend API for AI Document Intelligence Platform",
    version="1.0.0"
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


@app.post("/extract-text", response_model=DocumentAnalysis)
async def extract_text(file: UploadFile = File(...)):

    pdf_bytes = await file.read()

    payload = PDFService.extract_text(
        pdf_bytes=pdf_bytes,
        filename=file.filename
    )

    summary = await AIService.summarize(payload)

    return summary