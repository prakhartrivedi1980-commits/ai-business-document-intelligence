import csv
import io

from openpyxl import load_workbook

from app.schemas.document import DocumentPayload


class SpreadsheetService:
    """
    Service responsible for extracting structured
    content from spreadsheet documents.

    Currently supports:
    - XLSX
    - CSV
    """

    # =========================================================
    # XLSX
    # =========================================================

    @staticmethod
    def extract_xlsx(
        file_bytes: bytes,
        filename: str,
    ) -> DocumentPayload:
        """
        Extract textual content and metadata
        from an Excel workbook.
        """

        workbook = load_workbook(
            filename=io.BytesIO(file_bytes),
            read_only=True,
            data_only=True,
        )

        sections = []

        try:
            for worksheet in workbook.worksheets:

                rows = []

                for row in worksheet.iter_rows(
                    values_only=True
                ):

                    values = [
                        ""
                        if value is None
                        else str(value)
                        for value in row
                    ]

                    # Ignore completely empty rows
                    if not any(
                        value.strip()
                        for value in values
                    ):
                        continue

                    rows.append(
                        " | ".join(values)
                    )

                # Add this sheet only if it contains data
                if rows:

                    section = (
                        f"Sheet: {worksheet.title}\n\n"
                        + "\n".join(rows)
                    )

                    sections.append(section)

            extracted_text = "\n\n---\n\n".join(
                sections
            )

            if not extracted_text.strip():
                raise ValueError(
                    "Spreadsheet contains no usable data."
                )

            return DocumentPayload(
                filename=filename,
                file_type="xlsx",
                text=extracted_text,
                metadata={
                    "sheet_count": len(
                        workbook.sheetnames
                    ),
                    "sheets": list(
                        workbook.sheetnames
                    ),
                },
            )

        finally:
            workbook.close()

    # =========================================================
    # CSV
    # =========================================================

    @staticmethod
    def extract_csv(
        file_bytes: bytes,
        filename: str,
    ) -> DocumentPayload:
        """
        Extract textual content and metadata
        from a CSV file.
        """

        # utf-8-sig handles normal UTF-8 CSV files
        # as well as files containing a UTF-8 BOM.
        text = file_bytes.decode(
            "utf-8-sig",
            errors="replace",
        )

        reader = csv.reader(
            io.StringIO(text)
        )

        rows = []
        max_columns = 0

        for row in reader:

            values = [
                str(value).strip()
                for value in row
            ]

            # Ignore completely empty rows
            if not any(values):
                continue

            # Track the largest number of columns
            max_columns = max(
                max_columns,
                len(values),
            )

            rows.append(
                " | ".join(values)
            )

        extracted_text = "\n".join(rows)

        if not extracted_text.strip():
            raise ValueError(
                "CSV contains no usable data."
            )

        return DocumentPayload(
            filename=filename,
            file_type="csv",
            text=extracted_text,
            metadata={
                "row_count": len(rows),
                "column_count": max_columns,
            },
        )