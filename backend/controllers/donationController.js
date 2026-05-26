const fs = require("fs");
const path = require("path");
const {
  sendDonationUnderVerificationEmail,
  sendDonationApprovedEmail,
  sendDonationRejectedEmail,
} = require("../services/mailService");

const DATA_FILE = path.join(__dirname, "..", "data", "donations.json");
const ALLOWED_STATUSES = ["APPROVED", "REJECTED"];

function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Error reading donations store", err);
    return [];
  }
}

function writeStore(arr) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing donations store", err);
  }
}

function normalizeDonation(donation) {
  return {
    ...donation,
    status: donation.status || "PENDING",
    reviewedAt: donation.reviewedAt || null,
    reviewedBy: donation.reviewedBy || null,
    reviewNote: donation.reviewNote || null,
  };
}

exports.createDonation = async (req, res) => {
  const { name, email, phone, amount, transactionId, paymentMethod } = req.body;

  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  const cleanPhone = String(phone || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!amount || Number(amount) <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid amount is required" });
  }

  if (!cleanName) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return res
      .status(400)
      .json({ success: false, message: "A valid email is required" });
  }

  if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "A valid 10-digit mobile number is required",
      });
  }

  const donations = readStore();
  const id = `DON-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const receipt = {
    id,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    amount: Number(amount),
    transactionId: transactionId || null,
    paymentMethod: paymentMethod || "QR",
    status: "PENDING",
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null,
    createdAt: new Date().toISOString(),
  };

  donations.unshift(receipt);
  writeStore(donations);

  // Do not fail API response if mail provider has temporary issue.
  try {
    await sendDonationUnderVerificationEmail(cleanEmail, receipt);
  } catch (mailErr) {
    console.error("Donation under verification email failed:", mailErr.message);
  }

  return res.status(201).json({ success: true, data: receipt });
};

exports.listDonations = (req, res) => {
  const donations = readStore().map(normalizeDonation);
  return res.status(200).json({ success: true, data: donations });
};

exports.getDonation = (req, res) => {
  const id = req.params.id;
  const donations = readStore();
  const d = donations.find((x) => x.id === id);
  if (!d)
    return res
      .status(404)
      .json({ success: false, message: "Donation not found" });
  return res.status(200).json({ success: true, data: normalizeDonation(d) });
};

exports.updateDonationStatus = async (req, res) => {
  const id = req.params.id;
  const { status, reviewNote } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be APPROVED or REJECTED",
    });
  }

  if (status === "REJECTED" && !String(reviewNote || "").trim()) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason is required",
    });
  }

  const donations = readStore();
  const index = donations.findIndex((x) => x.id === id);
  if (index === -1) {
    return res
      .status(404)
      .json({ success: false, message: "Donation not found" });
  }

  const existing = normalizeDonation(donations[index]);
  const updated = {
    ...existing,
    status,
    reviewNote: reviewNote ? String(reviewNote).trim() : null,
    reviewedAt: new Date().toISOString(),
    reviewedBy: req.user?.email || req.user?.id || "admin",
  };

  donations[index] = updated;
  writeStore(donations);

  try {
    if (status === "APPROVED") {
      await sendDonationApprovedEmail(updated.email, updated);
    } else {
      await sendDonationRejectedEmail(
        updated.email,
        updated,
        updated.reviewNote,
      );
    }
  } catch (mailErr) {
    console.error(
      `Donation ${status.toLowerCase()} email failed:`,
      mailErr.message,
    );
  }

  return res.status(200).json({
    success: true,
    message: `Donation ${status.toLowerCase()} successfully`,
    data: updated,
  });
};
