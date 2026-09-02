from app.schemas.document import DocumentPayload


class TextService:
    """
    Extract and normalize content from
    plain-text documents.
    """

    @staticmethod
    def extract_txt(
        file_bytes: bytes,
        filename: str,
    ) -> DocumentPayload:
        """
        Extract text and basic metadata
        from a TXT document.
        """

        try:
            text = file_bytes.decode(
                "utf-8-sig"
            )

        except UnicodeDecodeError:
            try:
                text = file_bytes.decode(
                    "latin-1"
                )

            except UnicodeDecodeError as exc:
                raise ValueError(
                    "Unable to decode TXT document."
                ) from exc

        # Normalize line endings.
        text = (
            text
            .replace("\r\n", "\n")
            .replace("\r", "\n")
        )

        extracted_text = text.strip()

        if not extracted_text:
            raise ValueError(
                "TXT document contains no usable text."
            )

        lines = [
            line
            for line in extracted_text.splitlines()
            if line.strip()
        ]

        words = extracted_text.split()

        metadata = {
            "character_count": len(
                extracted_text
            ),
            "word_count": len(words),
            "line_count": len(lines),
        }

        return DocumentPayload(
            filename=filename,
            file_type="txt",
            text=extracted_text,
            metadata=metadata,
        )