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
    vector storage, retrieval, and answer generation.
    """

    OLLAMA_EMBED_URL = "http://127.0.0.1:11434/api/embeddings"
    OLLAMA_GENERATE_URL = "http://127.0.0.1:11434/api/generate"

    EMBEDDING_MODEL = "nomic-embed-text"
    CHAT_MODEL = "llama3.1:8b"

    QDRANT_HOST = "127.0.0.1"
    QDRANT_PORT = 6333

    COLLECTION_NAME = "documents"

    CHUNK_SIZE = 800
    CHUNK_OVERLAP = 150

    @staticmethod
    def chunk_text(text: str) -> list[str]:
        """
        Split document text into overlapping chunks.
        """

        chunks = []

        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + RAGService.CHUNK_SIZE

            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            start += (
                RAGService.CHUNK_SIZE
                - RAGService.CHUNK_OVERLAP
            )

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
        Chunk document, generate embeddings,
        and store chunks in Qdrant.

        Returns a unique document_id.
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
    async def search_document(
        document_id: str,
        question: str,
        limit: int = 3,
    ) -> list[str]:
        """
        Retrieve the most relevant chunks
        for a question from one document.
        """

        question_embedding = await RAGService.create_embedding(
            question
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

        chunks = []

        for point in results.points:
            if point.payload and "text" in point.payload:
                chunks.append(
                    point.payload["text"]
                )

        return chunks

    @staticmethod
    async def answer_question(
        document_id: str,
        question: str,
    ) -> dict:
        """
        Retrieve relevant document chunks
        and generate a grounded answer using Ollama.
        """

        chunks = await RAGService.search_document(
            document_id=document_id,
            question=question,
        )

        if not chunks:
            return {
                "answer": (
                    "I could not find relevant information "
                    "in the document."
                ),
                "sources": [],
            }

        context = "\n\n---\n\n".join(chunks)

        prompt = f"""
You are an AI assistant answering questions about a document.

Answer the user's question using ONLY the provided document context.

Rules:
- Do not use outside knowledge.
- Do not invent information.
- If the answer is not present in the context, say:
  "I could not find that information in the document."
- Keep the answer clear and concise.

DOCUMENT CONTEXT:

{context}

USER QUESTION:

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
            "sources": chunks,
        }