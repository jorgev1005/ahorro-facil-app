import axios from 'axios';

// Production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://bolso-api.grupoaludra.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

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

    // Participants
    updateParticipant: async (id, data) => {
        const response = await api.put(`/participants/${id}`, data);
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
