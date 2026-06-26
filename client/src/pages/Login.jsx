import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login as loginAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from || '/';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginAPI(form);
      const { token, user } = res.data;
      login(user, token);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow-1"></div>
      <div className="auth-glow-2"></div>
      
      <motion.div 
        className="auth-card card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <div className="auth-logo">🚗</div>
          <h2>Welcome Back</h2>
          <p>Login to your PrimeCarz account to book cars</p>
        </div>

        {error && (
          <motion.div 
            className="auth-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
