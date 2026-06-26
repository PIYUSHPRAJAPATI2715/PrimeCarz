import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSettings, updateSettings } from '../utils/api';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  const [form, setForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    businessHours: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    getSettings()
      .then((res) => {
        const s = res.data?.settings || res.data || {};
        setForm({
          heroTitle: s.heroTitle || '',
          heroSubtitle: s.heroSubtitle || '',
          contactPhone: s.contactPhone || '',
          contactEmail: s.contactEmail || '',
          contactAddress: s.contactAddress || '',
          businessHours: s.businessHours || '',
          facebookUrl: s.facebookUrl || '',
          twitterUrl: s.twitterUrl || '',
          instagramUrl: s.instagramUrl || '',
        });
      })
      .catch(() => addToast('Failed to load site settings.', 'error'))
      .finally(() => setFormLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(form);
      addToast('Settings updated successfully!', 'success');
    } catch (err) {
      addToast('Error updating site configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }} className="spinner"></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page-content"
      style={{ maxWidth: '800px', margin: '0 auto' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Dynamic Site Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure SEO metadata headings, contact details, business hours and support channels</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Banner Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary-light)' }}>Homepage Hero Heading</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Hero Title Banner Text</label>
              <input 
                type="text" name="heroTitle" value={form.heroTitle} onChange={handleChange} 
                placeholder="Find Your Perfect Rental"
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Hero Subtitle Banner Text</label>
              <input 
                type="text" name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} 
                placeholder="Rent premium vehicles directly at lowest rates"
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary-light)' }}>Contact & Location Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Customer Care Phone</label>
              <input 
                type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Customer Care Email</label>
              <input 
                type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Physical HQ Address</label>
              <input 
                type="text" name="contactAddress" value={form.contactAddress} onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Business Hours</label>
              <input 
                type="text" name="businessHours" value={form.businessHours} onChange={handleChange} 
                placeholder="Mon - Sun: 8 AM - 10 PM"
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
          </div>
        </div>

        {/* Social URLs */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary-light)' }}>Social Connections</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Facebook Link</label>
              <input 
                type="text" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Twitter Link</label>
              <input 
                type="text" name="twitterUrl" value={form.twitterUrl} onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Instagram Link</label>
              <input 
                type="text" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full"
          style={{ padding: '16px', fontSize: '1rem', fontWeight: 700, marginTop: '10px' }}
        >
          {loading ? 'Saving system configurations...' : 'Save Site Settings'}
        </button>
      </form>

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

export default AdminSettings;
