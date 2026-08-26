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
    '''

import httpx
from app.schemas.document import DocumentPayload


class AIService:
    """
    Service responsible for communicating
    with the AI workflow (n8n).
    """

    WEBHOOK_URL = "http://localhost:5678/webhook/process-document"

    # (connect_timeout, read_timeout)
    # read=120s gives the n8n workflow (LLM call, OCR, etc.) room to finish.
    TIMEOUT = httpx.Timeout(10.0, read=120.0)

    @staticmethod
    async def summarize(payload: DocumentPayload) -> dict:
        """
        Send extracted document text to n8n.
        """

        async with httpx.AsyncClient(timeout=AIService.TIMEOUT) as client:
            try:
                response = await client.post(
                    AIService.WEBHOOK_URL,
                    json=payload.model_dump()
                )
                response.raise_for_status()
            except httpx.ReadTimeout:
                print("n8n workflow took too long to respond (ReadTimeout).")
                raise
            except httpx.HTTPStatusError as exc:
                print(f"n8n returned an error status: {exc.response.status_code}")
                print("Body:", exc.response.text[:500])
                raise

        print("Status Code:", response.status_code)
        print("Body:", response.text[:500])

        return response.json()'''