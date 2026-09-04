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
    vector storage, retrieval, conversational chat,
    summaries, and key-point generation.
    """

    # =========================================================
    # OLLAMA
    # =========================================================

    OLLAMA_EMBED_URL = (
        "http://127.0.0.1:11434/api/embeddings"
    )

    OLLAMA_GENERATE_URL = (
        "http://127.0.0.1:11434/api/generate"
    )

    EMBEDDING_MODEL = "nomic-embed-text"
    CHAT_MODEL = "llama3.1:8b"

    EMBEDDING_TIMEOUT = 120.0
    GENERATION_TIMEOUT = 300.0

    # =========================================================
    # QDRANT
    # =========================================================

    QDRANT_HOST = "127.0.0.1"
    QDRANT_PORT = 6333
    COLLECTION_NAME = "documents"

    # =========================================================
    # CHUNKING
    # =========================================================

    CHUNK_SIZE = 800
    CHUNK_OVERLAP = 150

    # Large-document AI processing.
    #
    # Instead of sending the entire document to the LLM,
    # large documents are grouped into manageable sections.
    AI_SECTION_SIZE = 6000

    # Documents below this size can normally be processed
    # directly in one generation request.
    DIRECT_AI_LIMIT = 12000

    # =========================================================
    # CHUNKING
    # =========================================================

    @staticmethod
    def chunk_text(
        text: str,
    ) -> list[str]:
        """
        Split document text into paragraph-aware chunks.
        """

        text = (
            text
            .replace("\r\n", "\n")
            .replace("\r", "\n")
        )

        paragraphs = [
            paragraph.strip()
            for paragraph in text.split("\n\n")
            if paragraph.strip()
        ]

        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:

            # Very large paragraph
            if len(paragraph) > RAGService.CHUNK_SIZE:

                if current_chunk:
                    chunks.append(
                        current_chunk.strip()
                    )

                    current_chunk = ""

                start = 0

                while start < len(paragraph):

                    end = (
                        start
                        + RAGService.CHUNK_SIZE
                    )

                    piece = (
                        paragraph[start:end]
                        .strip()
                    )

                    if piece:
                        chunks.append(piece)

                    start += (
                        RAGService.CHUNK_SIZE
                        - RAGService.CHUNK_OVERLAP
                    )

                continue

            if current_chunk:

                candidate = (
                    f"{current_chunk}\n\n"
                    f"{paragraph}"
                )

            else:
                candidate = paragraph

            if (
                len(candidate)
                <= RAGService.CHUNK_SIZE
            ):
                current_chunk = candidate

            else:

                if current_chunk:
                    chunks.append(
                        current_chunk.strip()
                    )

                current_chunk = paragraph

        if current_chunk:
            chunks.append(
                current_chunk.strip()
            )

        return chunks

    # =========================================================
    # AI SECTIONING
    # =========================================================

    @staticmethod
    def split_for_ai(
        text: str,
        section_size: int | None = None,
    ) -> list[str]:
        """
        Split reconstructed document text into
        manageable sections for LLM processing.

        This prevents large documents from being sent
        to Ollama in a single oversized request.
        """

        section_size = (
            section_size
            or RAGService.AI_SECTION_SIZE
        )

        text = text.strip()

        if not text:
            return []

        paragraphs = [
            paragraph.strip()
            for paragraph in text.split("\n\n")
            if paragraph.strip()
        ]

        sections = []
        current_section = ""

        for paragraph in paragraphs:

            # Handle a single extremely large paragraph.
            if len(paragraph) > section_size:

                if current_section:
                    sections.append(
                        current_section.strip()
                    )

                    current_section = ""

                start = 0

                while start < len(paragraph):

                    piece = paragraph[
                        start:
                        start + section_size
                    ].strip()

                    if piece:
                        sections.append(piece)

                    start += section_size

                continue

            if current_section:

                candidate = (
                    f"{current_section}\n\n"
                    f"{paragraph}"
                )

            else:
                candidate = paragraph

            if len(candidate) <= section_size:

                current_section = candidate

            else:

                sections.append(
                    current_section.strip()
                )

                current_section = paragraph

        if current_section:

            sections.append(
                current_section.strip()
            )

        return sections

    # =========================================================
    # OLLAMA GENERATION
    # =========================================================

    @staticmethod
    async def generate_text(
        prompt: str,
        *,
        num_predict: int = 500,
    ) -> str:
        """
        Generate text using the configured Ollama
        chat model.
        """

        timeout = httpx.Timeout(
            RAGService.GENERATION_TIMEOUT,
            connect=30.0,
        )

        async with httpx.AsyncClient(
            timeout=timeout,
        ) as client:

            response = await client.post(
                RAGService.OLLAMA_GENERATE_URL,
                json={
                    "model": (
                        RAGService.CHAT_MODEL
                    ),
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_ctx": 8192,
                        "num_predict": num_predict,
                    },
                },
            )

            response.raise_for_status()

            data = response.json()

        generated_text = (
            data.get("response", "")
            .strip()
        )

        if not generated_text:
            raise ValueError(
                "Ollama returned an empty response."
            )

        return generated_text

    # =========================================================
    # EMBEDDINGS
    # =========================================================

    @staticmethod
    async def create_embedding(
        text: str,
    ) -> list[float]:
        """
        Generate an embedding using Ollama.
        """

        async with httpx.AsyncClient(
            timeout=RAGService.EMBEDDING_TIMEOUT,
        ) as client:

            response = await client.post(
                RAGService.OLLAMA_EMBED_URL,
                json={
                    "model": (
                        RAGService.EMBEDDING_MODEL
                    ),
                    "prompt": text,
                },
            )

            response.raise_for_status()

            data = response.json()

        return data["embedding"]

    # =========================================================
    # DOCUMENT STORAGE
    # =========================================================

    @staticmethod
    async def store_document(
        text: str,
        filename: str,
    ) -> str:
        """
        Chunk, embed, and store a document in Qdrant.

        Returns the generated document ID.
        """

        document_id = str(
            uuid.uuid4()
        )

        chunks = RAGService.chunk_text(
            text
        )

        if not chunks:
            raise ValueError(
                "Document contains no usable text."
            )

        client = QdrantClient(
            host=RAGService.QDRANT_HOST,
            port=RAGService.QDRANT_PORT,
        )

        first_embedding = (
            await RAGService.create_embedding(
                chunks[0]
            )
        )

        vector_size = len(
            first_embedding
        )

        collections = (
            client
            .get_collections()
            .collections
        )

        collection_exists = any(
            collection.name
            == RAGService.COLLECTION_NAME
            for collection in collections
        )

        if not collection_exists:

            client.create_collection(
                collection_name=(
                    RAGService.COLLECTION_NAME
                ),
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE,
                ),
            )

        points = []

        # First chunk
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

        # Remaining chunks
        for index, chunk in enumerate(
            chunks[1:],
            start=1,
        ):

            embedding = (
                await RAGService.create_embedding(
                    chunk
                )
            )

            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "document_id": (
                            document_id
                        ),
                        "filename": filename,
                        "chunk_index": index,
                        "text": chunk,
                    },
                )
            )

        client.upsert(
            collection_name=(
                RAGService.COLLECTION_NAME
            ),
            points=points,
        )

        return document_id

    # =========================================================
    # DOCUMENT RECONSTRUCTION
    # =========================================================

    @staticmethod
    def get_document_text(
        document_id: str,
    ) -> str:
        """
        Retrieve every chunk belonging to a document
        and reconstruct its text.
        """

        client = QdrantClient(
            host=RAGService.QDRANT_HOST,
            port=RAGService.QDRANT_PORT,
        )

        records = []
        offset = None

        while True:

            points, next_offset = client.scroll(
                collection_name=(
                    RAGService.COLLECTION_NAME
                ),
                scroll_filter={
                    "must": [
                        {
                            "key": "document_id",
                            "match": {
                                "value": (
                                    document_id
                                )
                            },
                        }
                    ]
                },
                limit=100,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )

            records.extend(points)

            if next_offset is None:
                break

            offset = next_offset

        if not records:
            raise ValueError(
                "Document was not found in Qdrant."
            )

        records.sort(
            key=lambda point: (
                point.payload.get(
                    "chunk_index",
                    0,
                )
                if point.payload
                else 0
            )
        )

        texts = [
            point.payload["text"]
            for point in records
            if (
                point.payload
                and point.payload.get("text")
            )
        ]

        return "\n\n".join(texts)

    # =========================================================
    # SUMMARY HELPERS
    # =========================================================

    @staticmethod
    async def summarize_section(
        section: str,
        section_number: int,
        total_sections: int,
    ) -> str:
        """
        Summarize one section of a large document.
        """

        prompt = f"""
