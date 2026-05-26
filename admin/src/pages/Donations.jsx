import React, { useEffect, useState } from "react";
import "./Donations.css";

const API = import.meta.env.VITE_API_URL;

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setDonations(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdatingId(id);
      let reviewNote = "";

      if (status === "REJECTED") {
        reviewNote =
          window.prompt("Please enter rejection reason for this donation:") ||
          "";
        if (!reviewNote.trim()) {
          setUpdatingId(null);
          alert("Rejection reason is required.");
          return;
        }
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/donations/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reviewNote }),
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.message || "Failed to update status");

      setDonations((prev) =>
        prev.map((item) => (item.id === id ? json.data : item)),
      );
    } catch (err) {
      alert(err.message || "Failed to update donation status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "approved";
    if (status === "REJECTED") return "rejected";
    return "pending";
  };

  return (
    <div className="donations-page">
      <h1>Donations</h1>
      <p>List of donations received via public donation page.</p>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="donations-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Name</th>
              <th>Amount (₹)</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.amount}</td>
                <td>{d.paymentMethod}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(d.status)}`}>
                    {d.status || "PENDING"}
                  </span>
                </td>
                <td>{new Date(d.createdAt).toLocaleString()}</td>
                <td>
                  <div className="action-wrap">
                    <button
                      className="btn-status approve"
                      disabled={updatingId === d.id}
                      onClick={() => handleStatusUpdate(d.id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-status reject"
                      disabled={updatingId === d.id}
                      onClick={() => handleStatusUpdate(d.id, "REJECTED")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Donations;
