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

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
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
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginView;
