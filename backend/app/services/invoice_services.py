import json
import re

from pydantic import ValidationError

from app.schemas.document import InvoiceData
from app.services.rag_services import RAGService


class InvoiceService:
    """
    Extract structured invoice information from
    an already indexed document.

    Responsibilities:
    - Retrieve normalized document text
    - Use the LLM for semantic invoice extraction
    - Validate the generated structure with Pydantic
    - Reconcile safe arithmetic deterministically
    """

    # =========================================================
    # PUBLIC EXTRACTION METHOD
    # =========================================================

    @staticmethod
    async def extract_invoice(
        document_id: str,
    ) -> InvoiceData:
        """
        Extract and validate structured invoice data
        from an indexed document.
        """

        # =====================================================
        # GET DOCUMENT TEXT
        # =====================================================

        document_text = RAGService.get_document_text(
            document_id
        )

        if not document_text.strip():
            raise ValueError(
                "Document contains no usable text."
            )

        print(
            "INVOICE DOCUMENT LENGTH:",
            len(document_text),
            "characters",
        )

        # =====================================================
        # PROMPT
        # =====================================================

        prompt = f"""
You are an invoice information extraction system.

Analyze the invoice text below and extract structured
invoice information.

Return ONLY valid JSON.

Do not include:
- Markdown
- Code fences
- Explanations
- Introductory text
- Comments

Use exactly this JSON structure:

{{
  "vendor": null,
  "customer": null,
  "invoice_number": null,
  "invoice_date": null,
  "due_date": null,
  "currency": null,
  "subtotal": null,
  "tax": null,
  "total": null,
  "line_items": [
    {{
      "description": null,
      "quantity": null,
      "unit_price": null,
      "amount": null
    }}
  ]
}}

Rules:

- Use only information present in the document.
- Never invent missing values.
- If a field cannot be determined, return null.
- Monetary values must be numbers only.
- Do not include currency symbols in monetary values.
- quantity must be numeric when available.
- Preserve invoice numbers exactly as written.
- Extract all clearly identifiable line items.
- If there are no identifiable line items, return [].
- vendor means the entity issuing the invoice.
- customer means the entity being billed.
- subtotal means the amount before tax and final adjustments.
- tax means the monetary tax amount, NOT the tax percentage.
- total means the final invoice amount payable.
- currency should preferably use a currency code such as
  INR, USD, EUR, or GBP.
- A spreadsheet formula beginning with "=" is a formula,
  not a monetary value.
- When quantity and unit price are clearly available,
  use them to understand the corresponding line-item amount.
- Ignore obvious OCR noise, decorative text, and
  unrelated headers.

INVOICE TEXT:

{document_text}

JSON:
"""

        # =====================================================
        # OLLAMA
        # =====================================================

        raw_response = await RAGService.generate_text(
            prompt,
            num_predict=1000,
        )

        print(
            "RAW INVOICE EXTRACTION:",
            raw_response,
        )

        # =====================================================
        # CLEAN OUTPUT
        # =====================================================

        cleaned_response = (
            InvoiceService._clean_json_response(
                raw_response
            )
        )

        # =====================================================
        # PARSE JSON
        # =====================================================

        try:
            invoice_json = json.loads(
                cleaned_response
            )

        except json.JSONDecodeError as exc:
            raise ValueError(
                "AI returned invalid invoice JSON."
            ) from exc

        # =====================================================
        # PYDANTIC VALIDATION
        # =====================================================

        try:
            invoice = InvoiceData.model_validate(
                invoice_json
            )

        except ValidationError as exc:
            raise ValueError(
                "AI returned invoice data "
                "in an invalid format."
            ) from exc

        # =====================================================
        # DETERMINISTIC RECONCILIATION
        # =====================================================

        invoice = InvoiceService._reconcile_invoice(
            invoice=invoice,
            document_text=document_text,
        )

        return invoice

    # =========================================================
    # JSON CLEANING
    # =========================================================

    @staticmethod
    def _clean_json_response(
        raw_response: str,
    ) -> str:
        """
        Remove accidental Markdown fences and isolate
        the JSON object when possible.
        """

        cleaned = raw_response.strip()

        if cleaned.startswith("```"):
            cleaned = (
                cleaned
                .removeprefix("```json")
                .removeprefix("```JSON")
                .removeprefix("```")
                .strip()
            )

            if cleaned.endswith("```"):
                cleaned = cleaned[:-3].strip()

        # Defensive handling if the model adds
        # a small amount of text around the JSON.
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")

        if (
            first_brace != -1
            and last_brace != -1
            and last_brace > first_brace
        ):
            cleaned = cleaned[
                first_brace:
                last_brace + 1
            ]

        return cleaned

    # =========================================================
    # NUMBER HELPERS
    # =========================================================

    @staticmethod
    def _round_money(
        value: float,
    ) -> float:
        """
        Normalize monetary arithmetic to two decimals.
        """

        return round(
            float(value),
            2,
        )

    # =========================================================
    # TAX RATE EXTRACTION
    # =========================================================

    @staticmethod
    def _extract_tax_rate(
        document_text: str,
    ) -> float | None:
        """
        Extract an explicitly stated tax/GST/VAT rate
        from normalized document text.

        Returns the rate as a decimal:
        18% -> 0.18
        0.18 -> 0.18
        """

        patterns = [
            # GST Rate | 0.18
            # Tax Rate: 0.18
            # VAT Rate = 0.20
            r"""
            (?ix)
            \b(?:gst|tax|vat)
            \s*rate
            \s*(?:\||:|=)?
            \s*
            ([0-9]+(?:\.[0-9]+)?)
            \s*%?
            """,

            # GST (18%)
            # VAT (20%)
            r"""
            (?ix)
            \b(?:gst|tax|vat)
            \s*
            \(
            \s*
            ([0-9]+(?:\.[0-9]+)?)
            \s*%
            \s*
            \)
            """,

            # GST 18%
            # Tax 18%
            r"""
            (?ix)
            \b(?:gst|tax|vat)
            \s+
            ([0-9]+(?:\.[0-9]+)?)
            \s*%
            """,
        ]

        for pattern in patterns:
            match = re.search(
                pattern,
                document_text,
            )

            if not match:
                continue

            try:
                rate = float(
                    match.group(1)
                )

            except ValueError:
                continue

            # Example:
            # 18 -> 0.18
            if rate > 1:
                rate /= 100

            # Reject obviously invalid rates.
            if 0 <= rate <= 1:
                return rate

        return None

    # =========================================================
    # SIMPLE INVOICE CHECK
    # =========================================================

    @staticmethod
    def _has_complex_adjustments(
        document_text: str,
    ) -> bool:
        """
        Detect adjustments that make subtotal + tax
        insufficient for safely calculating final total.

        This is deliberately conservative.
        """

        adjustment_terms = [
            "discount",
            "shipping",
            "freight",
            "delivery charge",
            "service charge",
            "withholding",
            "withholding tax",
            "tds",
            "credit",
            "credit note",
            "round off",
            "rounding adjustment",
            "surcharge",
        ]

        lowered_text = (
            document_text.lower()
        )

        return any(
            term in lowered_text
            for term in adjustment_terms
        )

    # =========================================================
    # RECONCILIATION
    # =========================================================

    @staticmethod
    def _reconcile_invoice(
        invoice: InvoiceData,
        document_text: str,
    ) -> InvoiceData:
        """
        Reconcile arithmetic that can be determined
        safely from extracted invoice data.

        Important:
        AI is used for semantic understanding.
        Python is used for deterministic arithmetic.
        """

        # =====================================================
        # LINE ITEMS
        # =====================================================

        for item in invoice.line_items:

            if (
                item.quantity is not None
                and item.unit_price is not None
            ):
                calculated_amount = (
                    InvoiceService._round_money(
                        item.quantity
                        * item.unit_price
                    )
                )

                # Quantity * unit price is deterministic
                # for the simple line-item schema we use.
                if (
                    item.amount is None
                    or abs(
                        item.amount
                        - calculated_amount
                    ) > 0.01
                ):
                    print(
                        "CORRECTING LINE ITEM AMOUNT:",
                        item.description,
                        item.amount,
                        "->",
                        calculated_amount,
                    )

                    item.amount = (
                        calculated_amount
                    )

        # =====================================================
        # SUBTOTAL
        # =====================================================

        amounts = [
            item.amount
            for item in invoice.line_items
            if item.amount is not None
        ]

        all_items_have_amount = (
            bool(invoice.line_items)
            and len(amounts)
            == len(invoice.line_items)
        )

        if all_items_have_amount:
            calculated_subtotal = (
                InvoiceService._round_money(
                    sum(amounts)
                )
            )

            if (
                invoice.subtotal is None
                or abs(
                    invoice.subtotal
                    - calculated_subtotal
                ) > 0.01
            ):
                print(
                    "CORRECTING SUBTOTAL:",
                    invoice.subtotal,
                    "->",
                    calculated_subtotal,
                )

                invoice.subtotal = (
                    calculated_subtotal
                )

        # =====================================================
        # TAX
        # =====================================================

        tax_rate = (
            InvoiceService._extract_tax_rate(
                document_text
            )
        )

        has_complex_adjustments = (
            InvoiceService
            ._has_complex_adjustments(
                document_text
            )
        )

        if (
            invoice.subtotal is not None
            and tax_rate is not None
            and not has_complex_adjustments
        ):
            calculated_tax = (
                InvoiceService._round_money(
                    invoice.subtotal
                    * tax_rate
                )
            )

            if (
                invoice.tax is None
                or abs(
                    invoice.tax
                    - calculated_tax
                ) > 0.01
            ):
                print(
                    "CORRECTING TAX:",
                    invoice.tax,
                    "->",
                    calculated_tax,
                    f"(rate={tax_rate})",
                )

                invoice.tax = calculated_tax

        # =====================================================
        # TOTAL
        # =====================================================

        if (
            invoice.subtotal is not None
            and invoice.tax is not None
            and not has_complex_adjustments
        ):
            calculated_total = (
                InvoiceService._round_money(
                    invoice.subtotal
                    + invoice.tax
                )
            )

            if (
                invoice.total is None
                or abs(
                    invoice.total
                    - calculated_total
                ) > 0.01
            ):
                print(
                    "CORRECTING TOTAL:",
                    invoice.total,
                    "->",
                    calculated_total,
                )

                invoice.total = (
                    calculated_total
                )

        return invoice