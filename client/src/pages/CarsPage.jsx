import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import CarCard from '../components/CarCard';
import { getCars } from '../utils/api';
import './CarsPage.css';

const CarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '', fuel: '', transmission: '', minPrice: '', maxPrice: '',
    search: '', sort: '', available: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchCars = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await getCars(params);
      setCars(res.data.cars || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCars(1);
  }, [fetchCars]);

  // Read URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || '';
    if (type) setFilters(f => ({ ...f, type }));
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', fuel: '', transmission: '', minPrice: '', maxPrice: '', search: '', sort: '', available: '' });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const carTypes = ['sedan', 'suv', 'hatchback', 'luxury', 'sports', 'van', 'convertible'];
  const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];

  return (
    <>
      <Helmet>
        <title>Our Cars – PrimeCarz | Book Premium Cars Online</title>
        <meta name="description" content="Browse PrimeCarz fleet of 150+ premium cars. Filter by type, fuel, price. Instant booking available." />
        <link rel="canonical" href="https://primecarz.com/cars" />
      </Helmet>

      <div className="cars-page">
        {/* Page Hero */}
        <div className="page-hero">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="section-badge">🚗 Fleet</span>
              <h1 className="page-hero-title">Browse Our Cars</h1>
              <p className="page-hero-sub">
                {total > 0 ? `${total} cars available` : 'Find your perfect car for every occasion'}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container cars-layout">
          {/* Sidebar Filters */}
          <motion.aside
            className={`filters-sidebar ${showFilters ? 'show' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="filters-header">
              <h3>Filters</h3>
              {activeFiltersCount > 0 && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear All ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Car name, brand..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Car Type */}
            <div className="filter-group">
              <label className="filter-label">Car Type</label>
              <div className="filter-tags">
                <button
                  className={`filter-tag ${filters.type === '' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('type', '')}
                >All</button>
                {carTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-tag ${filters.type === type ? 'active' : ''}`}
                    onClick={() => handleFilterChange('type', type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel */}
            <div className="filter-group">
              <label className="filter-label">Fuel Type</label>
              <div className="filter-tags">
                <button className={`filter-tag ${filters.fuel === '' ? 'active' : ''}`} onClick={() => handleFilterChange('fuel', '')}>All</button>
                {fuelTypes.map(fuel => (
                  <button key={fuel} className={`filter-tag ${filters.fuel === fuel ? 'active' : ''}`} onClick={() => handleFilterChange('fuel', fuel)}>
                    {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="filter-group">
              <label className="filter-label">Transmission</label>
              <div className="filter-tags">
                <button className={`filter-tag ${filters.transmission === '' ? 'active' : ''}`} onClick={() => handleFilterChange('transmission', '')}>All</button>
                <button className={`filter-tag ${filters.transmission === 'automatic' ? 'active' : ''}`} onClick={() => handleFilterChange('transmission', 'automatic')}>Automatic</button>
                <button className={`filter-tag ${filters.transmission === 'manual' ? 'active' : ''}`} onClick={() => handleFilterChange('transmission', 'manual')}>Manual</button>
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="filter-label">Price per Day (₹)</label>
              <div className="price-range">
                <input type="number" className="form-control" placeholder="Min" value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} min="0"/>
                <span>–</span>
                <input type="number" className="form-control" placeholder="Max" value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} min="0"/>
              </div>
            </div>

            {/* Availability */}
            <div className="filter-group">
              <label className="filter-label">Availability</label>
              <div className="filter-tags">
                <button className={`filter-tag ${filters.available === '' ? 'active' : ''}`} onClick={() => handleFilterChange('available', '')}>All</button>
                <button className={`filter-tag ${filters.available === 'true' ? 'active' : ''}`} onClick={() => handleFilterChange('available', 'true')}>Available</button>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="cars-main">
            {/* Toolbar */}
            <div className="cars-toolbar">
              <div className="cars-count">
                {loading ? 'Loading...' : `${total} car${total !== 1 ? 's' : ''} found`}
              </div>
              <div className="cars-toolbar-right">
                <select className="form-control sort-select" value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}>
                  <option value="">Sort: Latest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
                <button className="btn btn-ghost filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>
            </div>

            {/* Cars Grid */}
            {loading ? (
              <div className="cars-grid">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }}/>
                ))}
              </div>
            ) : cars.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  className="cars-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {cars.map((car, i) => <CarCard key={car._id} car={car} index={i}/>)}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="no-cars">
                <span>🚗</span>
                <h3>No Cars Found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost"
                  disabled={currentPage === 1}
                  onClick={() => fetchCars(currentPage - 1)}
                >← Previous</button>
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => fetchCars(i + 1)}
                    >{i + 1}</button>
                  ))}
                </div>
                <button
                  className="btn btn-ghost"
                  disabled={currentPage === totalPages}
                  onClick={() => fetchCars(currentPage + 1)}
                >Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CarsPage;