You are analyzing section {section_number} of {total_sections}
from a larger document.

Create a concise factual summary of this section.

Rules:
- Use only information contained in this section.
- Do not invent facts.
- Preserve important names, numbers, dates, findings,
  decisions, and conclusions.
- Ignore obvious OCR noise.
- Do not add an introduction.
- Do not mention that this is a section.
- Return only the factual summary.

DOCUMENT SECTION:

{section}

SUMMARY:
"""

        return await RAGService.generate_text(
            prompt,
            num_predict=350,
        )

    # =========================================================
    # ON-DEMAND SUMMARY
    # =========================================================

    @staticmethod
    async def summarize_document(
        document_id: str,
    ) -> str:
        """
        Generate a document summary on demand.

        Small documents are summarized directly.
        Large documents use hierarchical summarization.
        """

        document_text = (
            RAGService.get_document_text(
                document_id
            )
        )

        print(
            "SUMMARY DOCUMENT LENGTH:",
            len(document_text),
            "characters",
        )

        # -----------------------------------------------------
        # SMALL DOCUMENT
        # -----------------------------------------------------

        if (
            len(document_text)
            <= RAGService.DIRECT_AI_LIMIT
        ):

            prompt = f"""
You are a document summarization assistant.

Summarize the following document accurately.

Instructions:
- Use only information contained in the document.
- Do not invent facts.
- Identify the document's main purpose.
- Include the most important information.
- Preserve important names, numbers, dates,
  findings, and conclusions.
