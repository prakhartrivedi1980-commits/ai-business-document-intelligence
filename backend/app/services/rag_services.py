import uuid
import httpx

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)


class RAGService:
    """
    Handles document chunking, embeddings,
    vector storage, retrieval, and conversational
    answer generation.
    """

    # Ollama
    OLLAMA_EMBED_URL = "http://127.0.0.1:11434/api/embeddings"
    OLLAMA_GENERATE_URL = "http://127.0.0.1:11434/api/generate"

    EMBEDDING_MODEL = "nomic-embed-text"
    CHAT_MODEL = "llama3.1:8b"

    # Qdrant
    QDRANT_HOST = "127.0.0.1"
    QDRANT_PORT = 6333

    COLLECTION_NAME = "documents"

    # Chunking
    CHUNK_SIZE = 800
    CHUNK_OVERLAP = 150

    @staticmethod
    def chunk_text(text: str) -> list[str]:
        """
        Split document text into paragraph-aware chunks.
        """

        text = text.replace("\r\n", "\n").replace("\r", "\n")

        paragraphs = [
            paragraph.strip()
            for paragraph in text.split("\n\n")
            if paragraph.strip()
        ]

        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:

            if len(paragraph) > RAGService.CHUNK_SIZE:

                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""

                start = 0

                while start < len(paragraph):
                    end = start + RAGService.CHUNK_SIZE

                    piece = paragraph[start:end].strip()

                    if piece:
                        chunks.append(piece)

                    start += (
                        RAGService.CHUNK_SIZE
                        - RAGService.CHUNK_OVERLAP
                    )

                continue

            if current_chunk:
                candidate = f"{current_chunk}\n\n{paragraph}"
            else:
                candidate = paragraph

            if len(candidate) <= RAGService.CHUNK_SIZE:
                current_chunk = candidate

            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())

                current_chunk = paragraph

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    @staticmethod
    async def create_embedding(text: str) -> list[float]:
        """
        Generate an embedding using Ollama.
        """

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                RAGService.OLLAMA_EMBED_URL,
                json={
                    "model": RAGService.EMBEDDING_MODEL,
                    "prompt": text,
                },
            )

            response.raise_for_status()

            data = response.json()

            return data["embedding"]

    @staticmethod
    async def store_document(
        text: str,
        filename: str,
    ) -> str:
        """
        Chunk a document, generate embeddings,
        and store the chunks in Qdrant.
        """

        document_id = str(uuid.uuid4())

        chunks = RAGService.chunk_text(text)

        if not chunks:
            raise ValueError(
                "Document contains no usable text."
            )

        client = QdrantClient(
            host=RAGService.QDRANT_HOST,
            port=RAGService.QDRANT_PORT,
        )

        first_embedding = await RAGService.create_embedding(
            chunks[0]
        )

        vector_size = len(first_embedding)

        collections = client.get_collections().collections

        collection_exists = any(
            collection.name == RAGService.COLLECTION_NAME
            for collection in collections
        )

        if not collection_exists:
            client.create_collection(
                collection_name=RAGService.COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE,
                ),
            )

        points = []

        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=first_embedding,
                payload={
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": 0,
                    "text": chunks[0],
                },
            )
        )

        for index, chunk in enumerate(
            chunks[1:],
            start=1,
        ):
            embedding = await RAGService.create_embedding(
                chunk
            )

            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": index,
                        "text": chunk,
                    },
                )
            )

        client.upsert(
            collection_name=RAGService.COLLECTION_NAME,
            points=points,
        )

        return document_id

    @staticmethod
    def build_history_text(history: list) -> str:
        """
        Convert previous chat messages into readable text.
        """

        if not history:
            return ""

        lines = []

        for message in history:
            role = getattr(message, "role", "")
            content = getattr(message, "content", "")

            if role == "user":
                label = "User"
            elif role == "assistant":
                label = "Assistant"
            else:
                continue

            lines.append(f"{label}: {content}")

        return "\n".join(lines)

    @staticmethod
    def build_search_query(
        question: str,
        history: list,
    ) -> str:
        """
        Build a retrieval query using recent conversation
        context so follow-up questions are easier to resolve.
        """

        if not history:
            return question

        # Only use the latest few messages for retrieval.
        recent_history = history[-4:]

        history_text = RAGService.build_history_text(
            recent_history
        )

        return f"""
Conversation:
{history_text}

Current question:
{question}
""".strip()

    @staticmethod
    async def search_document(
        document_id: str,
        question: str,
        history: list | None = None,
        limit: int = 3,
    ) -> list[dict]:
        """
        Search a specific document for relevant chunks.

        Conversation history is included in the retrieval
        query when available.
        """

        history = history or []

        search_query = RAGService.build_search_query(
            question=question,
            history=history,
        )

        question_embedding = await RAGService.create_embedding(
            search_query
        )

        client = QdrantClient(
            host=RAGService.QDRANT_HOST,
            port=RAGService.QDRANT_PORT,
        )

        results = client.query_points(
            collection_name=RAGService.COLLECTION_NAME,
            query=question_embedding,
            query_filter={
                "must": [
                    {
                        "key": "document_id",
                        "match": {
                            "value": document_id
                        }
                    }
                ]
            },
            limit=limit,
            with_payload=True,
        )

        matches = []

        for point in results.points:

            if point.payload and "text" in point.payload:
                matches.append(
                    {
                        "text": point.payload["text"],
                        "score": point.score,
                        "chunk_index": point.payload.get(
                            "chunk_index"
                        ),
                        "filename": point.payload.get(
                            "filename"
                        ),
                    }
                )

        return matches

    @staticmethod
    async def answer_question(
        document_id: str,
        question: str,
        history: list | None = None,
    ) -> dict:
        """
        Retrieve relevant chunks and generate
        a conversation-aware grounded answer.
        """

        history = history or []

        chunks = await RAGService.search_document(
            document_id=document_id,
            question=question,
            history=history,
        )

        if not chunks:
            return {
                "answer": (
                    "I could not find relevant information "
                    "in the document."
                ),
                "sources": [],
            }

        context = "\n\n---\n\n".join(
            chunk["text"]
            for chunk in chunks
        )

        conversation = RAGService.build_history_text(
            history[-6:]
        )

        if not conversation:
            conversation = "No previous conversation."

        prompt = f"""
You are a conversational document question-answering assistant.

Answer using only the retrieved DOCUMENT CONTEXT.

You are also given the previous CONVERSATION so you can understand
follow-up questions such as:
- "Explain the second one."
- "What about the first?"
- "When did that happen?"
- "Tell me more about it."

Important rules:
- Conversation history is only for understanding what the user refers to.
- Factual answers must still be supported by the document context.
- Do not treat a previous assistant answer as proof if the document
  context does not support it.
- Read all retrieved context before answering.
- Do not use outside knowledge.
- Do not invent facts.
- OCR text may contain formatting errors, logos, headers, IDs,
  signatures, and unrelated branding.
- If information is ambiguous, explain the ambiguity briefly.
- If the answer truly cannot be determined from the document context,
  respond exactly:
  "I could not find that information in the document."
- Keep the answer clear and concise.

PREVIOUS CONVERSATION:

{conversation}

DOCUMENT CONTEXT:

{context}

CURRENT USER QUESTION:

{question}

ANSWER:
"""

        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                RAGService.OLLAMA_GENERATE_URL,
                json={
                    "model": RAGService.CHAT_MODEL,
                    "prompt": prompt,
                    "stream": False,
                },
            )

            response.raise_for_status()

            data = response.json()

        return {
            "answer": data["response"].strip(),
            "sources": [
                chunk["text"]
                for chunk in chunks
            ],
        }