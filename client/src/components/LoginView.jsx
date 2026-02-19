import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

const LoginView = () => {
    const { login, register } = useAuth();
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(!searchParams.get('register'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let result;
        if (isLogin) {
            result = await login(form.email, form.password);
        } else {
            result = await register(form.name, form.email, form.password);
        }

        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '20px'
        }}>
            <div className="glass-card animate-enter" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src="/logo.svg?v=4" alt="Logo" className="w-20 h-20 mx-auto mb-4 shadow-lg rounded-full" />
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
                        {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? 'Ingresa para gestionar tus bolsos' : 'Únete a Ahorro Fácil'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(255, 59, 48, 0.1)',
                        color: 'var(--ios-red)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && (
                        <div className="input-group">
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nombre Completo"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo Electrónico"
                                value={form.email}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '44px' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10
                                }}
                                title={showPassword ? "Ocultar" : "Mostrar"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ position: 'relative', margin: '10px 0' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', width: '100%', position: 'absolute', top: '50%', zIndex: 0 }}></div>
                        <span style={{ background: 'var(--surface)', padding: '0 10px', position: 'relative', zIndex: 1, color: 'var(--text-tertiary)', fontSize: '12px' }}>O continúa con</span>
                    </div>

                    <a
                        href={`${import.meta.env.VITE_API_URL}/auth/google`}
                        className="btn"
                        style={{
                            background: 'white',
                            color: '#333',
                            border: '1px solid #ddd',
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: 500,
                            textDecoration: 'none',
                            marginBottom: '10px'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" fillRule="evenodd" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd" />
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.272C4.672 5.141 6.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd" />
                        </svg>
                        Google
                    </a>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '0px', width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? <Loader className="spin" size={20} /> : (
                            <>
                                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    </span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--ios-blue)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {isLogin ? 'Regístrate' : 'Ingresa'}
                    </button>
                </div>
            </div >

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div >
    );
};

export default LoginView;
