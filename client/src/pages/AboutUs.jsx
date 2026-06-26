import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './AboutUs.css';

const AboutUs = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { value: 500, label: 'Luxury Cars', suffix: '+' },
    { value: 12000, label: 'Happy Customers', suffix: '+' },
    { value: 25, label: 'Cities Covered', suffix: '' },
    { value: 12, label: 'Years Experience', suffix: '' },
  ];

  const values = [
    { title: 'Premium Service', desc: 'We deliver door-to-door concierge quality and personalized packages for our clients.', icon: '👑' },
    { title: 'Zero Hidden Fees', desc: 'No surcharges or surprises. The price you book is the exact price you pay.', icon: '🛡️' },
    { title: 'Elite Fleet Selection', desc: 'We maintain our supercars to pristine mechanical standards and detailing quality.', icon: '🏎️' },
    { title: '24/7 Road Assistance', desc: 'Full mechanical breakdown support and replacement vehicles, anywhere, anytime.', icon: '📞' },
  ];

  const team = [
    { name: 'Sarah Sterling', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300' },
    { name: 'Marcus Vane', role: 'Head of Fleet Operations', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300' },
    { name: 'Elena Rostova', role: 'Chief Experience Officer', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300' },
  ];

  return (
    <div className="about-page">
      <Helmet>
        <title>About Us | PrimeCarz Luxury Rentals</title>
        <meta name="description" content="Discover the story behind PrimeCarz. Since 2014, we have provided elite, premium supercar rentals across the country." />
      </Helmet>

      {/* Hero Section */}
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Our Story</h1>
          <p className="page-hero-sub">Driven by speed, luxury, and unmatched rental excellence</p>
        </div>
      </div>

      {/* Story Text */}
      <section className="section story-section container">
        <div className="story-grid">
          <motion.div 
            className="story-text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Redefining Travel Since 2014</h2>
            <p>
              PrimeCarz was founded with a single mission: to break the standard mold of traditional car rentals. We believe driving isn't just about going from point A to point B—it's an emotional experience, a statement of prestige, and a thrill.
            </p>
            <p>
              Whether you require a sleek sedan for corporate events, an aggressive SUV for family expeditions, or an exotic supercar for weekend getaways, our handpicked collection is detailed to perfection and waiting for your commands.
            </p>
            <Link to="/cars" className="btn btn-primary">Explore Our Fleet</Link>
          </motion.div>

          <motion.div 
            className="story-image-box"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600" alt="Luxury Car Showcase" className="story-img" />
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section section" ref={ref}>
        <div className="container stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <span className="stat-num">
                {inView ? (
                  <CountUp start={0} end={stat.value} duration={2.5} separator="," />
                ) : (
                  '0'
                )}
                {stat.suffix}
              </span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="values-section section container">
        <div className="section-header text-center">
          <h2>Why Choose PrimeCarz</h2>
          <p>We provide standard-setting perks and top-tier support for every journey</p>
        </div>

        <div className="values-grid">
          {values.map((val, idx) => (
            <motion.div 
              key={idx}
              className="value-card card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div className="value-icon">{val.icon}</div>
              <h4>{val.title}</h4>
              <p>{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section section container">
        <div className="section-header text-center">
          <h2>Meet the Leadership</h2>
          <p>The visionaries steering PrimeCarz to new heights</p>
        </div>

        <div className="team-grid">
          {team.map((member, idx) => (
            <motion.div 
              key={idx}
              className="team-card card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <img src={member.image} alt={member.name} className="team-img" />
              <div className="team-info">
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
