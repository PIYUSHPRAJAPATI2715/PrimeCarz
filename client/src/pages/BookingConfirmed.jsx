import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getBooking } from '../utils/api';
import './BookingConfirmed.css';

const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      navigate('/cars');
      return;
    }

    getBooking(bookingId)
      .then((res) => {
        if (res.data.success) {
          setBooking(res.data.booking);
        } else {
          setError('Booking confirmation details could not be retrieved.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error connecting to Server to fetch booking details.');
        setLoading(false);
      });
  }, [bookingId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="confirmed-loading">
        <div className="spinner"></div>
        <p>Confirming your payment and reservation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="confirmed-error container">
        <h2>Booking Retrieval Error</h2>
        <p>{error || 'We could not fetch your booking. Please check your profile dashboard.'}</p>
        <Link to="/" className="btn btn-primary">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="booking-confirmed-page">
      <Helmet>
        <title>Reservation Confirmed | PrimeCarz</title>
        <meta name="description" content="Your luxury car reservation has been successfully completed. View invoice and receipt details." />
      </Helmet>

      <div className="container confirmed-content">
        {/* Animated Checkmark */}
        <div className="success-banner">
          <motion.div 
            className="checkmark-circle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="checkmark-icon">✓</div>
          </motion.div>
          <h2>Reservation Confirmed!</h2>
          <p className="success-msg">Your vehicle has been successfully reserved. A confirmation receipt has been sent to your email.</p>
        </div>

        {/* Invoice / Receipt card */}
        <motion.div 
          className="receipt-card card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="receipt-header">
            <h3>Rental Invoice</h3>
            <span className="booking-badge">Ref: {booking.bookingId}</span>
          </div>

          <div className="receipt-section">
            <h4>Vehicle Info</h4>
            <div className="receipt-row-data">
              <span><strong>Car model:</strong></span>
              <span>{booking.car?.brand} {booking.car?.model} ({booking.car?.year})</span>
            </div>
            <div className="receipt-row-data">
              <span><strong>Daily Rent Rate:</strong></span>
              <span>${booking.pricePerDay} / day</span>
            </div>
          </div>

          <hr />

          <div className="receipt-section">
            <h4>Rental Period & Location</h4>
            <div className="receipt-row-data">
              <span><strong>Pick-up Location:</strong></span>
              <span>{booking.pickupLocation}</span>
            </div>
            <div className="receipt-row-data">
              <span><strong>Drop-off Location:</strong></span>
              <span>{booking.dropLocation}</span>
            </div>
            <div className="receipt-row-data">
              <span><strong>Pick-up Date:</strong></span>
              <span>{new Date(booking.pickupDate).toLocaleString()}</span>
            </div>
            <div className="receipt-row-data">
              <span><strong>Drop-off Date:</strong></span>
              <span>{new Date(booking.returnDate).toLocaleString()}</span>
            </div>
            <div className="receipt-row-data">
              <span><strong>Total rental days:</strong></span>
              <span>{booking.totalDays} Days</span>
            </div>
          </div>

          <hr />

          <div className="receipt-section">
            <h4>Billing Summary</h4>
            <div className="receipt-row-data">
              <span>Rent Subtotal:</span>
              <span>${booking.subtotal}</span>
            </div>
            {booking.driverCharge > 0 && (
              <div className="receipt-row-data">
                <span>Driver Fee:</span>
                <span>${booking.driverCharge}</span>
              </div>
            )}
            <div className="receipt-row-data">
              <span>Refundable Deposit:</span>
              <span>${booking.securityDeposit}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="receipt-row-data discount-text">
                <span>Promo Discount:</span>
                <span>-${booking.discountAmount}</span>
              </div>
            )}
            <div className="receipt-row-data final-receipt-total">
              <span>Total Cost Paid:</span>
              <span>${booking.totalCost}</span>
            </div>
            <div className="receipt-row-data payment-status-badge">
              <span>Payment Method / Status:</span>
              <span>{booking.paymentMethod?.toUpperCase()} / <span className="paid-badge">{booking.paymentStatus?.toUpperCase()}</span></span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="action-buttons no-print">
          <button onClick={handlePrint} className="btn btn-secondary print-receipt-btn">
            🖨️ Print Receipt
          </button>
          <Link to="/cars" className="btn btn-primary">
            Browse More Cars
          </Link>
        </div>

        {/* Support section */}
        <div className="support-section no-print">
          <p>Need assistance or changes to your reservation?</p>
          <p>📧 support@primecarz.com | 📞 +1 (800) 555-0199</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmed;
