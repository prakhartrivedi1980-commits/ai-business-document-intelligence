import json

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
    - Validate output with Pydantic
    - Reconcile safe financial arithmetic
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
  "taxes": [
    {{
      "name": null,
      "rate": null,
      "amount": null
    }}
  ],
  "discount": null,
  "shipping": null,
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

GENERAL:
- Use only information present in the document.
- Never invent missing information.
- If a scalar field cannot be determined, return null.
- If there are no taxes, return "taxes": [].
- If there are no identifiable line items,
  return "line_items": [].
- Return numbers as JSON numbers, not strings.
- Do not include currency symbols inside numeric values.
- Ignore obvious OCR noise and decorative text.

PARTIES:
- vendor means the company or person issuing the invoice.
- customer means the company or person being billed.

IDENTIFIERS:
- Preserve invoice numbers exactly as written.
- Preserve dates as written when possible.

CURRENCY:
- Prefer standard codes such as INR, USD, EUR, GBP
  when the currency can be determined.

LINE ITEMS:
- Extract every clearly identifiable product or service.
- quantity is the purchased quantity when available.
- unit_price is the price per unit.
- amount is the line total.
- A spreadsheet formula beginning with "=" is a formula,
  not a literal monetary value.
- When quantity and unit price are available, use them
  to understand the corresponding line amount.

SUBTOTAL:
- subtotal is the amount before taxes and later
  invoice-level adjustments.
- Do not treat tax, shipping, discount, or final total
  as line items.

TAXES:
- Extract each distinct tax separately.
- Examples include GST, CGST, SGST, IGST, VAT,
  sales tax, and service tax.
- "rate" must be the percentage number.
- Example: 18% must be returned as 18, not 0.18.
- Example: 9% must be returned as 9.
- If the document contains "GST Rate | 0.18",
  understand that as 18 percent.
- "amount" is the monetary amount of that tax.
- Do not combine CGST and SGST into one tax when
  they are listed separately.

ADJUSTMENTS:
- discount is the invoice-level discount amount.
- shipping is the invoice-level shipping/freight/
  delivery amount when clearly identifiable.
- If no discount or shipping is present, return null.

TOTAL:
- total is the final invoice amount payable.
- Do not invent a total from incomplete information.

INVOICE TEXT:

{document_text}

