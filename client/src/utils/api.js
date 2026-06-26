import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const getAllUsers = () => API.get('/auth/users');

// Cars
export const getCars = (params) => API.get('/cars', { params });
export const getCar = (id) => API.get(`/cars/${id}`);
export const createCar = (data) => API.post('/cars', data);
export const updateCar = (id, data) => API.put(`/cars/${id}`, data);
export const deleteCar = (id) => API.delete(`/cars/${id}`);
export const toggleCarAvailability = (id) => API.patch(`/cars/${id}/availability`);

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const getAllBookings = (params) => API.get('/bookings', { params });
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) => API.patch(`/bookings/${id}/status`, data);
export const createManualBooking = (data) => API.post('/bookings/manual', data);
export const getBookingStats = () => API.get('/bookings/admin/stats');

// Coupons
export const validateCoupon = (data) => API.post('/coupons/validate', data);
export const getAllCoupons = () => API.get('/coupons');
export const createCoupon = (data) => API.post('/coupons', data);
export const updateCoupon = (id, data) => API.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => API.delete(`/coupons/${id}`);

// Reviews
export const getCarReviews = (carId) => API.get(`/reviews/car/${carId}`);
export const getAllReviews = () => API.get('/reviews/all');
export const createReview = (data) => API.post('/reviews', data);
export const approveReview = (id, data) => API.patch(`/reviews/${id}/approve`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const getAdminReviews = () => API.get('/reviews');

// FAQ
export const getFAQs = () => API.get('/faq');
export const getAdminFAQs = () => API.get('/faq/admin');
export const createFAQ = (data) => API.post('/faq', data);
export const updateFAQ = (id, data) => API.put(`/faq/${id}`, data);
export const deleteFAQ = (id) => API.delete(`/faq/${id}`);

// Revenue
export const getRevenue = (params) => API.get('/revenue', { params });
export const addRevenue = (data) => API.post('/revenue', data);
export const deleteRevenue = (id) => API.delete(`/revenue/${id}`);

// Settings
export const getSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data);

// Enquiries
export const submitEnquiry = (data) => API.post('/enquiries', data);
export const getEnquiries = () => API.get('/enquiries');
export const updateEnquiry = (id, data) => API.patch(`/enquiries/${id}`, data);
export const deleteEnquiry = (id) => API.delete(`/enquiries/${id}`);

// Payment
export const createPaymentOrder = (data) => API.post('/payment/create-order', data);
export const verifyPayment = (data) => API.post('/payment/verify', data);

export default API;
