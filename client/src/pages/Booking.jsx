import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getCar, createBooking, validateCoupon } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Booking.css';

const Booking = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [form, setForm] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    dropDate: '',
    withDriver: false,
    couponCode: '',
  });

  // Coupon state
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountVal, setDiscountVal] = useState(0);

  // Price calculations
  const [calc, setCalc] = useState({
    days: 0,
    subtotal: 0,
    driverCharge: 0,
    securityDeposit: 0,
    discountAmount: 0,
    total: 0,
  });

  // Authentication check
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isLoggedIn, navigate, location]);

  // Fetch Car details
  useEffect(() => {
    getCar(carId)
      .then((res) => {
        setCar(res.data.car || res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Car details could not be loaded. Please check the URL or try again.');
        setLoading(false);
      });
  }, [carId]);

  // Recalculate cost when form, car, or coupon changes
  useEffect(() => {
    if (!car || !form.pickupDate || !form.dropDate) {
      setCalc({
        days: 0,
        subtotal: 0,
        driverCharge: 0,
        securityDeposit: car ? car.securityDeposit : 0,
        discountAmount: 0,
        total: car ? car.securityDeposit : 0,
      });
      return;
    }

    const start = new Date(form.pickupDate);
    const end = new Date(form.dropDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setCalc((prev) => ({ ...prev, days: 0, subtotal: 0, total: car.securityDeposit, discountAmount: 0 }));
      return;
    }

    const subtotal = car.pricePerDay * diffDays;
    const driverCharge = form.withDriver ? diffDays * 500 : 0;
    const deposit = car.securityDeposit || 0;

    let discount = 0;
    if (appliedCoupon) {
      if (subtotal >= appliedCoupon.minOrderAmount) {
        if (appliedCoupon.discountType === 'percentage') {
          discount = (subtotal * appliedCoupon.discountValue) / 100;
          if (appliedCoupon.maxDiscountAmount > 0) {
            discount = Math.min(discount, appliedCoupon.maxDiscountAmount);
          }
        } else {
          discount = appliedCoupon.discountValue;
        }
      }
    }

    const total = subtotal + driverCharge + deposit - discount;

    setCalc({
      days: diffDays,
      subtotal,
      driverCharge,
      securityDeposit: deposit,
      discountAmount: discount,
      total,
    });
  }, [form.pickupDate, form.dropDate, form.withDriver, car, appliedCoupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleApplyCoupon = async () => {
    if (!form.couponCode) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await validateCoupon({ 
        code: form.couponCode, 
        orderAmount: calc.subtotal 
      });
      setAppliedCoupon(res.data.coupon);
      setDiscountVal(res.data.coupon.discountValue);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setForm((prev) => ({ ...prev, couponCode: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pickupLocation || !form.dropLocation || !form.pickupDate || !form.dropDate) {
      setError('Please fill in all booking fields.');
      return;
    }
    if (calc.days <= 0) {
      setError('Drop-off date must be at least one day after pick-up date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const bookingData = {
        carId,
        pickupLocation: form.pickupLocation,
        dropLocation: form.dropLocation,
        pickupDate: form.pickupDate,
        returnDate: form.dropDate,
        withDriver: form.withDriver,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        paymentMethod: 'card', // default method, will confirm on payment page
      };

      const res = await createBooking(bookingData);
      if (res.data.success) {
        navigate('/payment', { state: { booking: res.data.booking } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="spinner"></div>
        <p>Loading luxury vehicle details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="booking-error-page">
        <h2>Something went wrong</h2>
        <p>{error || 'Vehicle details could not be found.'}</p>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      <Helmet>
        <title>Book {car.brand} {car.model} | PrimeCarz</title>
        <meta name="description" content={`Book the perfect ${car.brand} ${car.model} at PrimeCarz. Premium rental experience with live booking tracker.`} />
      </Helmet>

      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Complete Your Booking</h1>
          <p className="page-hero-sub">You are one step away from driving your dream ride</p>
        </div>
      </div>

      <div className="booking-main container">
        <div className="booking-grid">
          {/* Booking Form Card */}
          <motion.div 
            className="booking-form-card card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Rental Details</h3>
            {error && <div className="booking-err">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Pick-up Location</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={form.pickupLocation}
                  onChange={handleChange}
                  placeholder="e.g. JFK Airport, Terminal 1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Drop-off Location</label>
                <input
                  type="text"
                  name="dropLocation"
                  value={form.dropLocation}
                  onChange={handleChange}
                  placeholder="e.g. Downtown Hotel"
                  required
                />
              </div>

              <div className="dates-row">
                <div className="form-group">
                  <label>Pick-up Date & Time</label>
                  <input
                    type="datetime-local"
                    name="pickupDate"
                    value={form.pickupDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Drop-off Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dropDate"
                    value={form.dropDate}
                    onChange={handleChange}
                    min={form.pickupDate || new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              </div>

              <div className="driver-toggle-box">
                <div className="toggle-text">
                  <h4>Request Professional Driver</h4>
                  <p>Add a certified professional driver for +$500/day</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="withDriver"
                    checked={form.withDriver}
                    onChange={handleChange}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              {/* Coupon input */}
              <div className="coupon-box">
                <label>Apply Coupon Code</label>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    name="couponCode"
                    value={form.couponCode}
                    onChange={handleChange}
                    placeholder="ENTER CODE"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleRemoveCoupon}>
                      Remove
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm" 
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !form.couponCode}
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="coupon-msg error-msg">{couponError}</p>}
                {appliedCoupon && (
                  <p className="coupon-msg success-msg">
                    🎉 Coupon <strong>{appliedCoupon.code}</strong> applied! 
                    Discount: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full submit-booking-btn"
                disabled={submitting}
              >
                {submitting ? 'Generating Booking...' : 'Proceed to Secure Payment'}
              </button>
            </form>
          </motion.div>

          {/* Checkout Info Sidebar */}
          <motion.div 
            className="booking-summary-sidebar"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Car Preview Card */}
            <div className="card summary-car-card">
              <img 
                src={car.thumbnail || (car.images && car.images[0]) || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500'} 
                alt={`${car.brand} ${car.model}`}
                className="summary-car-img"
              />
              <div className="summary-car-info">
                <span className="car-badge">{car.type}</span>
                <h4>{car.brand} {car.model}</h4>
                <p className="car-price">${car.pricePerDay}<span>/ day</span></p>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="card summary-calc-card">
              <h3>Pricing Summary</h3>
              <div className="calc-row">
                <span>Daily Rent Rate</span>
                <span>${car.pricePerDay}</span>
              </div>
              <div className="calc-row">
                <span>Rental Duration</span>
                <span>{calc.days} {calc.days === 1 ? 'Day' : 'Days'}</span>
              </div>

              <hr />

              <div className="calc-row">
                <span>Rent Subtotal</span>
                <span>${calc.subtotal}</span>
              </div>

              {calc.driverCharge > 0 && (
                <div className="calc-row">
                  <span>Driver Service Fee</span>
                  <span>+${calc.driverCharge}</span>
                </div>
              )}

              <div className="calc-row">
                <span>Refundable Security Deposit</span>
                <span>+${calc.securityDeposit}</span>
              </div>

              {calc.discountAmount > 0 && (
                <div className="calc-row discount-row">
                  <span>Promo Coupon Discount</span>
                  <span>-${calc.discountAmount}</span>
                </div>
              )}

              <hr />

              <div className="calc-row total-row">
                <span>Estimated Total</span>
                <span>${calc.total}</span>
              </div>

              <p className="deposit-note">
                ℹ️ The security deposit of ${calc.securityDeposit} is fully refunded upon returning the vehicle in its original condition.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
