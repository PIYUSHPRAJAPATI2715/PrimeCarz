import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCars, createManualBooking } from "../utils/api";

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

const FormRow = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>{children}</div>
);

const AdminNewBooking = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [form, setForm] = useState({
    carId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    pickupLocation: "",
    dropLocation: "",
    pickupDate: "",
    dropDate: "",
    withDriver: false,
    paymentMethod: "cash",
    notes: "",
  });

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    getCars()
      .then((res) => setCars(res.data?.cars || res.data || []))
      .catch(() => addToast("Failed to load cars.", "error"))
      .finally(() => setCarsLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const selectedCar = cars.find((c) => c._id === form.carId);

  const calcTotal = () => {
    if (!selectedCar || !form.pickupDate || !form.dropDate) return 0;
    const days = Math.max(1, Math.ceil((new Date(form.dropDate) - new Date(form.pickupDate)) / (1000 * 60 * 60 * 24)));
    let total = days * (selectedCar.pricePerDay || 0);
    if (form.withDriver) total += days * (selectedCar.driverPrice || 500);
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.carId || !form.customerName || !form.pickupDate || !form.dropDate) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    if (new Date(form.dropDate) <= new Date(form.pickupDate)) {
      addToast("Drop date must be after pickup date.", "error");
      return;
    }
    setLoading(true);
    try {
      await createManualBooking({ ...form, totalAmount: calcTotal() });
      addToast("Booking created successfully!");
      setTimeout(() => navigate("/admin/bookings"), 1500);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create booking.", "error");
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "1.1rem" }}>{icon}</span>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Toast toasts={toasts} />
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">New Booking</h1>
          <p className="admin-page-subtitle">Create a manual booking for a customer</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate("/admin/bookings")}>← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Car Selection */}
            <div className="admin-section-card">
              <div className="admin-section-body">
                <SectionTitle icon="🚗" title="Select Car" />
                {carsLoading ? (
                  <div style={{ color: "var(--text-muted)", padding: "20px", textAlign: "center" }}>Loading cars...</div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Car *</label>
                    <select name="carId" className="form-control" value={form.carId} onChange={handleChange} required>
                      <option value="">— Select a car —</option>
                      {cars.map((c) => (
                        <option key={c._id} value={c._id}>{c.name} — ₹{c.pricePerDay}/day {!c.available ? "(Unavailable)" : ""}</option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedCar && (
                  <div style={{ display: "flex", gap: "12px", padding: "14px", background: "rgba(230,51,18,0.06)", border: "1px solid rgba(230,51,18,0.15)", borderRadius: "var(--radius-md)", marginTop: "12px" }}>
                    {selectedCar.images?.[0] && (
                      <img src={selectedCar.images[0]} alt={selectedCar.name} style={{ width: "64px", height: "48px", objectFit: "cover", borderRadius: "8px" }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>{selectedCar.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-secondary)" }}>{selectedCar.brand} · {selectedCar.type} · {selectedCar.seats} seats · ₹{selectedCar.pricePerDay}/day</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="admin-section-card">
              <div className="admin-section-body">
                <SectionTitle icon="👤" title="Customer Information" />
                <FormRow>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" name="customerName" className="form-control" placeholder="John Doe" value={form.customerName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input type="tel" name="customerPhone" className="form-control" placeholder="+91 9876543210" value={form.customerPhone} onChange={handleChange} required />
                  </div>
                </FormRow>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="customerEmail" className="form-control" placeholder="customer@example.com" value={form.customerEmail} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="admin-section-card">
              <div className="admin-section-body">
                <SectionTitle icon="📍" title="Trip Details" />
                <FormRow>
                  <div className="form-group">
                    <label className="form-label">Pickup Location *</label>
                    <input type="text" name="pickupLocation" className="form-control" placeholder="Airport, City Centre..." value={form.pickupLocation} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Drop Location</label>
                    <input type="text" name="dropLocation" className="form-control" placeholder="Same as pickup" value={form.dropLocation} onChange={handleChange} />
                  </div>
                </FormRow>
                <FormRow>
                  <div className="form-group">
                    <label className="form-label">Pickup Date *</label>
                    <input type="date" name="pickupDate" className="form-control" value={form.pickupDate} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Drop Date *</label>
                    <input type="date" name="dropDate" className="form-control" value={form.dropDate} onChange={handleChange} required min={form.pickupDate || new Date().toISOString().split("T")[0]} />
                  </div>
                </FormRow>
                <FormRow>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select name="paymentMethod" className="form-control" value={form.paymentMethod} onChange={handleChange}>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "14px 0" }}>
                      <input type="checkbox" name="withDriver" checked={form.withDriver} onChange={handleChange} style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }} />
                      <span style={{ fontFamily: "var(--font-secondary)", fontSize: "0.95rem", color: "var(--text-primary)" }}>Include Driver (+₹500/day)</span>
                    </label>
                  </div>
                </FormRow>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea name="notes" className="form-control" placeholder="Any special requests or notes..." value={form.notes} onChange={handleChange} style={{ minHeight: "80px" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div>
            <div className="admin-section-card" style={{ position: "sticky", top: "88px" }}>
              <div className="admin-section-header">
                <span className="admin-section-title">💰 Booking Summary</span>
              </div>
              <div className="admin-section-body">
                {selectedCar ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontFamily: "var(--font-secondary)", color: "var(--text-secondary)" }}>
                      <span>Car</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{selectedCar.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontFamily: "var(--font-secondary)", color: "var(--text-secondary)" }}>
                      <span>Rate</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>₹{selectedCar.pricePerDay}/day</span>
                    </div>
                    {form.pickupDate && form.dropDate && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontFamily: "var(--font-secondary)", color: "var(--text-secondary)" }}>
                        <span>Duration</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                          {Math.max(1, Math.ceil((new Date(form.dropDate) - new Date(form.pickupDate)) / (1000 * 60 * 60 * 24)))} days
                        </span>
                      </div>
                    )}
                    {form.withDriver && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontFamily: "var(--font-secondary)", color: "var(--text-secondary)" }}>
                        <span>Driver</span>
                        <span style={{ color: "var(--gold)", fontWeight: 600 }}>+₹500/day</span>
                      </div>
                    )}
                    <div style={{ height: "1px", background: "var(--border)", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      <span>Total</span>
                      <span style={{ color: "var(--primary-light)" }}>₹{calcTotal().toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0", fontFamily: "var(--font-secondary)", fontSize: "0.9rem" }}>Select a car to see summary</p>
                )}

                <button
                  type="submit"
                  form="booking-form-id"
                  className={`btn btn-primary btn-full${loading ? " btn-loading" : ""}`}
                  disabled={loading}
                  style={{ marginTop: "24px", borderRadius: "var(--radius-md)" }}
                  onClick={handleSubmit}
                >
                  {loading ? "Creating..." : "✅ Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminNewBooking;