- Ignore obvious OCR noise.
- Keep the summary concise but informative.
- Return only the summary.

DOCUMENT:

{document_text}

SUMMARY:
"""

            return await RAGService.generate_text(
                prompt,
                num_predict=500,
            )

        # -----------------------------------------------------
        # LARGE DOCUMENT
        # -----------------------------------------------------

        sections = RAGService.split_for_ai(
            document_text
        )

        print(
            "SUMMARY SECTIONS:",
            len(sections),
        )

        partial_summaries = []

        for index, section in enumerate(
            sections,
            start=1,
        ):

            print(
                "SUMMARIZING SECTION:",
                index,
                "/",
                len(sections),
            )

            partial_summary = (
                await RAGService.summarize_section(
                    section=section,
                    section_number=index,
                    total_sections=len(
                        sections
                    ),
                )
            )

            partial_summaries.append(
                partial_summary
            )

        combined_summaries = (
            "\n\n---\n\n".join(
                partial_summaries
            )
        )

        final_prompt = f"""
You are a document summarization assistant.

Below are summaries of different sections from one
complete document.

Create one coherent final summary of the entire document.

Instructions:
- Use only information present in the section summaries.
- Do not invent facts.
- Remove repetition.
- Identify the overall purpose of the document.
- Preserve important names, numbers, dates,
  findings, decisions, and conclusions.
- Combine related information naturally.
- Keep the final result concise but informative.
- Do not mention section summaries.
- Return only the final summary.

SECTION SUMMARIES:

{combined_summaries}

