import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Home from './pages/Home';
import CarsPage from './pages/CarsPage';
import CarDetail from './pages/CarDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import BookingConfirmed from './pages/BookingConfirmed';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import CarEnquiry from './pages/CarEnquiry';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminBookings from './admin/AdminBookings';
import AdminNewBooking from './admin/AdminNewBooking';
import AdminUpcomingBookings from './admin/AdminUpcomingBookings';
import AdminCompletedBookings from './admin/AdminCompletedBookings';
import AdminCarsList from './admin/AdminCarsList';
import AdminAddCar from './admin/AdminAddCar';
import AdminSettings from './admin/AdminSettings';
import AdminFAQ from './admin/AdminFAQ';
import AdminCoupons from './admin/AdminCoupons';
import AdminRevenue from './admin/AdminRevenue';
import AdminEnquiries from './admin/AdminEnquiries';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Scroll to top helper
import { useEffect } from 'react';
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Admin route protection wrapper
const AdminProtectedRoute = ({ children }) => {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App layout wrapper to show navbar/footer only on public routes
const MainLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <div className="main-content-flow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/book/:carId" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmed" element={<BookingConfirmed />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/add-car-enquiry" element={<CarEnquiry />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Login Route outside of AdminLayout */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Dashboard Routes */}
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/new" element={<AdminNewBooking />} />
            <Route path="bookings/upcoming" element={<AdminUpcomingBookings />} />
            <Route path="bookings/completed" element={<AdminCompletedBookings />} />
            <Route path="cars" element={<AdminCarsList />} />
            <Route path="cars/add" element={<AdminAddCar />} />
            <Route path="cars/edit/:id" element={<AdminAddCar />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="about" element={<AdminSettings />} /> {/* about mapped to settings manager */}
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
