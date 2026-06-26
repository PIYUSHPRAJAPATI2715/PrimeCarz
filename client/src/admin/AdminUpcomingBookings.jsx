import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllBookings } from '../utils/api';

const AdminUpcomingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const fetchUpcomingBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings({
        status: 'confirmed',
        limit: 100
      });
      // Filter only future pick-ups
      const now = new Date();
      const upcoming = (res.data.bookings || []).filter(b => new Date(b.pickupDate) >= now);
      setBookings(upcoming);
    } catch (err) {
      console.error('Failed to load upcoming bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (pickupDateString) => {
    const pickup = new Date(pickupDateString);
    const now = new Date();
    const diff = pickup.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 0 ? 'Starts Today' : `In ${days} ${days === 1 ? 'Day' : 'Days'}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page-content"
    >
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Upcoming Bookings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track future customer pickups, countdowns, and preparation tasks</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
      ) : bookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((b) => (
            <motion.div 
              key={b._id}
              className="card" 
              style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}
              whileHover={{ borderColor: 'var(--border-hover)' }}
            >
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Countdown Badge */}
                <div style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(230, 51, 18, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary-light)', textAlign: 'center', minWidth: '110px' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Countdown</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>{getDaysRemaining(b.pickupDate)}</div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                    {b.car?.brand} {b.car?.model}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    Customer: <strong>{b.customerName}</strong> ({b.customerPhone})
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>📍 Pick: {b.pickupLocation}</span>
                    <span>📍 Drop: {b.dropLocation}</span>
                  </div>
                </div>
              </div>

              {/* Dates & Totals */}
              <div style={{ textAlign: 'right', minWidth: '200px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {new Date(b.pickupDate).toLocaleDateString()} - {new Date(b.returnDate).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Duration: {b.totalDays} Days
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                  {b.paymentStatus === 'paid' ? '💳 PAID' : '💵 UNPAID'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No upcoming bookings in the pipeline.</p>
        </div>
      )}
    </motion.div>
  );
};

export default AdminUpcomingBookings;
