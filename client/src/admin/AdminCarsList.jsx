import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getCars, deleteCar, toggleCarAvailability } from '../utils/api';

const AdminCarsList = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await getCars({ limit: 100 });
      setCars(res.data?.cars || res.data || []);
    } catch (err) {
      addToast('Failed to load cars list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await toggleCarAvailability(id);
      if (res.data.success) {
        addToast('Availability updated successfully!', 'success');
        setCars((prev) => 
          prev.map((car) => car._id === id ? { ...car, available: res.data.car.available } : car)
        );
      }
    } catch (err) {
      addToast('Error toggling availability.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from the fleet?')) return;
    try {
      const res = await deleteCar(id);
      if (res.data.success) {
        addToast('Vehicle removed from database.', 'success');
        setCars((prev) => prev.filter((car) => car._id !== id));
      }
    } catch (err) {
      addToast('Error removing car from fleet.', 'error');
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Fleet Catalog</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage company-owned vehicles, rates, features and booking availability</p>
        </div>
        <Link to="/admin/cars/add" className="btn btn-primary">
          ➕ Register New Car
        </Link>
      </div>

      <div className="card" style={{ padding: '0px', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
        ) : cars.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Car</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category / Spec</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Rate</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img 
                        src={car.thumbnail || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=100'} 
                        alt={car.name} 
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800 }}>{car.brand} {car.model}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Year: {car.year}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{car.type}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{car.transmission} | {car.fuel}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>${car.pricePerDay} / day</td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      type="button"
                      onClick={() => handleToggleAvailability(car._id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: car.available ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: car.available ? '#4ade80' : '#f87171',
                        border: car.available ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'
                      }}
                    >
                      {car.available ? '● Available' : '● Booked Out'}
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <Link to={`/admin/cars/edit/${car._id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        ✏️ Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(car._id)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
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
            No cars registered in the database yet. Click Register to add one.
          </div>
        )}
      </div>

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

export default AdminCarsList;
