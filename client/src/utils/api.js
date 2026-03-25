import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 
             (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api'),
});

// Helper for caching categories
const CATEGORY_CACHE_KEY = 'rs_categories_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const getCachedCategories = async () => {
    const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }

    try {
        const res = await api.get('/categories');
        localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify({
            data: res.data,
            timestamp: Date.now()
        }));
        return res.data;
    } catch (err) {
        console.error('API Error: Fetching categories failed');
        return [];
    }
};

// Automatic Token handling
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

// Global error logger
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error Response:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default api;
