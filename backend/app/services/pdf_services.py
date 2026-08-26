import fitz
from app.schemas.document import DocumentPayload


class PDFService:
    """
    Service responsible for extracting text from PDF documents.
    """

    @staticmethod
    def extract_text(
        pdf_bytes: bytes,
        filename: str,
    ) -> dict:
        """
        Extract text from a PDF.

        Parameters
        ----------
        pdf_bytes : bytes
            Raw PDF file bytes.

        filename : str
            Original uploaded filename.

        Returns
        -------
        dict
            Dictionary containing filename,
            page count and extracted text.
        """

        document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        extracted_text = ""

        for page in document:
            extracted_text += page.get_text()

        page_count = len(document)

        document.close()

        return DocumentPayload(
        filename=filename,
        pages=page_count,
        text=extracted_text
    )