import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { createPaymentOrder, verifyPayment } from '../utils/api';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, cash
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Card details state
  const [cardForm, setCardForm] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // UPI details state
  const [upiId, setUpiId] = useState('');

  // Order Details from Backend
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    if (!booking) {
      navigate('/cars');
      return;
    }

    // Call backend to create Razorpay/Mock order
    setLoading(true);
    createPaymentOrder({ bookingId: booking._id })
      .then((res) => {
        if (res.data.success) {
          setOrderInfo(res.data);
        } else {
          setError('Failed to initialize payment gateway.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error establishing connection with payment processor.');
        setLoading(false);
      });
  }, [booking, navigate]);

  const handleCardChange = (e) => {
    setCardForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!orderInfo) return;

    setLoading(true);
    setError('');

    // If it's a real Razorpay payment (not mock)
    if (!orderInfo.isMock && orderInfo.key !== 'mock_key') {
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        setError('Razorpay SDK failed to load. Are you offline?');
        setLoading(false);
        return;
      }

      const options = {
        key: orderInfo.key,
        amount: orderInfo.order.amount,
        currency: orderInfo.order.currency,
        name: 'PrimeCarz Rental',
        description: `Booking for ${booking.bookingId}`,
        order_id: orderInfo.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            if (verifyRes.data.success) {
              navigate('/booking-confirmed', { state: { bookingId: booking._id } });
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            setError('Payment verification API error.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: booking.customerName,
          email: booking.customerEmail,
          contact: booking.customerPhone,
        },
        theme: {
          color: '#e63312',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } else {
      // Mock payment simulation
      setTimeout(async () => {
        try {
          const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
          const verifyRes = await verifyPayment({
            razorpay_order_id: orderInfo.order.id,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: 'mock_signature',
            bookingId: booking._id,
          });

          if (verifyRes.data.success) {
            navigate('/booking-confirmed', { state: { bookingId: booking._id } });
          } else {
            setError('Mock payment failed verification.');
          }
        } catch (err) {
          setError('Mock payment error.');
        } finally {
          setLoading(false);
        }
      }, 2000);
    }
  };

  if (!booking) return null;

  return (
    <div className="payment-page-container">
      <Helmet>
        <title>Secure Payment | PrimeCarz</title>
        <meta name="description" content="Securely complete your car booking transaction. PrimeCarz SSL Encrypted Checkout." />
      </Helmet>

      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Secure Checkout</h1>
          <p className="page-hero-sub">Complete payment to confirm your booking</p>
        </div>
      </div>

      <div className="payment-main container">
        <div className="payment-grid">
          {/* Left panel: Payment Methods */}
          <motion.div 
            className="payment-methods-card card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Select Payment Option</h3>
            {error && <div className="payment-err">⚠️ {error}</div>}

            <div className="methods-tabs">
              <button 
                type="button" 
                className={`tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Credit / Debit Card
              </button>
              <button 
                type="button" 
                className={`tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                ⚡ UPI Transfer
              </button>
              <button 
                type="button" 
                className={`tab-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                💵 Pay At Counter
              </button>
            </div>

            <div className="payment-content-area">
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.form 
                    key="card"
                    onSubmit={handlePaymentSubmit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="payment-form"
                  >
                    <div className="form-group">
                      <label>Card Number</label>
                      <input 
                        type="text" 
                        name="number" 
                        value={cardForm.number}
                        onChange={handleCardChange}
                        placeholder="4111 2222 3333 4444" 
                        maxLength="19"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={cardForm.name}
                        onChange={handleCardChange}
                        placeholder="John Doe" 
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiration Date</label>
                        <input 
                          type="text" 
                          name="expiry" 
                          value={cardForm.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY" 
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input 
                          type="password" 
                          name="cvv" 
                          value={cardForm.cvv}
                          onChange={handleCardChange}
                          placeholder="•••" 
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full pay-btn"
                      disabled={loading}
                    >
                      {loading ? 'Processing Transaction...' : `Pay Total $${booking.totalCost}`}
                    </button>
                  </motion.form>
                )}

                {paymentMethod === 'upi' && (
                  <motion.div 
                    key="upi"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="upi-payment-panel"
                  >
                    <div className="qr-box">
                      <div className="qr-placeholder">
                        <span>📲 Scan QR Code</span>
                        <div className="qr-sim"></div>
                        <span className="qr-timer">Expires in: 04:59</span>
                      </div>
                      <p className="qr-instruction">
                        Scan the QR code using any UPI app (GPay, PhonePe, Paytm) to complete payment.
                      </p>
                    </div>

                    <div className="or-divider">
                      <span>OR ENTER UPI ID</span>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="upi-id-form">
                      <div className="form-group">
                        <input 
                          type="text" 
                          placeholder="john@okaxis" 
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary w-full pay-btn"
                        disabled={loading}
                      >
                        {loading ? 'Verifying Transfer...' : 'Verify & Pay'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {paymentMethod === 'cash' && (
                  <motion.div 
                    key="cash"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="cash-payment-panel"
                  >
                    <div className="cash-info-box">
                      <h4>Cash Payment / Bank Transfer Instructions</h4>
                      <p>
                        You can pay with Cash directly at our pickup desk, or make a bank transfer using the details below:
                      </p>
                      
                      <div className="bank-details">
                        <div className="bank-row"><strong>Bank Name:</strong> Prime Global Bank</div>
                        <div className="bank-row"><strong>Account Name:</strong> PrimeCarz Rentals LLC</div>
                        <div className="bank-row"><strong>Account Number:</strong> 1209 8834 9912</div>
                        <div className="bank-row"><strong>Routing Code:</strong> PGBKUS33XXX</div>
                      </div>

                      <p className="note">
                        ⚠️ Please share a copy of your bank deposit slip or transaction reference during car pickup.
                      </p>
                    </div>

                    <button 
                      type="button" 
                      className="btn btn-primary w-full pay-btn"
                      onClick={handlePaymentSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Confirming Booking...' : 'Confirm Offline Booking'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right panel: Summary */}
          <motion.div 
            className="payment-summary-sidebar"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card billing-summary-card">
              <h3>Billing Summary</h3>
              <div className="billing-details">
                <div className="detail-row">
                  <span>Booking Reference</span>
                  <span className="ref-code">{booking.bookingId}</span>
                </div>
                <div className="detail-row">
                  <span>Pick-up Location</span>
                  <span>{booking.pickupLocation}</span>
                </div>
                <div className="detail-row">
                  <span>Drop-off Location</span>
                  <span>{booking.dropLocation}</span>
                </div>
                <div className="detail-row">
                  <span>Rental Period</span>
                  <span>{new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()} ({booking.totalDays} {booking.totalDays === 1 ? 'Day' : 'Days'})</span>
                </div>
              </div>

              <hr />

              <div className="billing-totals">
                <div className="total-item">
                  <span>Rent Subtotal</span>
                  <span>${booking.subtotal}</span>
                </div>
                {booking.driverCharge > 0 && (
                  <div className="total-item">
                    <span>Driver Service</span>
                    <span>${booking.driverCharge}</span>
                  </div>
                )}
                <div className="total-item">
                  <span>Security Deposit</span>
                  <span>${booking.securityDeposit}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="total-item discount-val">
                    <span>Coupon Discount</span>
                    <span>-${booking.discountAmount}</span>
                  </div>
                )}
                <hr />
                <div className="total-item final-total">
                  <span>Amount to Pay</span>
                  <span>${booking.totalCost}</span>
                </div>
              </div>
            </div>

            <div className="security-assure">
              🔒 256-bit SSL Encrypted Transaction. Your payment credentials are never stored.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
