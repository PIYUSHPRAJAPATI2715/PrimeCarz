import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate sending email
    setTimeout(() => {
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="contact-page-container">
      <Helmet>
        <title>Contact Us | PrimeCarz Customer Care</title>
        <meta name="description" content="Have questions? Reach out to PrimeCarz. Support is available 24/7 via phone, email, WhatsApp, or contact form." />
      </Helmet>

      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Contact Us</h1>
          <p className="page-hero-sub">We are available 24/7 to assist with your premium rental experience</p>
        </div>
      </div>

      <div className="contact-main container">
        <div className="contact-grid">
          {/* Contact Details Panel */}
          <motion.div 
            className="contact-info-panel"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Get in Touch</h2>
            <p className="intro-text">
              Have questions about booking details, pricing, insurance, or corporate reservations? Feel free to contact our support team.
            </p>

            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <h4>Headquarters Address</h4>
                  <p>750 Fifth Avenue, Suite 101, New York, NY 10019</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📞</span>
                <div>
                  <h4>Telephone Support</h4>
                  <p>+1 (800) 555-0199 (US Toll-Free)</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div>
                  <h4>Email Queries</h4>
                  <p>support@primecarz.com</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🕒</span>
                <div>
                  <h4>Business Hours</h4>
                  <p>Mon - Sun: 08:00 AM - 10:00 PM EST</p>
                </div>
              </div>
            </div>

            {/* Quick Whatsapp CTA */}
            <div className="whatsapp-box card">
              <div>
                <h4>Chat on WhatsApp</h4>
                <p>Average response time: Under 2 minutes</p>
              </div>
              <a 
                href="https://wa.me/18005550199" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary whatsapp-btn"
              >
                💬 Chat Now
              </a>
            </div>
          </motion.div>

          {/* Form Panel */}
          <motion.div 
            className="contact-form-panel card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Send Message</h3>
            
            {success ? (
              <motion.div 
                className="contact-success"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div className="success-icon">✓</div>
                <h4>Message Sent Successfully!</h4>
                <p>
                  Thank you for contacting PrimeCarz. Our customer support team has received your message and will respond to you shortly.
                </p>
                <button 
                  type="button" 
                  className="btn btn-secondary mt-10" 
                  onClick={() => setSuccess(false)}
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                {error && <div className="contact-err">⚠️ {error}</div>}

                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
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
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Booking modifications, Car Enquiry"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your query in detail..."
                    rows="5"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full submit-contact-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Map block */}
        <motion.div 
          className="map-wrapper card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3>Our Location</h3>
          <div className="map-iframe-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.142293795014!2d-73.97325268459371!3d40.764770979326444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258f9cfb8da47%3A0x2db485590928b9aa!2sFifth%20Ave%2C%20New%20York%2C%20NY%2010019!5e0!3m2!1sen!2s!4v1687000000000!5m2!1sen!2s" 
              width="100%" 
              height="350" 
              style={{ border: 0, borderRadius: 'var(--radius-lg)' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="PrimeCarz Headquarters Map"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
