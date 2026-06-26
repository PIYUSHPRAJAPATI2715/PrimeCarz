import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import CarCard from '../components/CarCard';
import { getCars, getAllReviews, getSettings } from '../utils/api';
import './Home.css';

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({ type: '', pickupDate: '', returnDate: '' });
  const navigate = useNavigate();

  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, reviewsRes, settingsRes] = await Promise.all([
          getCars({ featured: true, limit: 6 }),
          getAllReviews(),
          getSettings(),
        ]);
        setFeaturedCars(carsRes.data.cars || []);
        setReviews(reviewsRes.data.reviews || []);
        setSettings(settingsRes.data.settings || {});
      } catch (err) {
        // Use fallback data if API not connected
        setFeaturedCars([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchQuery);
    navigate(`/cars?${params.toString()}`);
  };

  const stats = [
    { value: settings.totalCars || 150, label: 'Premium Cars', suffix: '+', icon: '🚗' },
    { value: settings.totalCities || 25, label: 'Cities', suffix: '+', icon: '🏙️' },
    { value: settings.totalCustomers || 10000, label: 'Happy Customers', suffix: '+', icon: '😊' },
    { value: settings.totalRating || 4.9, label: 'Average Rating', suffix: '★', decimals: 1, icon: '⭐' },
  ];

  const howToSteps = [
    {
      step: '01',
      icon: '🔍',
      title: 'Search & Choose',
      desc: 'Browse our premium fleet. Filter by type, fuel, price and more to find your perfect car.',
      color: '#e63312',
    },
    {
      step: '02',
      icon: '📅',
      title: 'Book Instantly',
      desc: 'Select your dates, pickup & drop location. Apply coupon codes for extra savings.',
      color: '#f5a623',
    },
    {
      step: '03',
      icon: '💳',
      title: 'Pay Securely',
      desc: 'Pay via Razorpay, UPI, card or cash. 100% secure payment gateway.',
      color: '#4ade80',
    },
    {
      step: '04',
      icon: '🚀',
      title: 'Hit the Road!',
      desc: 'Get your booking confirmation instantly and drive your dream car.',
      color: '#60a5fa',
    },
  ];

  const carTypes = [
    { label: 'Sedan', icon: '🚗', type: 'sedan', count: '20+' },
    { label: 'SUV', icon: '🚙', type: 'suv', count: '15+' },
    { label: 'Luxury', icon: '💎', type: 'luxury', count: '10+' },
    { label: 'Sports', icon: '🏎️', type: 'sports', count: '8+' },
    { label: 'Hatchback', icon: '🚘', type: 'hatchback', count: '25+' },
    { label: 'Van', icon: '🚐', type: 'van', count: '12+' },
  ];

  // Fallback demo reviews when API is not connected
  const displayReviews = reviews.length > 0 ? reviews : [
    { _id: '1', user: { name: 'Rahul Sharma' }, car: { name: 'Honda City' }, rating: 5, comment: 'Absolutely amazing experience! The car was spotless, well-maintained and the booking process was super smooth. Will definitely book again!', createdAt: new Date() },
    { _id: '2', user: { name: 'Priya Patel' }, car: { name: 'Toyota Fortuner' }, rating: 5, comment: 'Best car rental service in the city. Professional staff, transparent pricing and great car condition. Highly recommended!', createdAt: new Date() },
    { _id: '3', user: { name: 'Arjun Mehta' }, car: { name: 'BMW 5 Series' }, rating: 5, comment: 'Luxury at its finest! Booked the BMW for my anniversary and it was perfect. Seamless pickup and drop. 5 stars!', createdAt: new Date() },
    { _id: '4', user: { name: 'Sneha Verma' }, car: { name: 'Maruti Swift' }, rating: 4, comment: 'Very affordable and reliable. The car was fuel-efficient and comfortable. Great value for money!', createdAt: new Date() },
    { _id: '5', user: { name: 'Vikram Singh' }, car: { name: 'Mahindra XUV700' }, rating: 5, comment: 'Outstanding service! The SUV was perfect for our family trip. Clean, comfortable and great mileage.', createdAt: new Date() },
  ];

  return (
    <>
      <Helmet>
        <title>PrimeCarz – Premium Car Rental | Book Luxury Cars Online</title>
        <meta name="description" content="Book premium cars online with PrimeCarz. Luxury sedans, SUVs, sports cars at best prices. Instant booking, secure payment, 24/7 support. Available across India." />
        <meta name="keywords" content="car rental, luxury car rental, car booking online, rent a car, SUV rental, sedan rental, PrimeCarz" />
        <meta property="og:title" content="PrimeCarz – Premium Car Rental Service" />
        <meta property="og:description" content="Drive your dreams with PrimeCarz. Book luxury, SUV, and economy cars online at the best prices." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://primecarz.com" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CarRental",
          "name": "PrimeCarz",
          "description": "Premium car rental service offering luxury vehicles across India",
          "telephone": "+919876543210",
          "email": "info@primecarz.com",
          "address": { "@type": "PostalAddress", "addressLocality": "Mumbai", "addressCountry": "IN" },
          "url": "https://primecarz.com",
          "priceRange": "₹₹₹",
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "500" }
        })}</script>
      </Helmet>

      {/* ==================== HERO ==================== */}
      <section className="hero" ref={heroRef}>
        <motion.div className="hero-bg" style={{ y: heroY }}>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
              }}/>
            ))}
          </div>
          <div className="hero-glow-1"/>
          <div className="hero-glow-2"/>
          <div className="hero-grid"/>
        </motion.div>

        <div className="container hero-content">
          <motion.div
            className="hero-text"
            style={{ opacity: heroOpacity }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="hero-badge-dot"/>
              🚗 India's #1 Premium Car Rental
            </motion.div>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {settings.heroTitle || (
                <>Drive Your<br/><span className="gradient-text">Dream Car</span><br/>Today</>
              )}
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {settings.heroSubtitle || 'Premium car rentals with 150+ vehicles across 25+ cities. Luxury, comfort, and affordability at your fingertips.'}
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              className="hero-quick-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="quick-stat"><span>150+</span> Cars</div>
              <div className="quick-stat-divider"/>
              <div className="quick-stat"><span>25+</span> Cities</div>
              <div className="quick-stat-divider"/>
              <div className="quick-stat"><span>4.9★</span> Rating</div>
            </motion.div>
          </motion.div>

          {/* Search Box */}
          <motion.div
            className="hero-search"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="search-header">
              <h2>Find Your Perfect Car</h2>
              <p>Quick & Easy Booking</p>
            </div>
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-field">
                <label>Car Type</label>
                <select
                  className="form-control"
                  value={searchQuery.type}
                  onChange={e => setSearchQuery({ ...searchQuery, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="sports">Sports</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div className="search-field">
                <label>Pickup Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                  value={searchQuery.pickupDate}
                  onChange={e => setSearchQuery({ ...searchQuery, pickupDate: e.target.value })}
                />
              </div>
              <div className="search-field">
                <label>Return Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={searchQuery.pickupDate || new Date().toISOString().split('T')[0]}
                  value={searchQuery.returnDate}
                  onChange={e => setSearchQuery({ ...searchQuery, returnDate: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 20, height: 20}}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                Search Cars
              </button>
            </form>

            {/* Quick filters */}
            <div className="quick-filters">
              {['All', 'Sedan', 'SUV', 'Luxury', 'Hatchback', 'Sports'].map(type => (
                <button
                  key={type}
                  className={`quick-filter-btn ${searchQuery.type === (type === 'All' ? '' : type.toLowerCase()) ? 'active' : ''}`}
                  onClick={() => setSearchQuery({ ...searchQuery, type: type === 'All' ? '' : type.toLowerCase() })}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="hero-scroll"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="scroll-mouse">
            <div className="scroll-wheel"/>
          </div>
          <span>Scroll to explore</span>
        </motion.div>
      </section>

      {/* ==================== CAR TYPES ==================== */}
      <section className="section car-types-section">
        <div className="container">
          <motion.div
            className="section-header center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">🚗 Our Fleet</span>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">From economical hatchbacks to luxury sedans, we have it all</p>
          </motion.div>

          <div className="car-types-grid">
            {carTypes.map((type, i) => (
              <motion.div
                key={type.type}
                className="car-type-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Link to={`/cars?type=${type.type}`}>
                  <div className="type-icon">{type.icon}</div>
                  <h3 className="type-label">{type.label}</h3>
                  <p className="type-count">{type.count} cars available</p>
                  <div className="type-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED CARS ==================== */}
      <section className="section bg-section featured-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">⭐ Top Picks</span>
            <h2 className="section-title">Featured Cars</h2>
            <p className="section-subtitle">Our most popular vehicles chosen by thousands of happy customers</p>
            <Link to="/cars" className="btn btn-outline">View All Cars →</Link>
          </motion.div>

          {loading ? (
            <div className="cars-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }}/>
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid-3">
              {featuredCars.map((car, i) => <CarCard key={car._id} car={car} index={i}/>)}
            </div>
          ) : (
            <div className="demo-cars-note">
              <div className="demo-icon">🚗</div>
              <h3>Premium Fleet Ready</h3>
              <p>Connect your backend to display real cars here. Add cars via the Admin Panel.</p>
              <Link to="/cars" className="btn btn-primary">Browse All Cars</Link>
            </div>
          )}
        </div>
      </section>

      {/* ==================== HOW TO BOOK ==================== */}
      <section className="section" id="how-to-book">
        <div className="container">
          <motion.div
            className="section-header center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">📋 Simple Process</span>
            <h2 className="section-title">How to Book</h2>
            <p className="section-subtitle">Get your dream car in just 4 simple steps</p>
          </motion.div>

          <div className="steps-grid">
            {howToSteps.map((step, i) => (
              <motion.div
                key={i}
                className="step-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ '--step-color': step.color }}
              >
                {/* Connector line */}
                {i < howToSteps.length - 1 && <div className="step-connector"/>}

                <div className="step-number">{step.step}</div>
                <div className="step-icon-wrap">
                  <span className="step-icon">{step.icon}</span>
                  <div className="step-icon-glow" style={{ background: `radial-gradient(circle, ${step.color}30 0%, transparent 70%)` }}/>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="center-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/cars" className="btn btn-primary btn-lg">
              🚗 Start Booking Now
            </Link>
            <Link to="/faq" className="btn btn-outline btn-lg">
              Have Questions?
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-bg"/>
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">
                  {statsInView && (
                    <>
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        decimals={stat.decimals || 0}
                        start={0}
                      />
                      <span className="stat-suffix">{stat.suffix}</span>
                    </>
                  )}
                </div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="section why-section bg-section">
        <div className="container">
          <div className="why-grid">
            <motion.div
              className="why-content"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-badge">💎 Why PrimeCarz</span>
              <h2 className="section-title">The Premium Choice for<br/><span className="gradient-text">Every Journey</span></h2>
              <p className="section-subtitle">We go beyond just renting cars. We deliver unforgettable experiences on every road.</p>

              <div className="why-features">
                {[
                  { icon: '🛡️', title: 'Fully Insured', desc: 'Every car is comprehensively insured for your safety and peace of mind.' },
                  { icon: '🕐', title: '24/7 Support', desc: 'Round-the-clock customer support. We\'re always just a call away.' },
                  { icon: '💰', title: 'Best Prices', desc: 'Transparent pricing with no hidden charges. Best rates guaranteed.' },
                  { icon: '✅', title: 'Verified Cars', desc: 'All vehicles go through strict quality checks before every rental.' },
                  { icon: '📱', title: 'Easy Booking', desc: 'Book in minutes online. Instant confirmation via SMS and email.' },
                  { icon: '🔄', title: 'Free Cancellation', desc: '24-hour free cancellation policy with full refund.' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    className="why-feature"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="feature-icon-wrap">
                      <span>{f.icon}</span>
                    </div>
                    <div>
                      <h4 className="feature-title">{f.title}</h4>
                      <p className="feature-desc">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="why-visual"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="visual-card-stack">
                <div className="visual-card vc-1">
                  <div className="vc-icon">🚗</div>
                  <div>
                    <p className="vc-title">Toyota Fortuner</p>
                    <p className="vc-sub">SUV • Available Now</p>
                  </div>
                  <div className="vc-price">₹4,500<span>/day</span></div>
                </div>
                <div className="visual-card vc-2">
                  <div className="vc-icon">💎</div>
                  <div>
                    <p className="vc-title">BMW 5 Series</p>
                    <p className="vc-sub">Luxury • Just Booked</p>
                  </div>
                  <div className="vc-price">₹12,000<span>/day</span></div>
                </div>
                <div className="visual-card vc-3">
                  <div className="vc-rating">
                    <span>★★★★★</span>
                    <p>500+ Happy Customers</p>
                  </div>
                </div>
                <div className="visual-glow"/>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== REVIEWS ==================== */}
      <section className="section reviews-section">
        <div className="container">
          <motion.div
            className="section-header center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">💬 Testimonials</span>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Join thousands of satisfied customers who trust PrimeCarz</p>
          </motion.div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="reviews-swiper"
          >
            {displayReviews.map((review) => (
              <SwiperSlide key={review._id}>
                <div className="review-card">
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="review-text">"{review.comment}"</p>
                  <div className="review-author">
                    <div className="review-avatar">
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="author-name">{review.user?.name}</p>
                      {review.car && <p className="author-car">Rented {review.car?.name}</p>}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="cta-section">
        <div className="cta-bg"/>
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">Ready to Drive Your Dream Car?</h2>
            <p className="cta-subtitle">Book now and get 10% off your first rental with code <strong>PRIME10</strong></p>
            <div className="cta-btns">
              <Link to="/cars" className="btn btn-primary btn-lg">
                🚗 Book Now
              </Link>
              <a
                href="https://wa.me/919876543210?text=Hi! I want to book a car"
                className="btn btn-outline btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp Us
              </a>
            </div>
            <div className="cta-features">
              <span>✅ Free Cancellation</span>
              <span>✅ No Hidden Charges</span>
              <span>✅ Instant Confirmation</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
