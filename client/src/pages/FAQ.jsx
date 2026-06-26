import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getFAQs } from '../utils/api';
import './FAQ.css';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    getFAQs()
      .then((res) => {
        setFaqs(res.data?.faqs || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load FAQ database. Showing fallback FAQs.');
        // Fallback FAQs if backend is not populated
        setFaqs([
          { question: 'What documents are required to rent a vehicle?', answer: 'You will need a valid driver\'s license, a major credit card under your name, and must be at least 21 years old (25 for high-performance supercars). International drivers need a valid passport and international driving permit.', order: 1 },
          { question: 'Is security deposit mandatory?', answer: 'Yes, a refundable security deposit is charged prior to car hand-off. The amount varies based on the vehicle class (ranging from $500 to $2500) and is fully refunded within 3-5 business days upon returning the car undamaged.', order: 2 },
          { question: 'Can I cancel or reschedule my reservation?', answer: 'Cancellations made 48 hours or more before the rental start time are fully refunded. Cancellations within 48 hours will incur a one-day rental fee charge. Rescheduling is free of charge subject to vehicle availability.', order: 3 },
          { question: 'Are fuel costs included in the rental price?', answer: 'Fuel is not included. You will receive the car with a full tank, and we ask that you return it with a full tank. An additional surcharge will apply if returned with a lower fuel level.', order: 4 },
        ]);
        setLoading(false);
      });
  }, []);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faq-page-container">
      <Helmet>
        <title>Frequently Asked Questions | PrimeCarz</title>
        <meta name="description" content="Got questions about renting luxury supercars? Read the PrimeCarz FAQ on policies, insurance, and booking cancellations." />
      </Helmet>

      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Support Center</h1>
          <p className="page-hero-sub">Got questions? We have compiled the answers to help you get rolling</p>
        </div>
      </div>

      <div className="faq-main container">
        {/* Search Bar */}
        <div className="faq-search-box">
          <input 
            type="text" 
            placeholder="Search questions or keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* FAQ Accordion */}
        <div className="faq-list">
          {loading ? (
            <div className="faq-loading">
              <div className="spinner"></div>
              <p>Fetching FAQ entries...</p>
            </div>
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = activeIndex === idx;
              return (
                <div key={idx} className={`faq-item card ${isOpen ? 'active' : ''}`}>
                  <button 
                    type="button" 
                    className="faq-question-btn" 
                    onClick={() => handleToggle(idx)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-arrow">{isOpen ? '−' : '+'}</span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div 
                        className="faq-answer-wrapper"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="faq-answer-content">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="no-faqs">
              <p>No matches found for "{search}". Please try another keyword.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <motion.div 
          className="faq-cta-box card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3>Still have questions?</h3>
          <p>If you couldn't find what you were looking for, reach out to our elite booking concierge directly.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary">Contact Support</Link>
            <Link to="/add-car-enquiry" className="btn btn-secondary">Enquire to Host a Car</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