FINAL SUMMARY:
"""

        return await RAGService.generate_text(
            final_prompt,
            num_predict=600,
        )

    # =========================================================
    # KEY POINT HELPERS
    # =========================================================

    @staticmethod
    async def extract_section_key_points(
        section: str,
    ) -> str:
        """
        Extract candidate key points from one
        section of a large document.
        """

        prompt = f"""
Extract the most important facts from this document section.

Rules:
- Use only information contained in the section.
- Do not invent facts.
- Preserve important numbers, names, dates,
  findings, decisions, and conclusions.
- Ignore obvious OCR noise.
- Return one point per line.
- Begin every point with "- ".
- Do not include an introduction or conclusion.

DOCUMENT SECTION:

{section}

KEY POINTS:
"""

        return await RAGService.generate_text(
            prompt,
            num_predict=350,
        )

    # =========================================================
    # KEY POINT PARSING
    # =========================================================

    @staticmethod
    def parse_key_points(
        raw_output: str,
    ) -> list[str]:
        """
        Convert model key-point output into
        a normalized list.
        """

        key_points = []

        for line in raw_output.splitlines():

            line = line.strip()

            if not line:
                continue

            if line.startswith("- "):
                line = line[2:].strip()

            elif line.startswith("• "):
                line = line[2:].strip()

            if line:
                key_points.append(line)

        return key_points

    # =========================================================
    # ON-DEMAND KEY POINTS
    # =========================================================

    @staticmethod
    async def get_key_points(
        document_id: str,
    ) -> list[str]:
        """
        Generate key points on demand.

        Large documents are processed section-by-section
        before producing the final key-point list.
        """

        document_text = (
            RAGService.get_document_text(
                document_id
            )
        )

        print(
            "KEY POINT DOCUMENT LENGTH:",
            len(document_text),
            "characters",
        )

        # -----------------------------------------------------
        # SMALL DOCUMENT
        # -----------------------------------------------------

        if (
            len(document_text)
            <= RAGService.DIRECT_AI_LIMIT
        ):

            prompt = f"""
You are a document analysis assistant.

Extract the most important key points from the following
document.

Instructions:
- Use only information contained in the document.
- Do not invent facts.
- Ignore obvious OCR noise.
- Preserve meaningful names, numbers, dates,
  findings, and conclusions.
- Select only meaningful information.
- Return one key point per line.
- Begin every point with "- ".
- Do not include an introduction.
- Do not include a conclusion.

DOCUMENT:

{document_text}

KEY POINTS:
"""

            raw_output = (
                await RAGService.generate_text(
                    prompt,
                    num_predict=500,
                )
            )

            return RAGService.parse_key_points(
                raw_output
            )

        # -----------------------------------------------------
        # LARGE DOCUMENT
        # -----------------------------------------------------

        sections = RAGService.split_for_ai(
            document_text
        )

        candidate_outputs = []

        for index, section in enumerate(
            sections,
            start=1,
        ):

            print(
                "EXTRACTING KEY POINTS SECTION:",
                index,
                "/",
                len(sections),
            )

            output = (
                await RAGService
                .extract_section_key_points(
                    section
                )
            )

            candidate_outputs.append(
                output
            )

        candidates = "\n".join(
            candidate_outputs
        )

        final_prompt = f"""
You are a document analysis assistant.

Below are candidate key points extracted from different
sections of one document.

Create the final list of the most important insights
from the entire document.

Instructions:
- Use only the candidate information below.
- Do not invent facts.
- Remove duplicates and near-duplicates.
- Preserve important names, numbers, dates,
  findings, decisions, and conclusions.
- Select the most meaningful information.
- Prefer approximately 5 to 10 key points.
- Return one point per line.
- Begin every point with "- ".
- Do not include an introduction.
- Do not include a conclusion.

CANDIDATE KEY POINTS:

{candidates}

