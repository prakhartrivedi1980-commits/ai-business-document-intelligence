import httpx
from app.schemas.document import DocumentPayload
class AIService:
    """
    Service responsible for communicating
    with the AI workflow (n8n).
    """

    WEBHOOK_URL = "http://localhost:5678/webhook/process-document"

    @staticmethod
    async def summarize(payload: DocumentPayload) -> dict:
        """
        Send extracted document text to n8n.
        """

        async with httpx.AsyncClient(timeout=300.0) as client:

            response = await client.post(
                AIService.WEBHOOK_URL,
                json=payload.model_dump()
            )
        '''    print("Status Code:", response.status_code)
            print("Response:", response.text)
            print("Raw Response:")
            print(response.text)
            print("STATUS:", response.status_code)
            print("BODY:", response.text[:500])
            response.raise_for_status() '''
        #return {"raw_response": response.text}

        #return response.json()
        if not response.text:
         return {
        "error": "n8n returned an empty response"
        }

        return response.json()
    