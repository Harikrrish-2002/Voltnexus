import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log("API Request Interceptor - Token from storage:", token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const errorMsg = error.response.data.message || 'Unauthorized';

            // Bypass global alert for OTP requirement, Pending status, and Auth routes to allow local handling
            const isAuthRoute = error.config && error.config.url && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register'));
            
            if (errorMsg === 'OTP_REQUIRED' || errorMsg.includes('pending approval') || isAuthRoute) {
                return Promise.reject(error);
            }

            alert(`Session Expired or Unauthorized: ${errorMsg}`);

            // Clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
