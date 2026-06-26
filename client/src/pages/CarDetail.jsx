import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { getCar, getCarReviews } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './CarDetail.css';

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, reviewsRes] = await Promise.all([
          getCar(id),
          getCarReviews(id),
        ]);
        setCar(carRes.data.car);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner"/>
    </div>
  );

  if (!car) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, paddingTop: 80 }}>
      <h2>Car not found</h2>
      <Link to="/cars" className="btn btn-primary">Browse All Cars</Link>
    </div>
  );

  const images = car.images?.length > 0 ? car.images : [];
  const specs = [
    { label: 'Brand', value: car.brand, icon: '🏷️' },
    { label: 'Model', value: car.model, icon: '🚗' },
    { label: 'Year', value: car.year, icon: '📅' },
    { label: 'Type', value: car.type?.charAt(0).toUpperCase() + car.type?.slice(1), icon: '📋' },
    { label: 'Fuel', value: car.fuel?.charAt(0).toUpperCase() + car.fuel?.slice(1), icon: '⛽' },
    { label: 'Transmission', value: car.transmission?.charAt(0).toUpperCase() + car.transmission?.slice(1), icon: '⚙️' },
    { label: 'Seats', value: `${car.seats} Seats`, icon: '💺' },
    { label: 'Engine', value: car.engineCC || 'N/A', icon: '🔧' },
    { label: 'Mileage', value: car.mileage || 'N/A', icon: '📊' },
    { label: 'Color', value: car.color, icon: '🎨' },
    { label: 'AC', value: car.ac ? 'Yes' : 'No', icon: '❄️' },
    { label: 'GPS', value: car.gps ? 'Yes' : 'No', icon: '🗺️' },
  ];

  return (
    <>
      <Helmet>
        <title>{car.name || `${car.brand} ${car.model}`} – PrimeCarz Car Rental</title>
        <meta name="description" content={`Rent ${car.brand} ${car.model} (${car.year}) at ₹${car.pricePerDay}/day. ${car.type} car with ${car.seats} seats, ${car.fuel} fuel. Book now on PrimeCarz.`} />
        <link rel="canonical" href={`https://primecarz.com/cars/${id}`} />
      </Helmet>

      <div className="car-detail-page">
        {/* Breadcrumb */}
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/cars">Cars</Link>
            <span>/</span>
            <span>{car.name || `${car.brand} ${car.model}`}</span>
          </div>
        </div>

        <div className="container car-detail-layout">
          {/* Gallery */}
          <motion.div className="car-gallery" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="gallery-main">
              {images.length > 0 ? (
                <img src={images[activeImg]} alt={car.name} loading="lazy"/>
              ) : (
                <div className="gallery-placeholder">
                  <svg viewBox="0 0 120 80" fill="none" style={{width: 180}}>
                    <rect x="5" y="25" width="110" height="38" rx="8" fill="rgba(230,51,18,0.12)" stroke="rgba(230,51,18,0.3)" strokeWidth="2"/>
                    <path d="M20 25L30 8h60l10 17" stroke="rgba(230,51,18,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="28" cy="63" r="10" fill="rgba(230,51,18,0.25)" stroke="rgba(230,51,18,0.5)" strokeWidth="2"/>
                    <circle cx="92" cy="63" r="10" fill="rgba(230,51,18,0.25)" stroke="rgba(230,51,18,0.5)" strokeWidth="2"/>
                    <circle cx="28" cy="63" r="5" fill="rgba(230,51,18,0.6)"/>
                    <circle cx="92" cy="63" r="5" fill="rgba(230,51,18,0.6)"/>
                  </svg>
                  <p>{car.brand} {car.model}</p>
                </div>
              )}

              {/* Badges overlay */}
              <div className="gallery-badges">
                {!car.available && <span className="badge badge-danger">Not Available</span>}
                {car.featured && <span className="badge badge-warning">⭐ Featured</span>}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`}/>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info Panel */}
          <motion.div className="car-info-panel" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="car-info-header">
              <div>
                <h1 className="car-detail-name">{car.name || `${car.brand} ${car.model}`}</h1>
                <p className="car-detail-sub">{car.brand} • {car.model} • {car.year}</p>
              </div>
              {car.rating > 0 && (
                <div className="car-rating-badge">
                  <span>★ {Number(car.rating).toFixed(1)}</span>
                  <small>({car.totalReviews} reviews)</small>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="car-pricing-card">
              <div className="pricing-main">
                <span className="pricing-amount">₹{car.pricePerDay?.toLocaleString()}</span>
                <span className="pricing-unit">per day</span>
              </div>
              <div className="pricing-details">
                {car.securityDeposit > 0 && (
                  <span>Security Deposit: ₹{car.securityDeposit?.toLocaleString()}</span>
                )}
                <span>Daily Limit: {car.mileageLimit}km</span>
              </div>
            </div>

            {/* CTA */}
            <div className="car-cta">
              {car.available ? (
                <Link to={`/book/${car._id}`} className="btn btn-primary btn-lg btn-full">
                  🚗 Book This Car
                </Link>
              ) : (
                <button className="btn btn-full" style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'not-allowed', padding: '18px'}}>
                  ❌ Currently Unavailable
                </button>
              )}
              <a
                href={`https://wa.me/919876543210?text=Hi! I want to book ${car.name || car.brand + ' ' + car.model}`}
                className="btn btn-outline btn-lg btn-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Enquire on WhatsApp
              </a>
            </div>

            {/* Quick Features */}
            <div className="car-quick-specs">
              <div className="qs-item">
                <span>💺</span>
                <span>{car.seats} Seats</span>
              </div>
              <div className="qs-item">
                <span>⛽</span>
                <span>{car.fuel?.charAt(0).toUpperCase() + car.fuel?.slice(1)}</span>
              </div>
              <div className="qs-item">
                <span>⚙️</span>
                <span>{car.transmission === 'automatic' ? 'Auto' : 'Manual'}</span>
              </div>
              <div className="qs-item">
                <span>❄️</span>
                <span>{car.ac ? 'AC' : 'No AC'}</span>
              </div>
            </div>

            {/* Highlights */}
            {car.features?.length > 0 && (
              <div className="car-features">
                <h3 className="detail-section-title">Features & Amenities</h3>
                <div className="features-grid">
                  {car.features.map((f, i) => (
                    <div key={i} className="feature-chip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:14,height:14,color:'var(--primary)'}}><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Full Specs & Description */}
        <div className="container">
          <div className="car-tabs-section">
            {/* Specs Table */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="detail-section-title">Full Specifications</h2>
              <div className="specs-grid">
                {specs.map((spec, i) => (
                  <div key={i} className="spec-card">
                    <span className="spec-icon">{spec.icon}</span>
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            {car.description && (
              <motion.div className="car-description" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="detail-section-title">About This Car</h2>
                <p>{car.description}</p>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="detail-section-title">Customer Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar-sm">{review.user?.name?.charAt(0)}</div>
                        <div>
                          <p className="review-user-name">{review.user?.name}</p>
                          <div className="review-stars-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        </div>
                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarDetail;
