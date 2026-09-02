from typing import Any

from pydantic import BaseModel, Field


# =========================================================
# NORMALIZED DOCUMENT
# =========================================================

class DocumentPayload(BaseModel):
    """
    Normalized representation of any uploaded document.
    """

    filename: str
    file_type: str
    text: str

    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# DOCUMENT UPLOAD
# =========================================================

class DocumentUploadResponse(BaseModel):
    """
    Response returned after extraction and indexing.
    """

    document_id: str
    filename: str
    file_type: str
    status: str

    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


# =========================================================
# CHAT
# =========================================================

class ChatMessage(BaseModel):
    """
    Previous message from a document conversation.
    """

    role: str
    content: str


class DocumentQuestion(BaseModel):
    """
    Request for asking a question about
    an indexed document.
    """

    document_id: str
    question: str

    history: list[ChatMessage] = Field(
        default_factory=list
    )


class DocumentAnswer(BaseModel):
    """
    RAG answer returned to the frontend.
    """

    answer: str

    sources: list[str] = Field(
        default_factory=list
    )


# =========================================================
# DOCUMENT SUMMARY
# =========================================================

class DocumentSummaryResponse(BaseModel):
    """
    On-demand document summary response.
    """

    document_id: str
    summary: str


# =========================================================
# DOCUMENT KEY POINTS
# =========================================================

class DocumentKeyPointsResponse(BaseModel):
    """
    On-demand key-points response.
    """

    document_id: str

    key_points: list[str] = Field(
        default_factory=list
    )


# =========================================================
# INVOICE LINE ITEM
# =========================================================

class InvoiceLineItem(BaseModel):
    """
    One product or service listed on an invoice.

    Values are optional because invoice formats vary
    and some invoices may omit certain fields.
    """

    description: str | None = None

    quantity: float | None = None

    unit_price: float | None = None

    amount: float | None = None


# =========================================================
# INVOICE LINE ITEM
# =========================================================

class InvoiceLineItem(BaseModel):
    """
    One product or service listed on an invoice.
    """

    description: str | None = None
    quantity: float | None = None
    unit_price: float | None = None
    amount: float | None = None


# =========================================================
# INVOICE TAX
# =========================================================

class InvoiceTax(BaseModel):
    """
    One individual tax component.

    Examples:
    - GST 18%
    - CGST 9%
    - SGST 9%
    - IGST 18%
    - VAT 20%
    """

    name: str | None = None

    # Percentage representation:
    # 18 means 18%, 9 means 9%.
    rate: float | None = None

    amount: float | None = None


# =========================================================
# STRUCTURED INVOICE DATA
# =========================================================

class InvoiceData(BaseModel):
    """
    Structured information extracted
    from an invoice.
    """

    vendor: str | None = None
    customer: str | None = None

    invoice_number: str | None = None
    invoice_date: str | None = None
    due_date: str | None = None

    currency: str | None = None

    subtotal: float | None = None

    taxes: list[InvoiceTax] = Field(
        default_factory=list
    )

    discount: float | None = None

    shipping: float | None = None

    total: float | None = None

    line_items: list[InvoiceLineItem] = Field(
        default_factory=list
    )


# =========================================================
# INVOICE EXTRACTION RESPONSE
# =========================================================

class InvoiceExtractionResponse(BaseModel):
    """
    API response containing structured
    invoice information.
    """

    document_id: str

    invoice: InvoiceData