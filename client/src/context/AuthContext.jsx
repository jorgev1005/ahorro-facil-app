import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await authService.register(name, email, password);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (error) {
            console.error("Register failed", error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al registrarse'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        // Optional: window.location.href = '/'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
