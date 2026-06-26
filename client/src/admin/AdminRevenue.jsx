import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRevenue, addRevenue, deleteRevenue } from '../utils/api';

const AdminRevenue = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Stats
  const [financials, setFinancials] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
  });

  // Expense form
  const [form, setForm] = useState({
    amount: '',
    category: 'maintenance', // maintenance, insurance, fuel, salaries, taxes, marketing, other
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const res = await getRevenue({ limit: 100 });
      const revRecords = res.data?.records || res.data || [];
      setRecords(revRecords);

      // Calculate totals
      let inc = 0;
      let exp = 0;
      revRecords.forEach((r) => {
        if (r.type === 'income') inc += r.amount;
        else exp += r.amount;
      });

      setFinancials({
        totalIncome: inc,
        totalExpense: exp,
        netProfit: inc - exp,
      });
    } catch (err) {
      addToast('Failed to load financial ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      addToast('Please enter amount and description.', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        type: 'expense',
      };
      await addRevenue(payload);
      addToast('Expense recorded successfully!', 'success');
      setForm({
        amount: '',
        category: 'maintenance',
        description: '',
        date: new Date().toISOString().slice(0, 10),
      });
      fetchFinancialData();
    } catch (err) {
      addToast('Error logging operational cost.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Remove this transaction record from ledger?')) return;
    try {
      await deleteRevenue(id);
      addToast('Record deleted.', 'success');
      fetchFinancialData();
    } catch (err) {
      addToast('Error deleting ledger record.', 'error');
    }
  };

  // Compile monthly bar chart data
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap = months.reduce((acc, m) => {
      acc[m] = { month: m, Income: 0, Expense: 0 };
      return acc;
    }, {});

    records.forEach((r) => {
      const date = new Date(r.date);
      const m = months[date.getMonth()];
      if (r.type === 'income') dataMap[m].Income += r.amount;
      else dataMap[m].Expense += r.amount;
    });

    return Object.values(dataMap);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-page-content"
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Revenue & Costing Ledger</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review cashflow, log maintenance expenses, and analyze net profit charts</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Gross Revenues</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#4ade80' }}>${financials.totalIncome.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Operational Expenses</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>${financials.totalExpense.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>Company Net Profit</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: financials.netProfit >= 0 ? '#60a5fa' : '#ef4444' }}>
            ${financials.netProfit.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', marginBottom: '32px' }}>
        {/* Chart */}
        <div className="card" style={{ padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Monthly Income vs Expense</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize="11" />
                <YAxis stroke="var(--text-secondary)" fontSize="11" />
                <Tooltip contentStyle={{ background: '#0d1421', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Income" fill="#e63312" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log Expense Form */}
        <div className="card" style={{ padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Record Fleet Expense</h3>
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Expense Cost ($) *</label>
              <input 
                type="number" name="amount" value={form.amount} onChange={handleChange} 
                placeholder="e.g. 350" required
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Category</label>
              <select 
                name="category" value={form.category} onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px', background: '#0d1421', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              >
                <option value="maintenance">Maintenance & Repairs</option>
                <option value="insurance">Fleet Insurance</option>
                <option value="fuel">Fuel Surcharges</option>
                <option value="salaries">Salaries & Commissions</option>
                <option value="marketing">Google Ads / Marketing</option>
                <option value="taxes">Local Taxes</option>
                <option value="other">Other Overhead costs</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Description *</label>
              <input 
                type="text" name="description" value={form.description} onChange={handleChange} 
                placeholder="e.g. Porsche engine oil change & filters replacement" required
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px' }}>Record Date</label>
              <input 
                type="date" name="date" value={form.date} onChange={handleChange} 
                required
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={submitLoading}
              className="btn btn-primary w-full"
              style={{ padding: '12px 14px', fontWeight: 700 }}
            >
              {submitLoading ? 'Logging cost details...' : 'Record Transaction'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Ledger List */}
      <div className="card" style={{ padding: '0px', overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>Ledger Statement Records</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
        ) : records.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Type</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{r.description}</td>
                  <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>{r.category || 'Booking'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: r.type === 'income' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: r.type === 'income' ? '#4ade80' : '#f87171'
                    }}>
                      {r.type?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: r.type === 'income' ? '#4ade80' : '#f87171' }}>
                    {r.type === 'income' ? '+' : '-'}${r.amount}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {r.category ? (
                      <button 
                        onClick={() => handleDeleteRecord(r._id)} 
                        className="btn btn-secondary btn-sm" 
                        style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        Delete
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto Invoice</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No transaction records located in ledger.
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

export default AdminRevenue;