JSON:
"""

        # =====================================================
        # OLLAMA
        # =====================================================

        raw_response = await RAGService.generate_text(
            prompt,
            num_predict=1400,
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
            print(
                "INVOICE VALIDATION ERROR:",
                exc,
            )

            raise ValueError(
                "AI returned invoice data "
                "in an invalid format."
            ) from exc

        # =====================================================
        # DETERMINISTIC RECONCILIATION
        # =====================================================

        return InvoiceService._reconcile_invoice(
            invoice
        )

    # =========================================================
    # JSON CLEANING
    # =========================================================

    @staticmethod
    def _clean_json_response(
        raw_response: str,
    ) -> str:
        """
        Remove accidental Markdown fences and isolate
        the JSON object.
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
                cleaned = (
                    cleaned[:-3]
                    .strip()
                )

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
    # MONEY HELPER
    # =========================================================

    @staticmethod
    def _round_money(
        value: float,
    ) -> float:
        """
        Round monetary values consistently.
        """

        return round(
            float(value),
            2,
        )

    # =========================================================
    # RATE NORMALIZATION
    # =========================================================

    @staticmethod
    def _normalize_tax_rate(
        rate: float | None,
    ) -> float | None:
        """
        Normalize tax rates to percentage representation.

        Examples:
        18   -> 18
        9    -> 9
        0.18 -> 18
        0.09 -> 9
        """

        if rate is None:
            return None

        rate = float(rate)

        if rate < 0:
            return None

        if 0 < rate <= 1:
            rate *= 100

        return round(
            rate,
            4,
        )

    # =========================================================
    # LINE ITEM RECONCILIATION
    # =========================================================

    @staticmethod
    def _reconcile_line_items(
        invoice: InvoiceData,
    ) -> None:
        """
        Correct line-item arithmetic when quantity
        and unit price are both available.

        quantity * unit_price is deterministic for
        the current invoice schema.
        """

        for item in invoice.line_items:

            if (
                item.quantity is None
                or item.unit_price is None
            ):
                continue

            calculated_amount = (
                InvoiceService._round_money(
                    item.quantity
                    * item.unit_price
                )
            )

            if (
                item.amount is None
                or abs(
                    item.amount
                    - calculated_amount
                ) > 0.01
            ):
                print(
                    "CORRECTING LINE ITEM:",
                    item.description,
                    item.amount,
                    "->",
                    calculated_amount,
                )

                item.amount = calculated_amount

    # =========================================================
    # SUBTOTAL RECONCILIATION
    # =========================================================

    @staticmethod
    def _reconcile_subtotal(
        invoice: InvoiceData,
    ) -> None:
        """
        Calculate subtotal when every extracted line item
        has a usable amount.

        This avoids trusting LLM arithmetic when the
        underlying item values are complete.
        """

        if not invoice.line_items:
            return

        amounts = [
            item.amount
            for item in invoice.line_items
        ]

        if any(
            amount is None
            for amount in amounts
        ):
            return

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

    # =========================================================
    # TAX RECONCILIATION
    # =========================================================

    @staticmethod
    def _reconcile_taxes(
        invoice: InvoiceData,
    ) -> None:
        """
        Normalize tax rates and calculate individual
        tax amounts when both subtotal and rate exist.

        Each tax is handled independently, allowing:
        - GST
        - CGST + SGST
        - IGST
        - VAT
        - other percentage taxes
        """

        for tax in invoice.taxes:

            normalized_rate = (
                InvoiceService._normalize_tax_rate(
                    tax.rate
                )
            )

            tax.rate = normalized_rate

            if (
                invoice.subtotal is None
                or normalized_rate is None
            ):
                continue

            calculated_tax = (
                InvoiceService._round_money(
                    invoice.subtotal
                    * (
                        normalized_rate
                        / 100
                    )
                )
            )

            if (
                tax.amount is None
                or abs(
                    tax.amount
                    - calculated_tax
                ) > 0.01
            ):
                print(
                    "CORRECTING TAX:",
                    tax.name,
                    tax.amount,
                    "->",
                    calculated_tax,
                    f"({normalized_rate}%)",
                )

                tax.amount = calculated_tax

    # =========================================================
    # TOTAL RECONCILIATION
    # =========================================================

    @staticmethod
    def _reconcile_total(
        invoice: InvoiceData,
    ) -> None:
        """
        Calculate total only when all required components
        are sufficiently known.

        Formula:

        subtotal
        - discount
        + shipping
        + taxes
        = total

        Missing discount/shipping are treated as zero only
        because null represents that no such adjustment was
        identified by the extraction stage.

        Tax calculation is performed only when every tax
        component has an amount.
        """

        if invoice.subtotal is None:
            return

        # -----------------------------------------------------
        # TAX TOTAL
        # -----------------------------------------------------

        if invoice.taxes:

            tax_amounts = [
                tax.amount
                for tax in invoice.taxes
            ]

            if any(
                amount is None
                for amount in tax_amounts
            ):
                # We don't know enough to safely
                # reconstruct the final total.
                return

            total_tax = sum(
                tax_amounts
            )

        else:
            total_tax = 0.0

        # -----------------------------------------------------
        # ADJUSTMENTS
        # -----------------------------------------------------

        discount = (
            invoice.discount
            if invoice.discount is not None
            else 0.0
        )

        shipping = (
            invoice.shipping
            if invoice.shipping is not None
            else 0.0
        )

        # -----------------------------------------------------
        # TOTAL
        # -----------------------------------------------------

        calculated_total = (
            InvoiceService._round_money(
                invoice.subtotal
                - discount
                + shipping
                + total_tax
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

            invoice.total = calculated_total

    # =========================================================
    # FULL RECONCILIATION
    # =========================================================

    @staticmethod
    def _reconcile_invoice(
        invoice: InvoiceData,
    ) -> InvoiceData:
        """
        Perform deterministic financial reconciliation
        after semantic extraction.

        AI:
        - understands invoice meaning
        - identifies fields
        - identifies taxes and adjustments

        Python:
        - performs arithmetic
        - corrects inconsistent calculated values
        """

        # 1. Line amounts
        InvoiceService._reconcile_line_items(
            invoice
        )

        # 2. Subtotal
        InvoiceService._reconcile_subtotal(
            invoice
        )

        # 3. Individual taxes
        InvoiceService._reconcile_taxes(
            invoice
        )

        # 4. Final total
        InvoiceService._reconcile_total(
            invoice
        )

        return invoice