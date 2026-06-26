import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../utils/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    maxUses: 0,
    expiryDate: '',
    isActive: true,
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getAllCoupons();
      setCoupons(res.data?.coupons || res.data || []);
    } catch (err) {
      addToast('Failed to load coupons.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 0,
        maxUses: coupon.maxUses || 0,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 10) : '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      });
    } else {
      setEditingCoupon(null);
      setForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        maxUses: 0,
        expiryDate: '',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.expiryDate) {
      addToast('Please fill in code, value and expiration date.', 'error');
      return;
    }

    const payload = { ...form, code: form.code.toUpperCase() };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        addToast('Coupon updated successfully!', 'success');
      } else {
        await createCoupon(payload);
        addToast('Coupon created successfully!', 'success');
      }
      fetchCoupons();
      handleCloseModal();
    } catch (err) {
      addToast('Failed to save coupon.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo coupon?')) return;
    try {
      await deleteCoupon(id);
      addToast('Coupon deleted.', 'success');
      setCoupons((p) => p.filter((c) => c._id !== id));
    } catch (err) {
      addToast('Failed to delete coupon.', 'error');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const updated = { ...coupon, isActive: !coupon.isActive };
      await updateCoupon(coupon._id, updated);
      addToast('Coupon state toggled!', 'success');
      setCoupons((prev) => 
        prev.map((c) => c._id === coupon._id ? { ...c, isActive: !coupon.isActive } : c)
      );
    } catch (err) {
      addToast('Failed to update coupon status.', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page-content"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Promo Coupons Manager</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure percentage or flat rate discount campaigns and usage caps</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          ➕ Create Coupon
        </button>
      </div>

      <div className="card" style={{ padding: '0px', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
        ) : coupons.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type / Discount</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Min order</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uses / Expiry</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--primary-light)', fontSize: '1rem', letterSpacing: '0.05em' }}>{c.code}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `$${c.discountValue} Flat`}
                  </td>
                  <td style={{ padding: '16px 24px' }}>${c.minOrderAmount}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500 }}>{c.usedCount} / {c.maxUses === 0 ? '∞' : c.maxUses} uses</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expires: {new Date(c.expiryDate).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: c.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: c.isActive ? '#4ade80' : '#f87171',
                        border: c.isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'
                      }}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleOpenModal(c)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(c._id)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No promo campaigns running. Click Create Coupon to start.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal card" 
            style={{ maxWidth: '600px', width: '100%', padding: '32px' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>
              {editingCoupon ? 'Modify Campaign Details' : 'Create Promo Campaign'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Coupon Code *</label>
                  <input 
                    type="text" name="code" value={form.code} onChange={handleChange} 
                    placeholder="e.g. SUMMER25" required disabled={!!editingCoupon}
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Discount Type</label>
                  <select 
                    name="discountType" value={form.discountType} onChange={handleChange}
                    style={{ width: '100%', padding: '12px 14px', background: '#0d1421', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat ($)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Discount Value *</label>
                  <input 
                    type="number" name="discountValue" value={form.discountValue} onChange={handleChange} 
                    placeholder="e.g. 15" required
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Min Order Value ($)</label>
                  <input 
                    type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} 
                    placeholder="0"
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Max Discount ($)</label>
                  <input 
                    type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} 
                    placeholder="0 for infinity"
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Max Uses Caps</label>
                  <input 
                    type="number" name="maxUses" value={form.maxUses} onChange={handleChange} 
                    placeholder="0 for infinity"
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Expiry Date *</label>
                  <input 
                    type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} 
                    required
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '30px', margin: '8px 0 16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  Campaign Active
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCoupon ? 'Save Changes' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Toasts layout */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ padding: '12px 24px', background: t.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {t.message}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminCoupons;
