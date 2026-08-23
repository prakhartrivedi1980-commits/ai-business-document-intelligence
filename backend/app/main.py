from fastapi import FastAPI, UploadFile, File
import fitz

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

    document = fitz.open(stream=pdf_bytes, filetype="pdf")

    extracted_text = ""

    for page in document:
        extracted_text += page.get_text()

    page_count = len(document)
    document.close()

    return {
        "filename": file.filename,
        "pages": page_count,
        "text": extracted_text
    }