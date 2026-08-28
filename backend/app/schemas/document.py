from pydantic import BaseModel, Field


class DocumentPayload(BaseModel):
    """
    Standard document payload exchanged
    between backend services.
    """

    filename: str
    pages: int
    text: str


class DocumentAnalysis(BaseModel):
    """
    Structured AI analysis returned by the
    document intelligence workflow.
    """

    document_type: str
    title: str
    summary: str
    key_points: list[str]
    entities: list[str]
    important_dates: list[str]
    action_items: list[str]
    keywords: list[str]


class AnalyzeDocumentResponse(BaseModel):
    """
    Final response returned after a document
    is analyzed and stored for RAG.
    """

    document_id: str
    analysis: DocumentAnalysis


class ChatMessage(BaseModel):
    """
    One previous message in the document chat.
    """

    role: str
    content: str


class DocumentQuestion(BaseModel):
    """
    Request body for asking a question
    about a previously uploaded document.
    """

    document_id: str
    question: str
    history: list[ChatMessage] = Field(default_factory=list)


class DocumentAnswer(BaseModel):
    """
    Response returned by the RAG
    question-answering endpoint.
    """

    answer: str
    sources: list[str]