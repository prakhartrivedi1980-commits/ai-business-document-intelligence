from fastapi import FastAPI, UploadFile, File
from app.services.pdf_services import PDFService
from app.services.ai_services import AIService

app = FastAPI(
    title="AI Document Intelligence API",
    description="Backend API for AI Document Intelligence Platform",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "AI Document Intelligence API is running"
    }


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    
    pdf_bytes = await file.read()

    payload = PDFService.extract_text(
            pdf_bytes=pdf_bytes,
            filename=file.filename
    )

   
    summary = await AIService.summarize(payload)
    '''async with httpx.AsyncClient() as client:

        response = await client.post(
        "http://localhost:5678/webhook-test/process-document",
        json=payload
        )'''

    return summary
      