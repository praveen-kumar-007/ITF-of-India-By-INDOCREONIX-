import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./Donate.css";

const API_BASE = import.meta.env.VITE_API_URL || "";
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];

const Donate = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    transactionId: "",
  });
  const [paymentSettings, setPaymentSettings] = useState({
    upiId: "",
    merchantName: "",
    amount: "500",
  });
  const [selectedAmount, setSelectedAmount] = useState("500");
  const [amountMode, setAmountMode] = useState("quick");
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings/payment`);
      const result = await response.json();
      if (result.success && result.data) {
        const settings = {
          upiId: result.data.upiId || "",
          merchantName: result.data.merchantName || "ITF OF INDIA",
          amount: String(result.data.amount || "500"),
        };
        setPaymentSettings(settings);
        setSelectedAmount(
          QUICK_AMOUNTS.includes(Number(settings.amount))
            ? String(settings.amount)
            : "500",
        );
      }
    } catch (err) {
      console.error("Failed to fetch payment settings", err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAmountSelect = (amount) => {
    setAmountMode("quick");
    setSelectedAmount(String(amount));
  };

  const handleCustomAmount = (e) => {
    setAmountMode("custom");
    setSelectedAmount(e.target.value);
  };

  const numericAmount = Number(selectedAmount);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  const upiPayload = useMemo(() => {
    if (!paymentSettings.upiId || !validAmount) return "";
    const merchant = encodeURIComponent(
      paymentSettings.merchantName || "ITF OF INDIA",
    );
    return `upi://pay?pa=${paymentSettings.upiId}&pn=${merchant}&am=${numericAmount}&cu=INR`;
  }, [
    paymentSettings.upiId,
    paymentSettings.merchantName,
    numericAmount,
    validAmount,
  ]);

  const handleDonate = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validAmount) return setError("Please enter a valid amount");
    if (!paymentSettings.upiId)
      return setError(
        "Payment gateway is not configured. Please try again later.",
      );
    if (!form.name.trim()) return setError("Name is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Please enter a valid email address");
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      return setError("Please enter a valid 10-digit mobile number");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: numericAmount,
          paymentMethod: "UPI_QR_DYNAMIC",
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Donation failed");
      setReceipt(json.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    const donorName =
      receipt.name && receipt.name.trim() ? receipt.name : "Supporter";
    return (
      <div className="donation-confirm">
        <div className="donation-confirm-card">
          <div className="confirm-header">
            <h2>Thanks for your payment</h2>
            <span className="verification-badge">Under Verification</span>
          </div>

          <p className="confirm-subtitle">
            Your contribution has been received and is currently under
            verification by our team.
          </p>

          <div className="confirm-details-grid">
            <div className="detail-item">
              <label>Name</label>
              <strong>{donorName}</strong>
            </div>
            <div className="detail-item">
              <label>Amount</label>
              <strong>Rs. {receipt.amount}</strong>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <strong>{receipt.email}</strong>
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <strong>{receipt.phone}</strong>
            </div>
            <div className="detail-item wide">
              <label>Transaction / UTR</label>
              <strong>{receipt.transactionId || "Not provided"}</strong>
            </div>
            <div className="detail-item wide">
              <label>Submitted On</label>
              <strong>{new Date(receipt.createdAt).toLocaleString()}</strong>
            </div>
          </div>

          <blockquote className="donation-quote">
            "No one has ever become poor by giving. Every contribution creates
            hope."
          </blockquote>

          <button
            type="button"
            className="btn-donate-more"
            onClick={() => {
              setReceipt(null);
              setError(null);
              setForm({ name: "", email: "", phone: "", transactionId: "" });
              setAmountMode("quick");
              setSelectedAmount("500");
            }}
          >
            Donate More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-page">
      <div className="donation-card">
        <h2>Support ITF of India</h2>
        <p>
          Use the same UPI used for player registration. Select amount to
          generate QR instantly.
        </p>

        <div className="quick-amounts">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              type="button"
              key={amt}
              className={`amount-chip ${amountMode === "quick" && selectedAmount === String(amt) ? "active" : ""}`}
              onClick={() => handleAmountSelect(amt)}
            >
              ₹{amt}
            </button>
          ))}
          <button
            type="button"
            className={`amount-chip ${amountMode === "custom" ? "active" : ""}`}
            onClick={() => setAmountMode("custom")}
          >
            Other
          </button>
        </div>

        {amountMode === "custom" && (
          <div className="custom-amount-wrap">
            <label>Enter custom amount (₹)</label>
            <input
              type="number"
              min="1"
              value={selectedAmount}
              onChange={handleCustomAmount}
              placeholder="Enter custom amount"
            />
          </div>
        )}

        <div className="qr-block">
          {paymentLoading ? (
            <div className="qr-placeholder">Loading payment gateway...</div>
          ) : upiPayload ? (
            <QRCodeSVG
              value={upiPayload}
              size={220}
              includeMargin={true}
              level="H"
            />
          ) : (
            <div className="qr-placeholder">Enter amount to generate QR</div>
          )}
        </div>

        <div className="upi-info">
          <span>UPI ID:</span>{" "}
          <strong>{paymentSettings.upiId || "Not configured"}</strong>
        </div>

        <div className="paying-amount">
          Paying Amount: <strong>₹{validAmount ? numericAmount : 0}</strong>
        </div>

        <form className="donation-form" onSubmit={handleDonate}>
          <label>Your Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            required
            maxLength={10}
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
          />

          <label>Transaction ID / UTR (optional)</label>
          <input
            type="text"
            name="transactionId"
            value={form.transactionId}
            onChange={handleChange}
            placeholder="Enter UTR or transaction ID"
          />

          {error && <div className="donation-error">{error}</div>}

          <button
            className="btn-donate"
            type="submit"
            disabled={
              loading ||
              !validAmount ||
              paymentLoading ||
              !paymentSettings.upiId
            }
          >
            {loading ? "Processing..." : "I Have Paid - Generate Receipt"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
