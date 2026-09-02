import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileText,
  ReceiptText,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";

import { motion } from "motion/react";

import "./Invoice.css";


function Invoice({
  invoice,
  invoiceLoading,
  handleExtractInvoice,
}) {

  // =========================================================
  // MONEY FORMATTER
  // =========================================================

  const formatMoney = (
    value,
    currency = "INR"
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    try {
      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency:
            currency || "INR",
          maximumFractionDigits: 2,
        }
      ).format(value);

    } catch {
      return `${currency || ""} ${value}`;
    }
  };


  // =========================================================
  // LOADING STATE
  // =========================================================

  if (invoiceLoading) {
    return (
      <motion.section
        className="invoice-card"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >
        <div className="invoice-card__loading">

          <div className="invoice-card__loading-icon">
            <ReceiptText size={22} />
          </div>

          <div>
            <span>
              INVOICE INTELLIGENCE
            </span>

            <h3>
              Extracting structured invoice data
            </h3>

            <p>
              Identifying parties, line items,
              taxes and financial totals...
            </p>
          </div>

          <div className="invoice-card__spinner" />

        </div>


        <div className="invoice-skeleton">

          <div className="invoice-skeleton__row">
            <span />
            <span />
            <span />
          </div>

          <div className="invoice-skeleton__row">
            <span />
            <span />
          </div>

          <div className="invoice-skeleton__table">
            <span />
            <span />
            <span />
          </div>

        </div>

      </motion.section>
    );
  }


  // =========================================================
  // NO RESULT
  // =========================================================

  if (!invoice) {
    return null;
  }


  const currency =
    invoice.currency || "INR";

  const taxes =
    invoice.taxes || [];

  const lineItems =
    invoice.line_items || [];

  const totalTax = taxes.reduce(
    (sum, tax) =>
      sum + (tax.amount || 0),
    0
  );


  // =========================================================
  // UI
  // =========================================================

  return (
    <motion.section
      className="invoice-card"
      initial={{
        opacity: 0,
        y: 22,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="invoice-card__header">

        <div className="invoice-card__heading">

          <div className="invoice-card__heading-icon">
            <ReceiptText size={20} />
          </div>


          <div>
            <span>
              INVOICE INTELLIGENCE
            </span>

            <h3>
              Structured invoice data
            </h3>

            <p>
              Financial information extracted and
              reconciled from your document.
            </p>
          </div>

        </div>


        <button
          type="button"
          className="invoice-card__regenerate"
          onClick={handleExtractInvoice}
        >
          <RefreshCw size={14} />

          Re-extract
        </button>

      </div>


      {/* =====================================================
          INVOICE IDENTITY
      ====================================================== */}

      <div className="invoice-identity">

        <div className="invoice-identity__item">

          <div className="invoice-identity__icon">
            <Building2 size={17} />
          </div>

          <div>
            <span>
              VENDOR
            </span>

            <strong>
              {invoice.vendor || "Not identified"}
            </strong>
          </div>

        </div>


        <div className="invoice-identity__item">

          <div className="invoice-identity__icon">
            <UserRound size={17} />
          </div>

          <div>
            <span>
              CUSTOMER
            </span>

            <strong>
              {invoice.customer || "Not identified"}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          INVOICE DETAILS
      ====================================================== */}

      <div className="invoice-details">

        <div className="invoice-detail">

          <FileText size={15} />

          <div>
            <span>
              INVOICE NUMBER
            </span>

            <strong>
              {invoice.invoice_number || "—"}
            </strong>
          </div>

        </div>


        <div className="invoice-detail">

          <CalendarDays size={15} />

          <div>
            <span>
              INVOICE DATE
            </span>

            <strong>
              {invoice.invoice_date || "—"}
            </strong>
          </div>

        </div>


        <div className="invoice-detail">

          <CalendarDays size={15} />

          <div>
            <span>
              DUE DATE
            </span>

            <strong>
              {invoice.due_date || "—"}
            </strong>
          </div>

        </div>


        <div className="invoice-detail">

          <CreditCard size={15} />

          <div>
            <span>
              CURRENCY
            </span>

            <strong>
              {currency}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          FINANCIAL SUMMARY
      ====================================================== */}

      <div className="invoice-financial">

        <div className="invoice-financial__heading">

          <div>
            <Sparkles size={14} />

            FINANCIAL SUMMARY
          </div>

          <span>
            Reconciled
          </span>

        </div>


        <div className="invoice-financial__grid">

          <div className="invoice-stat">

            <span>
              Subtotal
            </span>

            <strong>
              {formatMoney(
                invoice.subtotal,
                currency
              )}
            </strong>

          </div>


          <div className="invoice-stat">

            <span>
              Taxes
            </span>

            <strong>
              {formatMoney(
                totalTax,
                currency
              )}
            </strong>

          </div>


          <div className="invoice-stat">

            <span>
              Discount
            </span>

            <strong>
              {invoice.discount !== null &&
              invoice.discount !== undefined
                ? formatMoney(
                    invoice.discount,
                    currency
                  )
                : "—"}
            </strong>

          </div>


          <div className="invoice-stat">

            <span>
              Shipping
            </span>

            <strong>
              {invoice.shipping !== null &&
              invoice.shipping !== undefined
                ? formatMoney(
                    invoice.shipping,
                    currency
                  )
                : "—"}
            </strong>

          </div>


          <div className="invoice-stat invoice-stat--total">

            <div>
              <CircleDollarSign size={17} />

              <span>
                TOTAL
              </span>
            </div>

            <strong>
              {formatMoney(
                invoice.total,
                currency
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          TAX BREAKDOWN
      ====================================================== */}

      {taxes.length > 0 && (
        <div className="invoice-taxes">

          <div className="invoice-section-title">
            <span>
              TAX BREAKDOWN
            </span>

            <strong>
              {taxes.length}{" "}
              {taxes.length === 1
                ? "component"
                : "components"}
            </strong>
          </div>


          <div className="invoice-taxes__list">

            {taxes.map(
              (tax, index) => (
                <div
                  className="invoice-tax"
                  key={`${tax.name}-${index}`}
                >

                  <div>

                    <strong>
                      {tax.name || "Tax"}
                    </strong>

                    <span>
                      {tax.rate !== null &&
                      tax.rate !== undefined
                        ? `${tax.rate}%`
                        : "Rate unavailable"}
                    </span>

                  </div>


                  <strong>
                    {formatMoney(
                      tax.amount,
                      currency
                    )}
                  </strong>

                </div>
              )
            )}

          </div>

        </div>
      )}


      {/* =====================================================
          LINE ITEMS
      ====================================================== */}

      <div className="invoice-items">

        <div className="invoice-section-title">

          <span>
            LINE ITEMS
          </span>

          <strong>
            {lineItems.length}{" "}
            {lineItems.length === 1
              ? "item"
              : "items"}
          </strong>

        </div>


        {lineItems.length > 0 ? (

          <div className="invoice-table-wrapper">

            <table className="invoice-table">

              <thead>
                <tr>
                  <th>
                    Description
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Unit price
                  </th>

                  <th>
                    Amount
                  </th>
                </tr>
              </thead>


              <tbody>

                {lineItems.map(
                  (item, index) => (
                    <tr key={index}>

                      <td>
                        {item.description || "—"}
                      </td>

                      <td>
                        {item.quantity ?? "—"}
                      </td>

                      <td>
                        {formatMoney(
                          item.unit_price,
                          currency
                        )}
                      </td>

                      <td>
                        {formatMoney(
                          item.amount,
                          currency
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="invoice-items__empty">
            No identifiable line items were found.
          </div>

        )}

      </div>

    </motion.section>
  );
}


export default Invoice;