import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { submitEnquiry } from '../utils/api';
import './CarEnquiry.css';

const CarEnquiry = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    carModel: '',
    carYear: '',
    carBrand: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.carBrand || !form.carModel) {
      setError('Please fill in all required contact and vehicle fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await submitEnquiry(form);
      if (res.data.success || res.status === 201) {
        setSuccess(true);
        setForm({
          name: '',
          phone: '',
          email: '',
          carModel: '',
          carYear: '',
          carBrand: '',
          description: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enquiry-page-container">
      <Helmet>
        <title>Host Your Car | PrimeCarz Partner Program</title>
        <meta name="description" content="List your luxury or supercar on PrimeCarz and turn your asset into revenue. Submit your car specs and contact info now." />
      </Helmet>

      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Host Your Car</h1>
          <p className="page-hero-sub">Earn passive revenue by renting your luxury vehicle through PrimeCarz</p>
        </div>
      </div>

      <div className="enquiry-main container">
        <div className="enquiry-grid">
          {/* Information block */}
          <motion.div 
            className="enquiry-info-box"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Join the Prime Elite Network</h2>
            <p>
              Why let your vehicle sit idle in the garage when it can earn substantial revenue? We handle the entire process, including full insurance coverage, professional detail cleanings, customer verifications, and payouts.
            </p>

            <div className="partner-steps">
              <div className="step-item">
                <span className="step-badge">1</span>
                <div>
                  <h4>Submit Details</h4>
                  <p>Send details and photos of your luxury car using our secure host portal form.</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-badge">2</span>
                <div>
                  <h4>Vehicle Auditing</h4>
                  <p>Our fleet inspects the mechanical and detailing condition of your vehicle.</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-badge">3</span>
                <div>
                  <h4>Start Earning</h4>
                  <p>We list your car. Enjoy monthly passive payouts directly to your bank account.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div 
            className="enquiry-form-card card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3>Vehicle Listing Enquiry</h3>
            
            {success ? (
              <motion.div 
                className="enquiry-success"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div className="success-icon">✓</div>
                <h4>Enquiry Submitted!</h4>
                <p>
                  Thank you for submitting your vehicle. A PrimeCarz Host Representative will review the application and contact you within 24-48 hours.
                </p>
                <button 
                  type="button" 
                  className="btn btn-secondary mt-10" 
                  onClick={() => setSuccess(false)}
                >
                  Submit Another Vehicle
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="enquiry-form">
                {error && <div className="enquiry-err">⚠️ {error}</div>}

                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 0199"
                      required
                    />
                  </div>
                </div>

                <div className="form-row-three">
                  <div className="form-group">
                    <label>Car Brand *</label>
                    <input
                      type="text"
                      name="carBrand"
                      value={form.carBrand}
                      onChange={handleChange}
                      placeholder="e.g. Porsche"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input
                      type="text"
                      name="carModel"
                      value={form.carModel}
                      onChange={handleChange}
                      placeholder="e.g. 911 Carrera"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      name="carYear"
                      value={form.carYear}
                      onChange={handleChange}
                      placeholder="e.g. 2023"
                      min="2010"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Vehicle Description & Condition Notes</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell us about the features, history, colors, customization details or availability expectations."
                    rows="4"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full submit-enquiry-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting Application...' : 'Submit Listing Application'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CarEnquiry;
