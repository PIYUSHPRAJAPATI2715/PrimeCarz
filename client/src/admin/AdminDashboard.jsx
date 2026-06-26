import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getBookingStats, getRevenue, getAllBookings } from "../utils/api";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" } }) };

const STATUS_COLORS = {
  confirmed: { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  pending: { bg: "rgba(245,166,35,0.12)", color: "#fbbf24", border: "rgba(245,166,35,0.3)" },
  completed: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  ongoing: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem",
      fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontFamily: "var(--font-secondary)",
    }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 16px" }}>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "6px", fontFamily: "var(--font-secondary)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: "0.9rem", fontWeight: 600, fontFamily: "var(--font-secondary)" }}>
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, revRes, bookingsRes] = await Promise.all([
          getBookingStats(),
          getRevenue({ limit: 12 }),
          getAllBookings({ limit: 8, sort: "-createdAt" }),
        ]);
        setStats(statsRes.data);
        setRevenue(revRes.data?.monthly || revRes.data || []);
        setRecentBookings(bookingsRes.data?.bookings || bookingsRes.data || []);
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpiCards = [
    { label: "Total Bookings", value: stats?.totalBookings ?? "—", icon: "📋", color: "primary", change: "+12%", up: true },
    { label: "Total Revenue", value: stats?.totalRevenue ? `₹${Number(stats.totalRevenue).toLocaleString()}` : "—", icon: "💰", color: "gold", change: "+8.5%", up: true },
    { label: "Active Cars", value: stats?.totalCars ?? "—", icon: "🚗", color: "green", change: "+2", up: true },
    { label: "Upcoming", value: stats?.upcomingBookings ?? "—", icon: "📅", color: "blue", change: "This week", up: true },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)" }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here is what is happening with PrimeCarz.</p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/bookings/new" className="btn btn-primary btn-sm">+ New Booking</Link>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={fadeUp} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "12px 16px", color: "#f87171", marginBottom: "24px", fontFamily: "var(--font-secondary)", fontSize: "0.9rem" }}>
          ⚠️ {error}
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="kpi-grid">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} custom={i} variants={fadeUp} className={`kpi-card`}>
            <div className={`kpi-icon ${card.color}`}>{card.icon}</div>
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value">{card.value}</div>
            <div className={`kpi-change ${card.up ? "up" : "down"}`}>
              {card.up ? "▲" : "▼"} {card.change} vs last month
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts + Bookings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="admin-section-card" style={{ gridColumn: revenue.length ? "1 / 3" : "1 / 3" }}>
          <div className="admin-section-header">
            <span className="admin-section-title">💹 Revenue Overview</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>Last 12 months</span>
          </div>
          <div className="admin-section-body" style={{ padding: "24px 16px" }}>
            {revenue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e63312" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e63312" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5a623" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "0.8rem", color: "var(--text-secondary)" }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#e63312" strokeWidth={2} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#f5a623" strokeWidth={2} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div variants={fadeUp} className="admin-section-card">
        <div className="admin-section-header">
          <span className="admin-section-title">📋 Recent Bookings</span>
          <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Pickup</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>No bookings found</td></tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontFamily: "var(--font-secondary)", fontSize: "0.82rem", color: "var(--primary-light)" }}>
                      #{b._id?.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>{b.customerName || b.user?.name || "—"}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>{b.customerEmail || b.user?.email}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-secondary)", fontSize: "0.88rem" }}>
                      {b.car?.name || b.carName || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-secondary)", fontSize: "0.85rem" }}>
                      {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      ₹{Number(b.totalAmount || 0).toLocaleString()}
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
