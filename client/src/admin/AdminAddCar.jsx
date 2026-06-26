import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createCar, updateCar, getCar } from '../utils/api';

const AdminAddCar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [form, setForm] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    fuel: 'petrol',
    seats: 4,
    transmission: 'automatic',
    pricePerDay: '',
    securityDeposit: '',
    description: '',
    features: '',
    available: true,
    featured: false,
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setFormLoading(true);
      getCar(id)
        .then((res) => {
          const car = res.data.car || res.data;
          setForm({
            name: car.name || '',
            brand: car.brand || '',
            model: car.model || '',
            year: car.year || new Date().getFullYear(),
            type: car.type || 'sedan',
            fuel: car.fuel || 'petrol',
            seats: car.seats || 4,
            transmission: car.transmission || 'automatic',
            pricePerDay: car.pricePerDay || '',
            securityDeposit: car.securityDeposit || '',
            description: car.description || '',
            features: Array.isArray(car.features) ? car.features.join(', ') : car.features || '',
            available: car.available !== undefined ? car.available : true,
            featured: car.featured || false,
          });
        })
        .catch(() => addToast('Failed to load car details.', 'error'))
        .finally(() => setFormLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.model || !form.pricePerDay) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      if (isEditMode) {
        await updateCar(id, formData);
        addToast('Car updated successfully!', 'success');
      } else {
        await createCar(formData);
        addToast('Car added successfully!', 'success');
      }
      setTimeout(() => navigate('/admin/cars'), 1500);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing request.', 'error');
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
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {isEditMode ? 'Modify Car Details' : 'Register New Fleet Car'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isEditMode ? 'Update vehicle information, specifications, pricing or features' : 'Add a luxury supercar or SUV to the booking catalog'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Vehicle Display Name *</label>
            <input 
              type="text" name="name" value={form.name} onChange={handleChange} 
              placeholder="e.g. Porsche 911 Carrera S" required
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Manufacturer / Brand *</label>
            <input 
              type="text" name="brand" value={form.brand} onChange={handleChange} 
              placeholder="e.g. Porsche" required
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Model *</label>
            <input 
              type="text" name="model" value={form.model} onChange={handleChange} 
              placeholder="e.g. 911 Carrera" required
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Model Year *</label>
            <input 
              type="number" name="year" value={form.year} onChange={handleChange} 
              min="2010" max={new Date().getFullYear() + 1} required
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Body Category</label>
            <select 
              name="type" value={form.type} onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px', background: '#0d1421', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="sports">Sports</option>
              <option value="supercar">Supercar</option>
              <option value="convertible">Convertible</option>
              <option value="luxury">Luxury Limousine</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Fuel Type</label>
            <select 
              name="fuel" value={form.fuel} onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px', background: '#0d1421', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Seats</label>
            <input 
              type="number" name="seats" value={form.seats} onChange={handleChange} 
              min="2" max="8" required
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Gearbox</label>
            <select 
              name="transmission" value={form.transmission} onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px', background: '#0d1421', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Rate / Day ($) *</label>
            <input 
              type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} 
              placeholder="e.g. 299" required
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Refundable Deposit ($)</label>
            <input 
              type="number" name="securityDeposit" value={form.securityDeposit} onChange={handleChange} 
              placeholder="e.g. 1000"
              style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Upload Car Images</label>
            <input 
              type="file" multiple onChange={handleFileChange} accept="image/*"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Car Description</label>
          <textarea 
            name="description" value={form.description} onChange={handleChange} 
            placeholder="Introduce the car specs, performance metrics, handling excellence or visual trims..." rows="4"
            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>Key Features (Comma Separated)</label>
          <input 
            type="text" name="features" value={form.features} onChange={handleChange} 
            placeholder="e.g. Navigation, Leather Seats, AC, Sunroof, Backup Camera"
            style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
          />
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            Available for Booking
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            Feature on Homepage
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full"
          style={{ padding: '16px', fontSize: '1rem', fontWeight: 700 }}
        >
          {loading ? 'Processing vehicle data...' : isEditMode ? 'Update Vehicle Info' : 'Add Vehicle to Fleet'}
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

export default AdminAddCar;
