import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getAllBookings, updateBookingStatus } from "../utils/api";

const STATUSES = ["all", "pending", "confirmed", "ongoing", "completed", "cancelled"];

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
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: "var(--font-secondary)" }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const ITEMS_PER_PAGE = 10;

const Toast = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map((t) => (
      <motion.div key={t.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }} className={`toast toast-${t.type}`}>
        <span className="toast-icon">{t.type === "success" ? "✅" : "❌"}</span>
        <span className="toast-message">{t.message}</span>
      </motion.div>
    ))}
  </div>
);

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (filter !== "all") params.status = filter;
      if (search) params.search = search;
      const res = await getAllBookings(params);
      setBookings(res.data?.bookings || res.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      addToast("Failed to load bookings.", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, page, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus(bookingId, { status: newStatus });
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: newStatus } : b));
      addToast(`Status updated to "${newStatus}".`);
    } catch (err) {
      addToast("Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Toast toasts={toasts} />
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">All Bookings</h1>
          <p className="admin-page-subtitle">{total} total bookings found</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div className="filter-tabs">
          {STATUSES.map((s) => (
            <button key={s} className={`filter-tab${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by name, email, car..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "280px", padding: "10px 16px" }}
        />
      </div>

      <div className="admin-section-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }} />Loading bookings...
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Pickup</th>
                  <th>Drop</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>No bookings found</td></tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontSize: "0.8rem", color: "var(--primary-light)", fontFamily: "var(--font-secondary)" }}>
                        #{b._id?.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{b.customerName || b.user?.name || "—"}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>{b.customerPhone || b.user?.phone || ""}</div>
                      </td>
                      <td style={{ fontFamily: "var(--font-secondary)", fontSize: "0.88rem" }}>{b.car?.name || b.carName || "—"}</td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>
                        {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>
                        {b.dropDate ? new Date(b.dropDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{Number(b.totalAmount || 0).toLocaleString()}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <select
                          className="form-control"
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          disabled={updatingId === b._id}
                          style={{ padding: "6px 10px", fontSize: "0.82rem", minWidth: "130px" }}
                        >
                          {["pending", "confirmed", "ongoing", "completed", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px 24px", borderTop: "1px solid var(--border)" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} className={`btn btn-sm${page === p ? " btn-primary" : " btn-ghost"}`} onClick={() => setPage(p)} style={{ minWidth: "38px" }}>{p}</button>
              );
            })}
            <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminBookings;
