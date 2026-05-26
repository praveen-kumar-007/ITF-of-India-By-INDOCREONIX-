import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck, UserPlus, ArrowRight, RefreshCw } from "lucide-react";
import "./ReceiptGenerator.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ReceiptGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    sportsDiscipline: "",
    state: "",
    district: "",
    contactNumber: "",
    transactionId: "",
    regNo: "",
    date: new Date().toISOString().split("T")[0],
    amount: "500",
    status: "APPROVED", // Default to Approved for admin generation
  });

  const [loadingId, setLoadingId] = useState(false);

  // Fetch a unique Receipt ID from server
  useEffect(() => {
    fetchUniqueId();
  }, []);

  const fetchUniqueId = async () => {
    setLoadingId(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/registrations/generate-id?type=offline`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, regNo: result.data.regNo }));
      }
    } catch (error) {
      console.error("Error generating ID:", error);
      // Fallback to local random if API fails (though not ideal)
      const year = new Date().getFullYear();
      const random = Math.floor(10000 + Math.random() * 90000);
      setFormData((prev) => ({
        ...prev,
        regNo: `ITF/OFFLINE/${year}/${random}`,
      }));
    } finally {
      setLoadingId(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadSample = () => {
    const sampleData = {
      fullName: "Athlete Name",
      fatherName: "Guardian Name",
      sportsDiscipline: "Sports Category",
      state: "Haryana",
      district: "Rohtak",
      contactNumber: "9876543210",
      transactionId: "OFFLINE_CASH_12345",
      regNo: "ITF/REG/2026/SAMPLE",
      date: new Date().toLocaleDateString(),
      amount: "500",
    };
    navigate("/receipt-preview", { state: { receiptData: sampleData } });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      date: new Date(formData.date).toLocaleDateString(),
    };
    navigate("/receipt-preview", { state: { receiptData: finalData } });
  };

  return (
    <div className="receipt-generator-page">
      <div className="page-header">
        <div>
          <h1>Receipt Generator</h1>
          <p>Issue official receipts for offline registrations</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleLoadSample}>
            <FileCheck size={18} />
            Load Sample Receipt
          </button>
        </div>
      </div>

      <div className="generator-layout single-col">
        <div className="generator-form-card">
          <div className="form-title-group">
            <UserPlus className="title-icon" />
            <div>
              <h2>Athlete Details</h2>
              <p>Enter the data exactly as per the offline registration form</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="premium-form-grid">
            <div className="form-row">
              <div className="form-group">
                <label>Receipt Number</label>
                <div className="input-with-action">
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    placeholder={
                      loadingId ? "Generating..." : "e.g. ITF/REG/2026/001"
                    }
                    required
                  />
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={fetchUniqueId}
                    title="Generate New ID"
                    disabled={loadingId}
                  >
                    <RefreshCw size={18} className={loadingId ? "spin" : ""} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Registration Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Athlete's Full Name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Father's Name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sport Discipline</label>
                <input
                  type="text"
                  name="sportsDiscipline"
                  value={formData.sportsDiscipline}
                  onChange={handleInputChange}
                  placeholder="e.g. Taekwondo, Kabaddi"
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  required
                />
              </div>
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="District"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Transaction ID / Remarks</label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="e.g. CASH, UTR12345"
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Verification Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="premium-select"
              >
                <option value="APPROVED">APPROVED (Verified)</option>
                <option value="PENDING FOR VERIFICATION">
                  PENDING FOR VERIFICATION
                </option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="generator-footer-actions">
              <button type="submit" className="btn-generate-full">
                Generate & Preview Official Receipt
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
