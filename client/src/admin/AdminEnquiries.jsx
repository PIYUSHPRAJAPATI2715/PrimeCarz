import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getEnquiries, updateEnquiry, deleteEnquiry } from '../utils/api';

const STATUS_BADGES = {
  pending: { bg: 'rgba(245,166,35,0.12)', color: '#fbbf24', border: 'rgba(245,166,35,0.3)' },
  reviewed: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  approved: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await getEnquiries();
      setEnquiries(res.data?.enquiries || res.data || []);
    } catch (err) {
      addToast('Failed to load host partner enquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateEnquiry(id, { status });
      if (res.data.success) {
        addToast(`Enquiry marked as ${status}!`, 'success');
        setEnquiries((prev) => 
          prev.map((e) => e._id === id ? { ...e, status } : e)
        );
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry((p) => ({ ...p, status }));
        }
      }
    } catch (err) {
      addToast('Error updating enquiry status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing application enquiry?')) return;
    try {
      await deleteEnquiry(id);
      addToast('Enquiry deleted successfully.', 'success');
      setEnquiries((p) => p.filter((e) => e._id !== id));
      setSelectedEnquiry(null);
    } catch (err) {
      addToast('Failed to delete enquiry.', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page-content"
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Host Car Enquiries</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review applications from car owners wanting to list their vehicles in the catalog</p>
      </div>

      <div className="card" style={{ padding: '0px', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
        ) : enquiries.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Host Applicant</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Vehicle Requested</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Submission Date</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => {
                const s = STATUS_BADGES[e.status] || STATUS_BADGES.pending;
                return (
                  <tr key={e._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600 }}>{e.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.email} | {e.phone}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                      {e.carBrand} {e.carModel} {e.carYear && `(${e.carYear})`}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex', padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`
                      }}>
                        {e.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setSelectedEnquiry(e)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          🔍 Details
                        </button>
                        <button 
                          onClick={() => handleDelete(e._id)} 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No vehicle listing applications filed yet.
          </div>
        )}
      </div>

      {/* Details Dialog */}
      {selectedEnquiry && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal card" 
            style={{ maxWidth: '600px', width: '100%', padding: '32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Enquiry Details</h3>
              <button 
                type="button" 
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Host Applicant</span>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{selectedEnquiry.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vehicle Proposed</span>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{selectedEnquiry.carBrand} {selectedEnquiry.carModel} ({selectedEnquiry.carYear})</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</span>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{selectedEnquiry.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number</span>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '4px' }}>{selectedEnquiry.phone}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vehicle Condition & Owner Notes</span>
                <p style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', fontSize: '0.9rem', color: '#fff', lineHeight: 1.5, marginTop: '6px' }}>
                  {selectedEnquiry.description || 'No additional notes provided by owner.'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Application Status</span>
                <div style={{ marginTop: '6px' }}>
                  <span style={{
                    display: 'inline-flex', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                    background: (STATUS_BADGES[selectedEnquiry.status] || STATUS_BADGES.pending).bg,
                    color: (STATUS_BADGES[selectedEnquiry.status] || STATUS_BADGES.pending).color,
                    border: `1px solid ${(STATUS_BADGES[selectedEnquiry.status] || STATUS_BADGES.pending).border}`
                  }}>
                    {selectedEnquiry.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleUpdateStatus(selectedEnquiry._id, 'approved')} 
                  className="btn btn-primary btn-sm"
                  style={{ background: '#22c55e', borderColor: '#22c55e' }}
                >
                  ✓ Approve
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedEnquiry._id, 'reviewed')} 
                  className="btn btn-secondary btn-sm"
                >
                  👁️ Mark Reviewed
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedEnquiry._id, 'rejected')} 
                  className="btn btn-secondary btn-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                >
                  ✕ Reject
                </button>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
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

export default AdminEnquiries;