FINAL KEY POINTS:
"""

        raw_output = (
            await RAGService.generate_text(
                final_prompt,
                num_predict=500,
            )
        )

        return RAGService.parse_key_points(
            raw_output
        )

    # =========================================================
    # CHAT HISTORY
    # =========================================================

    @staticmethod
    def build_history_text(
        history: list,
    ) -> str:
        """
        Convert previous conversation messages
        into text for the LLM.
        """

        if not history:
            return ""

        lines = []

        for message in history:

            role = getattr(
                message,
                "role",
                "",
            )

            content = getattr(
                message,
                "content",
                "",
            )

            if role == "user":
                label = "User"

            elif role == "assistant":
                label = "Assistant"

            else:
                continue

            lines.append(
                f"{label}: {content}"
            )

        return "\n".join(lines)

    @staticmethod
    def build_search_query(
        question: str,
        history: list,
    ) -> str:
        """
        Include recent conversation context in
        semantic retrieval for follow-up questions.
        """

        if not history:
            return question

        recent_history = history[-4:]

        history_text = (
            RAGService.build_history_text(
                recent_history
            )
        )

        return f"""
Conversation:
{history_text}

Current question:
{question}
""".strip()

    # =========================================================
    # VECTOR SEARCH
    # =========================================================

    @staticmethod
    async def search_document(
        document_id: str,
        question: str,
        history: list | None = None,
        limit: int = 3,
    ) -> list[dict]:
        """
        Retrieve relevant chunks from Qdrant.
        """

        history = history or []

        search_query = (
            RAGService.build_search_query(
                question=question,
                history=history,
            )
        )

        question_embedding = (
            await RAGService.create_embedding(
                search_query
            )
        )

        client = QdrantClient(
            host=RAGService.QDRANT_HOST,
            port=RAGService.QDRANT_PORT,
        )

        results = client.query_points(
            collection_name=(
                RAGService.COLLECTION_NAME
            ),
            query=question_embedding,
            query_filter={
                "must": [
                    {
                        "key": "document_id",
                        "match": {
                            "value": (
                                document_id
                            )
                        },
                    }
                ]
            },
            limit=limit,
            with_payload=True,
        )

        matches = []

        for point in results.points:

            if (
                point.payload
                and "text" in point.payload
            ):

                matches.append(
                    {
                        "text": (
                            point.payload[
                                "text"
                            ]
                        ),
                        "score": point.score,
                        "chunk_index": (
                            point.payload.get(
                                "chunk_index"
                            )
                        ),
                        "filename": (
                            point.payload.get(
                                "filename"
                            )
                        ),
                    }
                )

        return matches

        # =========================================================
    # MULTI-DOCUMENT VECTOR SEARCH
    # =========================================================

    @staticmethod
    async def search_documents(
        document_ids: list[str],
        question: str,
        history: list | None = None,
        limit_per_document: int = 3,
    ) -> list[dict]:
        """
        Retrieve relevant chunks from multiple documents.

        Each document is searched independently so that
        one document cannot dominate the retrieval results.
        """

        history = history or []

        if not document_ids:
            return []

        # Remove duplicate document IDs while
        # preserving their original order.
        unique_document_ids = list(
            dict.fromkeys(
                document_ids
            )
        )

        search_query = (
            RAGService.build_search_query(
                question=question,
                history=history,
            )
        )

        # Generate the query embedding only once.
        question_embedding = (
            await RAGService.create_embedding(
                search_query
            )
        )

        client = QdrantClient(
            host=RAGService.QDRANT_HOST,
            port=RAGService.QDRANT_PORT,
        )

        matches = []

        for document_id in unique_document_ids:

            results = client.query_points(
                collection_name=(
                    RAGService.COLLECTION_NAME
                ),
                query=question_embedding,
                query_filter={
                    "must": [
                        {
                            "key": "document_id",
                            "match": {
                                "value": (
                                    document_id
                                )
                            },
                        }
                    ]
                },
                limit=limit_per_document,
                with_payload=True,
            )

            for point in results.points:

                if (
                    point.payload
                    and "text" in point.payload
                ):

                    matches.append(
                        {
                            "document_id": (
                                document_id
                            ),
                            "text": (
                                point.payload[
                                    "text"
                                ]
                            ),
                            "score": (
                                point.score
                            ),
                            "chunk_index": (
                                point.payload.get(
                                    "chunk_index"
                                )
                            ),
                            "filename": (
                                point.payload.get(
                                    "filename"
                                )
                            ),
                        }
                    )

        return matches

    # =========================================================
    # CONVERSATIONAL RAG
    # =========================================================

    @staticmethod
    async def answer_question(
        document_id: str,
        question: str,
        history: list | None = None,
    ) -> dict:
        """
        Retrieve relevant document context and generate
        a conversation-aware answer.
        """

        history = history or []

        chunks = (
            await RAGService.search_document(
                document_id=document_id,
                question=question,
                history=history,
            )
        )

        if not chunks:

            return {
                "answer": (
                    "I could not find relevant "
                    "information in the document."
                ),
                "sources": [],
            }

        context = "\n\n---\n\n".join(
            chunk["text"]
            for chunk in chunks
        )

        conversation = (
            RAGService.build_history_text(
                history[-6:]
            )
        )

        if not conversation:
            conversation = (
                "No previous conversation."
            )

        prompt = f"""
