from pydantic import BaseModel


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