import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminFAQs, createFAQ, updateFAQ, deleteFAQ } from '../utils/api';

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [form, setForm] = useState({
    question: '',
    answer: '',
    order: 0,
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await getAdminFAQs();
      setFaqs(res.data?.faqs || res.data || []);
    } catch (err) {
      addToast('Failed to load FAQs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setForm({
        question: faq.question || '',
        answer: faq.answer || '',
        order: faq.order || 0,
      });
    } else {
      setEditingFaq(null);
      setForm({ question: '', answer: '', order: faqs.length + 1 });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm({ question: '', answer: '', order: 0 });
    setEditingFaq(null);
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await updateFAQ(editingFaq._id, form);
        addToast('FAQ updated successfully!', 'success');
      } else {
        await createFAQ(form);
        addToast('FAQ created successfully!', 'success');
      }
      fetchFAQs();
      handleCloseModal();
    } catch (err) {
      addToast('Failed to save FAQ entry.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ entry?')) return;
    try {
      await deleteFAQ(id);
      addToast('FAQ entry deleted.', 'success');
      setFaqs((p) => p.filter((f) => f._id !== id));
    } catch (err) {
      addToast('Failed to delete FAQ.', 'error');
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Support FAQs Manager</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure customer self-support accordion questions and search keys</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          ➕ Add FAQ Item
        </button>
      </div>

      <div className="card" style={{ padding: '0px', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
        ) : faqs.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', width: '60px' }}>Order</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Question</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Answer Summary</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>{faq.order}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{faq.question}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {faq.answer}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleOpenModal(faq)} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(faq._id)} 
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
            No FAQs compiled yet. Click Add to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal card" 
            style={{ maxWidth: '600px', width: '100%', padding: '32px' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px' }}>
              {editingFaq ? 'Modify FAQ Entry' : 'Create FAQ Item'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Question Text</label>
                <input 
                  type="text" name="question" value={form.question} onChange={handleChange} 
                  placeholder="e.g. What insurance options are provided?" required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Detailed Answer</label>
                <textarea 
                  name="answer" value={form.answer} onChange={handleChange} 
                  placeholder="Provide a detailed, clear explanation for customers..." rows="5" required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Display Order Index</label>
                <input 
                  type="number" name="order" value={form.order} onChange={handleChange} 
                  required
                  style={{ width: '120px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFaq ? 'Save Changes' : 'Create FAQ'}
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

export default AdminFAQ;
