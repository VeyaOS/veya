import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./PaymentPortal.css";

function PaymentPortal() {
  const { invoiceNum } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, confirmed, expired
  const [timeLeft, setTimeLeft] = useState(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(true);

  // Fetch invoice data
  useEffect(() => {
    fetchInvoice();
  }, [invoiceNum]);

  // Poll for payment status every 5 seconds
  useEffect(() => {
    if (!polling || paymentStatus !== "pending") return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [polling, paymentStatus, invoiceNum]);

  // Countdown timer
  useEffect(() => {
    if (!invoice?.expiresAt) return;

    const updateTimer = () => {
      const expiry = new Date(invoice.expiresAt);
      const now = new Date();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft(0);
        setPaymentStatus("expired");
        setPolling(false);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [invoice]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/public/${invoiceNum}`);
      setInvoice(response.data);

      // Check if already paid
      if (response.data.status === "PAID") {
        setPaymentStatus("confirmed");
        setPolling(false);
      } else if (response.data.status === "EXPIRED") {
        setPaymentStatus("expired");
        setPolling(false);
      }
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      setError("Invoice not found or has been removed");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/invoices/public/${invoiceNum}`);
      if (response.data.status === "PAID") {
        setPaymentStatus("confirmed");
        setPolling(false);
      } else if (response.data.status === "EXPIRED") {
        setPaymentStatus("expired");
        setPolling(false);
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
    }
  };

  const handleCopyAddress = () => {
    if (invoice?.paymentAddress) {
      navigator.clipboard.writeText(invoice.paymentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestNew = () => {
    // TODO: Notify merchant to create new invoice
    alert(
      "Your merchant has been notified. They will send you a new invoice shortly.",
    );
  };

  const formatTime = () => {
    if (!timeLeft) return "";
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }
    if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }
    return `${timeLeft.seconds}s`;
  };

  const getTimerColor = () => {
    if (!timeLeft) return "var(--text3)";
    const totalSeconds =
      timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
    if (totalSeconds < 300) return "var(--red)";
    if (totalSeconds < 1800) return "var(--gold)";
    return "var(--text3)";
  };

  const getTimerPercentage = () => {
    if (!invoice?.expiresAt) return 100;
    const expiry = new Date(invoice.expiresAt);
    const now = new Date();
    const total = expiry - new Date(invoice.createdAt);
    const remaining = expiry - now;
    return (remaining / total) * 100;
  };

  if (loading) {
    return (
      <div className="payment-portal">
        <div className="payment-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading invoice details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="payment-portal">
        <div className="payment-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Invoice Not Found</h2>
            <p>{error || "This invoice may have expired or been removed."}</p>
            <button
              className="portal-btn portal-btn-primary"
              onClick={() => navigate("/")}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PENDING STATE
  if (paymentStatus === "pending") {
    return (
      <div className="payment-portal">
        <div className="payment-container">
          {/* Merchant Info */}
          <div className="merchant-info">
            <div className="merchant-avatar">
              {invoice.merchant?.storeName?.charAt(0) || "V"}
            </div>
            <div>
              <h1 className="merchant-name">
                {invoice.merchant?.storeName || "Merchant"}
              </h1>
              <div className="merchant-verified">
                <span className="verified-badge">✓ Verified Merchant</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="amount-section">
            <div className="amount-label">Amount to Pay</div>
            <div className="amount-value">
              {invoice.amount.toLocaleString()}{" "}
              <span className="amount-currency">USDT</span>
            </div>
            <div className="amount-fee">
              No additional fees • Settled via RGB Protocol
            </div>
          </div>

          {/* Invoice Details */}
          <div className="invoice-details">
            <div className="detail-row">
              <span className="detail-label">Invoice #</span>
              <span className="detail-value">{invoice.invoiceNum}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Reference</span>
              <span className="detail-value">{invoice.reference}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Customer</span>
              <span className="detail-value">
                {invoice.customer?.name || "—"}
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="timer-section">
            <div className="timer-label">
              <span>⏱️ Time remaining to pay</span>
              {timeLeft && timeLeft.minutes < 5 && timeLeft.minutes > 0 && (
                <span className="timer-urgent">Hurry up!</span>
              )}
            </div>
            <div className="timer-value" style={{ color: getTimerColor() }}>
              {formatTime()}
            </div>
            <div className="timer-bar">
              <div
                className="timer-bar-fill"
                style={{
                  width: `${getTimerPercentage()}%`,
                  background: getTimerColor(),
                }}
              />
            </div>
          </div>

          {/* QR Code */}
          <div className="qr-section">
            <div className="qr-label">Scan to Pay with RGB Wallet</div>
            <div className="qr-code">
              {invoice.paymentAddress ? (
                <div className="qr-placeholder">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <rect width="160" height="160" fill="#111114" rx="8" />
                    <rect
                      x="20"
                      y="20"
                      width="120"
                      height="120"
                      fill="#f0ede8"
                      rx="4"
                    />
                    {/* QR Pattern Simulation */}
                    <rect x="30" y="30" width="20" height="20" fill="#0a0a0b" />
                    <rect x="60" y="30" width="20" height="20" fill="#0a0a0b" />
                    <rect x="90" y="30" width="20" height="20" fill="#0a0a0b" />
                    <rect x="30" y="60" width="20" height="20" fill="#0a0a0b" />
                    <rect x="90" y="60" width="20" height="20" fill="#0a0a0b" />
                    <rect x="30" y="90" width="20" height="20" fill="#0a0a0b" />
                    <rect x="60" y="90" width="20" height="20" fill="#0a0a0b" />
                    <rect x="90" y="90" width="20" height="20" fill="#0a0a0b" />
                    <rect
                      x="110"
                      y="110"
                      width="20"
                      height="20"
                      fill="#0a0a0b"
                    />
                  </svg>
                </div>
              ) : (
                <div className="qr-loading">Loading QR...</div>
              )}
            </div>

            {/* Payment Address */}
            <div className="address-section">
              <div className="address-label">Payment Address (RGB)</div>
              <div className="address-value">
                <code className="address-code">
                  {invoice.paymentAddress
                    ? `${invoice.paymentAddress.slice(0, 20)}...${invoice.paymentAddress.slice(-8)}`
                    : "Loading..."}
                </code>
                <button
                  className="copy-btn"
                  onClick={handleCopyAddress}
                  disabled={!invoice.paymentAddress}
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Options */}
          <div className="wallet-options">
            <div className="wallet-label">Need a wallet to pay?</div>
            <div className="wallet-buttons">
              <button
                className="wallet-btn"
                onClick={() => window.open("https://iriswallet.com", "_blank")}
              >
                Iris Wallet
              </button>
              <button
                className="wallet-btn"
                onClick={() => window.open("https://bitmask.app", "_blank")}
              >
                BitMask
              </button>
              <button
                className="wallet-btn"
                onClick={() => window.open("https://utexo.io", "_blank")}
              >
                UTEXO Wallet
              </button>
            </div>
          </div>

          {/* Payment Detector */}
          <div className="detector-section">
            <div className="detector-spinner"></div>
            <p>Waiting for payment confirmation...</p>
            <p className="detector-note">
              Payment will be confirmed within seconds after sending
            </p>
          </div>

          {/* Powered By */}
          <div className="powered-by">
            Powered by <strong>UTEXO</strong> · RGB Protocol · Bitcoin
          </div>
        </div>
      </div>
    );
  }

  // CONFIRMED STATE
  if (paymentStatus === "confirmed") {
    return (
      <div className="payment-portal">
        <div className="payment-container confirmed">
          <div className="success-animation">
            <div className="success-circle">
              <div className="success-check">✓</div>
            </div>
          </div>

          <h1 className="success-title">Payment Confirmed!</h1>
          <p className="success-subtitle">
            Your payment has been received and verified on-chain
          </p>

          <div className="confirmed-details">
            <div className="detail-row">
              <span className="detail-label">Amount Paid</span>
              <span className="detail-value success-amount">
                {invoice.amount.toLocaleString()} USDT
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Transaction ID</span>
              <span className="detail-value tx-hash">
                {invoice.txHash
                  ? `${invoice.txHash.slice(0, 16)}...${invoice.txHash.slice(-8)}`
                  : "Processing..."}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Merchant</span>
              <span className="detail-value">
                {invoice.merchant?.storeName}
              </span>
            </div>
          </div>

          <div className="confirmed-actions">
            <button
              className="portal-btn portal-btn-primary"
              onClick={() => window.print()}
            >
              📄 Download Receipt
            </button>
            <button
              className="portal-btn portal-btn-secondary"
              onClick={() => window.close()}
            >
              Close Window
            </button>
          </div>

          <div className="powered-by">
            Powered by <strong>UTEXO</strong> · RGB Protocol · Bitcoin
          </div>
        </div>
      </div>
    );
  }

  // EXPIRED STATE
  if (paymentStatus === "expired") {
    return (
      <div className="payment-portal">
        <div className="payment-container expired">
          <div className="expired-icon">⏰</div>

          <h1 className="expired-title">Invoice Expired</h1>
          <p className="expired-subtitle">
            This invoice was not paid in time and is no longer valid.
          </p>

          <div className="expired-details">
            <div className="detail-row">
              <span className="detail-label">Invoice #</span>
              <span className="detail-value">{invoice.invoiceNum}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount</span>
              <span className="detail-value">
                {invoice.amount.toLocaleString()} USDT
              </span>
            </div>
          </div>

          <div className="expired-actions">
            <button
              className="portal-btn portal-btn-primary"
              onClick={handleRequestNew}
            >
              Request New Invoice
            </button>
            <button
              className="portal-btn portal-btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>

          <div className="powered-by">
            Powered by <strong>UTEXO</strong> · RGB Protocol · Bitcoin
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PaymentPortal;
