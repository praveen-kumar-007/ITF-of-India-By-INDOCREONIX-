const express = require("express");
const router = express.Router();
const {
  createDonation,
  listDonations,
  getDonation,
  updateDonationStatus,
} = require("../controllers/donationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public: donor creates donation (after scanning QR or filling amount)
router.post("/", createDonation);

// Protected: admin can list and view donations
router.get("/", protect, listDonations);
router.get("/:id", protect, getDonation);
router.patch(
  "/:id/status",
  protect,
  authorize("admin", "superadmin"),
  updateDonationStatus,
);

module.exports = router;
