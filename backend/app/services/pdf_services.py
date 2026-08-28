import io
from pathlib import Path

import pymupdf
import pytesseract
from PIL import Image

from app.schemas.document import DocumentPayload


class PDFService:
    """
    Extract text from PDFs.

    Uses normal PDF text extraction first.
    Falls back to OCR for pages with little or no embedded text.
    """

    OCR_TEXT_THRESHOLD = 40

    TESSERACT_PATH = Path(
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )

    if TESSERACT_PATH.exists():
        pytesseract.pytesseract.tesseract_cmd = str(TESSERACT_PATH)

    @staticmethod
    def extract_text(
        pdf_bytes: bytes,
        filename: str,
    ) -> DocumentPayload:

        document = pymupdf.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        extracted_pages = []

        try:
            for page_number, page in enumerate(document, start=1):

                page_text = page.get_text("text").strip()

                if len(page_text) < PDFService.OCR_TEXT_THRESHOLD:
                    print(
                        f"Page {page_number}: "
                        "little/no embedded text found. Running OCR..."
                    )

                    matrix = pymupdf.Matrix(2, 2)

                    pixmap = page.get_pixmap(
                        matrix=matrix,
                        alpha=False
                    )

                    image_bytes = pixmap.tobytes("png")

                    image = Image.open(
                        io.BytesIO(image_bytes)
                    )

                    page_text = pytesseract.image_to_string(
                        image,
                        lang="eng"
                    ).strip()

                extracted_pages.append(page_text)

            extracted_text = "\n\n".join(
                text for text in extracted_pages if text
            )

            return DocumentPayload(
    filename=filename,
    file_type="pdf",
    text=extracted_text,
    metadata={
        "page_count": page_count
    }
)

        finally:
            document.close()