import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllBookings } from '../utils/api';

const AdminCompletedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompletedBookings();
  }, [startDate, endDate]);

  const fetchCompletedBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings({
        status: 'completed',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 100
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load completed bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['Booking ID', 'Customer Name', 'Email', 'Car Model', 'Total Cost', 'Days', 'Completed Date'];
    const rows = bookings.map(b => [
      b.bookingId,
      b.customerName,
      b.customerEmail,
      `${b.car?.brand || ''} ${b.car?.model || ''}`,
      b.totalCost,
      b.totalDays,
      new Date(b.updatedAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Completed_Bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter(b => 
    b.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.car?.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page-content"
    >
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Completed Bookings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review all completed bookings, total revenues, and export history</p>
        </div>
        <button 
          onClick={handleExportCSV} 
          className="btn btn-primary" 
          disabled={bookings.length === 0}
        >
          📥 Export CSV Report
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Search bookings</label>
            <input 
              type="text" 
              placeholder="Ref ID, Customer or Car..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-primary)' }}>End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0px', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
        ) : filteredBookings.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Booking ID</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Car Details</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rent Duration</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Paid</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completion Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--primary-light)' }}>{b.bookingId}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.customerEmail}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                    {b.car?.brand} {b.car?.model}
                  </td>
                  <td style={{ padding: '16px 24px' }}>{b.totalDays} Days</td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#4ade80' }}>${b.totalCost}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                    {new Date(b.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No completed bookings found for the selected criteria.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminCompletedBookings;
