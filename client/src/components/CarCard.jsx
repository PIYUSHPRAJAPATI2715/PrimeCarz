import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './CarCard.css';

const CarCard = ({ car, index = 0 }) => {
  const fuelIcons = {
    petrol: '⛽',
    diesel: '🛢️',
    electric: '⚡',
    hybrid: '🔋',
    cng: '🌿',
  };

  const typeColors = {
    sedan: '#60a5fa',
    suv: '#4ade80',
    luxury: '#fbbf24',
    sports: '#f87171',
    hatchback: '#a78bfa',
    van: '#34d399',
    convertible: '#fb923c',
  };

  return (
    <motion.div
      className="car-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Image */}
      <div className="car-card-img">
        {car.thumbnail || car.images?.[0] ? (
          <img
            src={car.thumbnail || car.images[0]}
            alt={`${car.brand} ${car.model} rental`}
            loading="lazy"
          />
        ) : (
          <div className="car-card-placeholder">
            <svg viewBox="0 0 80 50" fill="none">
              <rect x="5" y="20" width="70" height="22" rx="5" fill="rgba(230,51,18,0.15)" stroke="rgba(230,51,18,0.3)" strokeWidth="1.5"/>
              <path d="M15 20L22 8h36l7 12" stroke="rgba(230,51,18,0.5)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="42" r="6" fill="rgba(230,51,18,0.3)" stroke="rgba(230,51,18,0.6)" strokeWidth="1.5"/>
              <circle cx="60" cy="42" r="6" fill="rgba(230,51,18,0.3)" stroke="rgba(230,51,18,0.6)" strokeWidth="1.5"/>
              <circle cx="20" cy="42" r="3" fill="rgba(230,51,18,0.6)"/>
              <circle cx="60" cy="42" r="3" fill="rgba(230,51,18,0.6)"/>
            </svg>
            <span>{car.brand} {car.model}</span>
          </div>
        )}

        {/* Type badge */}
        <div className="car-type-badge" style={{ color: typeColors[car.type] || '#60a5fa' }}>
          {car.type?.charAt(0).toUpperCase() + car.type?.slice(1)}
        </div>

        {/* Featured badge */}
        {car.featured && (
          <div className="car-featured-badge">⭐ Featured</div>
        )}

        {/* Not available overlay */}
        {!car.available && (
          <div className="car-unavailable-overlay">
            <span>Not Available</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="car-card-body">
        <div className="car-card-header">
          <div>
            <h3 className="car-name">{car.name || `${car.brand} ${car.model}`}</h3>
            <p className="car-brand">{car.brand} • {car.year}</p>
          </div>
          {car.rating > 0 && (
            <div className="car-rating">
              <span className="star">★</span>
              <span>{Number(car.rating).toFixed(1)}</span>
              <span className="rating-count">({car.totalReviews})</span>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="car-specs">
          <div className="spec-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <span>{car.seats} Seats</span>
          </div>
          <div className="spec-item">
            <span>{fuelIcons[car.fuel] || '⛽'}</span>
            <span>{car.fuel?.charAt(0).toUpperCase() + car.fuel?.slice(1)}</span>
          </div>
          <div className="spec-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <span>{car.transmission === 'automatic' ? 'Auto' : 'Manual'}</span>
          </div>
          {car.ac && (
            <div className="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>
              <span>AC</span>
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="car-card-footer">
          <div className="car-price">
            <span className="price-amount">₹{car.pricePerDay?.toLocaleString()}</span>
            <span className="price-unit">/day</span>
          </div>
          <Link
            to={`/cars/${car._id}`}
            className={`btn btn-primary btn-sm ${!car.available ? 'btn-disabled' : ''}`}
            style={!car.available ? { opacity: 0.5, pointerEvents: 'none' } : {}}
          >
            {car.available ? 'Book Now' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CarCard;
