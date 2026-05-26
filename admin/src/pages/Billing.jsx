import React from "react";
import "./Dashboard.css";

const Billing = () => {
  return (
    <main className="dashboard-container animate-fade-in">
      <section className="welcome-hero small-hero">
        <div className="hero-content">
          <div className="hero-badge">Billing</div>
          <h1>Billing & Subscriptions</h1>
          <p>Manage invoices, subscriptions, and payment history.</p>
        </div>
      </section>

      <section style={{ padding: 20 }}>
        <div className="glass-panel">
          <h3>Current Plan</h3>
          <p>
            Enterprise — contact your account manager for plan details and
            support.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Billing;
