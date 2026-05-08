import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./Login.css";
import GoogleSignInButton from "../components/Auth/GoogleSignInButton";
import { exchangeGoogleCredential } from "../utils/googleAuth";

import { useToast } from "../context/ToastContext";

const LoginPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      showToast("Your session has expired. Please login again.", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showToast]);

  // App Modes
  const [mode, setMode] = useState("login"); // 'login', 'forgot', 'reset'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleGoogleSignIn = async (credential) => {
    setGoogleLoading(true);

    const result = await exchangeGoogleCredential(credential);
    if (!result?.success) {
      showToast(result?.message || "Google sign-in failed", "error");
      setGoogleLoading(false);
      return;
    }

    const token = result?.data?.token;
    const user = result?.data?.user;
    if (!token || !user) {
      showToast("Admin account not found for this Google login", "error");
      setGoogleLoading(false);
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    showToast(`Welcome back, ${user.fullName || "Admin"}!`, "success");
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        showToast(`Welcome back, ${result.data.user.fullName}!`, "success");
        navigate("/");
      } else {
        showToast(result.message || "Invalid login credentials", "error");
      }
    } catch (err) {
      showToast("Connection error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (result.success) {
        showToast("Verification OTP sent to your email", "success");
        setMode("reset");
      } else {
        showToast(result.message || "Account not found", "error");
      }
    } catch (err) {
      showToast("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showToast("Passwords do not match", "error");
    }
    if (newPassword.length < 8) {
      return showToast("Password must be at least 8 characters", "error");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });

      const result = await response.json();
      if (result.success) {
        showToast("Password updated! You can now login.", "success");
        setMode("login");
        setPassword("");
      } else {
        showToast(result.message || "Invalid or expired OTP", "error");
      }
    } catch (err) {
      showToast("Error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.jpeg" alt="Logo" />
          </div>
          <h1>Admin Portal</h1>
          <p>
            {mode === "login"
              ? "Sign in to manage ITF India athletes"
              : mode === "forgot"
                ? "Reset your administrator password"
                : "Verify OTP and set new password"}
          </p>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="login-form">
            <GoogleSignInButton
              onSuccess={handleGoogleSignIn}
              onError={(message) => showToast(message, "error")}
              disabled={loading || googleLoading}
            />
            <div className="login-divider">
              <span>or continue with email</span>
            </div>
            <div className="input-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="input-field password-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ textAlign: "right", marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#936a00",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Forgot Password?
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleRequestReset} className="login-form">
            <div className="input-field">
              <label htmlFor="reset-email">Administrator Email</label>
              <div className="input-with-icon">
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Send Verification OTP"}
            </button>
            <button
              type="button"
              className="back-to-login"
              onClick={() => setMode("login")}
              style={{
                width: "100%",
                marginTop: "15px",
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleVerifyReset} className="login-form">
            <div className="input-field">
              <label htmlFor="otp">6-Digit OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <div className="input-field password-field">
              <label htmlFor="new-password">New Password</label>
              <div className="input-wrapper">
                <input
                  id="new-password"
                  name="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="input-field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Updating..." : "Reset Password & Unlock"}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>© 2026 ITF OF INDIA. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
