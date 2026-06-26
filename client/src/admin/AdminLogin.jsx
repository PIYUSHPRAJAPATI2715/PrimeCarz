import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login as loginAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await loginAPI(form);
      const { token, user } = res.data;
      if (user?.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }
      login(user, token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,51,18,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,51,18,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "48px 40px",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "var(--gradient-primary)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              margin: "0 auto 16px",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            🚗
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "6px",
            }}
          >
            PrimeCarz Admin
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>
            Sign in to access the admin panel
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              color: "#f87171",
              fontSize: "0.875rem",
              fontFamily: "var(--font-secondary)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="admin@primecarz.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "28px" }}>
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                style={{ paddingRight: "50px" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  padding: "4px",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full${loading ? " btn-loading" : ""}`}
            disabled={loading}
            style={{ borderRadius: "var(--radius-md)", padding: "15px" }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Signing In...
              </>
            ) : (
              <>🔐 Sign In to Admin</>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-secondary)",
          }}
        >
          PrimeCarz &copy; {new Date().getFullYear()} · Admin Portal
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