You are a conversational document question-answering
assistant.

Answer the current question using only the retrieved
DOCUMENT CONTEXT.

Previous conversation is provided only to help understand
references such as "it", "that", "the second one", or
similar follow-up questions.

Rules:
- Facts must be supported by the document context.
- Do not use outside knowledge.
- Do not invent information.
- Read all retrieved chunks before answering.
- OCR text may contain formatting errors, logos, headers,
  IDs, signatures, and unrelated branding.
- If information is ambiguous, explain the ambiguity.
- If the answer cannot be determined from the document,
  respond exactly:
  "I could not find that information in the document."
- Keep the answer clear and concise.

Spreadsheet and financial-value rules:
- Spreadsheet values may be stored using their underlying
  numeric representation rather than their displayed
  formatting.
- When a value clearly represents a percentage or rate,
  interpret decimal fractions correctly.
- For example, a rate stored as 0.18 represents 18%,
  0.09 represents 9%, and 0.05 represents 5%.
- Convert a decimal rate to percentage form by multiplying
  it by 100 before displaying the percent sign.
- Never report 0.18 as 0.18% when the document identifies
  that value as a percentage/rate.
- Do not convert ordinary decimal numbers into percentages
  unless the document context clearly identifies the value
  as a rate, percentage, GST, VAT, tax rate, discount rate,
  interest rate, or another percentage-based field.
- If the document already explicitly provides a percentage
  such as 18%, preserve it as 18%.
- Monetary values and ordinary decimal quantities must not
  be modified by these percentage rules.

PREVIOUS CONVERSATION:

{conversation}

DOCUMENT CONTEXT:

{context}

CURRENT USER QUESTION:

{question}

ANSWER:
"""

        answer = (
            await RAGService.generate_text(
                prompt,
                num_predict=450,
            )
        )

        return {
            "answer": answer,
            "sources": [
                chunk["text"]
                for chunk in chunks
            ],
        }


    # =========================================================
    # MULTI-DOCUMENT CONVERSATIONAL RAG
    # =========================================================

    @staticmethod
    async def answer_multi_document_question(
        document_ids: list[str],
        question: str,
        history: list | None = None,
    ) -> dict:
        """
        Answer a question using context retrieved
        from multiple selected documents.

        Supports cross-document comparison,
        synthesis, and reasoning while preserving
        document identity.
        """

        history = history or []

        if not document_ids:

            return {
                "answer": (
                    "No documents were selected."
                ),
                "sources": [],
            }

        chunks = (
            await RAGService.search_documents(
                document_ids=document_ids,
                question=question,
                history=history,
                limit_per_document=3,
            )
        )

        if not chunks:

            return {
                "answer": (
                    "I could not find relevant "
                    "information in the selected "
                    "documents."
                ),
                "sources": [],
            }


        # -----------------------------------------------------
        # GROUP CHUNKS BY DOCUMENT
        # -----------------------------------------------------

        grouped_chunks = {}

        for chunk in chunks:

            document_id = (
                chunk["document_id"]
            )

            if (
                document_id
                not in grouped_chunks
            ):

                grouped_chunks[
                    document_id
                ] = {
                    "filename": (
                        chunk.get(
                            "filename"
                        )
                        or "Unknown document"
                    ),
                    "chunks": [],
                }

            grouped_chunks[
                document_id
            ]["chunks"].append(
                chunk
            )


        # -----------------------------------------------------
        # BUILD DOCUMENT-LABELLED CONTEXT
        # -----------------------------------------------------

        context_sections = []

        for (
            document_id,
            document_data
        ) in grouped_chunks.items():

            filename = (
                document_data[
                    "filename"
                ]
            )

            document_context = (
                "\n\n".join(
                    chunk["text"]
                    for chunk
                    in document_data[
                        "chunks"
                    ]
                )
            )

            context_sections.append(
                f"""
