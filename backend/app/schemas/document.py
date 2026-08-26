from pydantic import BaseModel


class DocumentPayload(BaseModel):
    """
    Standard document payload exchanged
    between backend services.
    """

    filename: str
    pages: int
    text: str