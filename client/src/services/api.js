import axios from 'axios';

// Production URL
// Determine API URL based on environment or hostname
let API_URL = import.meta.env.VITE_API_URL;

// Fail-safe: If running on production domain, FORCE the correct API URL
// This handles cases where Vercel env vars might be missing
if (window.location.hostname === 'ahorro.grupoaludra.com' || window.location.hostname === 'www.ahorro.grupoaludra.com' || window.location.hostname === 'api.grupoaludra.com') {
    API_URL = '/api';
}

// Fallback for local development if env is missing
if (!API_URL) {
    API_URL = 'http://localhost:3000/api';
}

console.log('🔌 API URL Configured:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add Interceptor to attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (name, email, password) => {
        const response = await api.post('/auth/register', { name, email, password });
        return response.data;
    }
};

export const bolsoService = {
    getAll: async () => {
        const response = await api.get('/bolsos');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/bolsos/${id}`);
        return response.data;
    },

    create: async (bolsoData) => {
        const response = await api.post('/bolsos', bolsoData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/bolsos/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/bolsos/${id}`, data);
        return response.data;
    },

    resetApp: async () => {
        const response = await api.delete('/bolsos/admin/reset_demo_data');
        return response.data;
    },
};

export const participantService = {
    updateParticipant: async (id, data) => {
        const response = await api.put(`/participants/${id}`, data);
        return response.data;
    },
    getShareToken: async (id) => {
        const response = await api.get(`/participants/${id}/share_token`);
        return response.data;
    },


    // Payments
    registerPayment: async (data) => {
        const response = await api.post('/payments', data);
        return response.data;
    },

    deletePayment: async (id) => {
        const response = await api.delete(`/payments/${id}`);
        return response.data;
    }
};

export default api;