==================================================
DOCUMENT: {filename}
DOCUMENT ID: {document_id}
==================================================

{document_context}
""".strip()
            )


        context = (
            "\n\n\n".join(
                context_sections
            )
        )


        # -----------------------------------------------------
        # CONVERSATION HISTORY
        # -----------------------------------------------------

        conversation = (
            RAGService.build_history_text(
                history[-6:]
            )
        )

        if not conversation:

            conversation = (
                "No previous conversation."
            )


        # -----------------------------------------------------
        # PROMPT
        # -----------------------------------------------------

        prompt = f"""
You are a multi-document conversational analysis assistant.

The user may ask questions that require comparing,
contrasting, combining, or reasoning across several
documents.

Use only the retrieved SELECTED DOCUMENT CONTEXT below.

Each context section is explicitly labelled with its
document filename and document ID.

Rules:
- Use only information contained in the selected document
  context.
- Do not use outside knowledge.
- Do not invent facts.
- Read evidence from all relevant documents before answering.
- Keep information associated with the correct document.
- When comparing documents, clearly identify which document
  each fact comes from.
- Use filenames when referring to documents whenever useful.
- Do not combine values from different documents as though
  they came from one document.
- Explicitly identify meaningful similarities and
  differences when the user asks for comparison.
- If documents conflict, explain the conflict and identify
  the documents involved.
- If a selected document does not contain information needed
  for the comparison, say so rather than inventing a value.
- If the answer cannot be determined from the retrieved
  context, respond:
  "I could not find that information in the selected documents."
- Keep the answer clear, structured, and concise.

Spreadsheet and financial-value rules:
- Spreadsheet values may be stored using their underlying
  numeric representation rather than displayed formatting.
- When a value clearly represents a percentage or rate,
  interpret decimal fractions correctly.
- A rate stored as 0.18 represents 18%.
- A rate stored as 0.09 represents 9%.
- A rate stored as 0.05 represents 5%.
- Convert decimal rates to percentage form by multiplying
  them by 100 before displaying the percent sign.
- Never report 0.18 as 0.18% when the field represents a
  percentage or rate.
- Do not convert ordinary decimal values into percentages
  unless the document clearly identifies them as rates,
  percentages, tax rates, discounts, interest rates,
  GST, VAT, or similar percentage-based values.
- Monetary values and ordinary numeric quantities must not
  be modified by these percentage rules.

PREVIOUS CONVERSATION:

{conversation}

SELECTED DOCUMENT CONTEXT:

{context}

CURRENT USER QUESTION:

{question}

ANSWER:
"""

        answer = (
            await RAGService.generate_text(
                prompt,
                num_predict=650,
            )
        )


        # -----------------------------------------------------
        # SOURCES
        # -----------------------------------------------------

        sources = []

        for chunk in chunks:

            sources.append(
                {
                    "document_id": (
                        chunk[
                            "document_id"
                        ]
                    ),
                    "filename": (
                        chunk.get(
                            "filename"
                        )
                    ),
                    "text": (
                        chunk[
                            "text"
                        ]
                    ),
                }
            )


        return {
            "answer": answer,
            "sources": sources,
        }