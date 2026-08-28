from typing import Any
from pydantic import BaseModel, Field


class DocumentPayload(BaseModel):
    """
    Normalized representation of any uploaded document.
    """

    filename: str
    file_type: str
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentUploadResponse(BaseModel):
    """
    Response returned after extraction and indexing.
    """

    document_id: str
    filename: str
    file_type: str
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)
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
    history: list[ChatMessage] = Field(default_factory=list)


class DocumentAnswer(BaseModel):
    """
    RAG answer returned to the frontend.
    """

    answer: str
    sources: list[str]

class DocumentSummaryResponse(BaseModel):
    """
    On-demand document summary response.
    """

    document_id: str
    summary: str


class DocumentKeyPointsResponse(BaseModel):
    """
    On-demand key-points response.
    """

    document_id: str
    key_points: list[str]