import React, { useEffect } from 'react';
import { Share, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onShare }) => {
    const { user, logout } = useAuth();

    useEffect(() => {
        console.log('👤 Header User State:', user);
    }, [user]);

    const today = new Date().toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const getFirstName = (fullName) => {
        if (!fullName) return '';
        return fullName.split(' ')[0];
    }

    const handleLogout = () => {
        if (window.confirm('¿Deseas cerrar sesión?')) {
            logout();
            window.location.reload(); // Force reload to clear state cleanly
        }
    };

    return (
        <header className="glass" style={{
            position: 'sticky',
            top: 20,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            marginBottom: '24px',
            borderRadius: 'var(--radius-l)',
            border: 'var(--glass-border)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo.svg?v=2" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <div>
                    <div className="text-caption" style={{
                        textTransform: 'capitalize',
                        marginBottom: '4px',
                        fontWeight: 600,
                        fontSize: '13px',
                        letterSpacing: '0.05em'
                    }}>
                        {today}
                    </div>
                    <h1 style={{ fontSize: '22px', margin: 0, lineHeight: '1.1' }}>
                        {user ? `Hola, ${getFirstName(user.name)}` : 'Ahorro Fácil'}
                    </h1>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={onShare}
                    className="btn-icon"
                    aria-label="Compartir"
                >
                    <Share size={20} style={{ color: 'var(--ios-blue)' }} />
                </button>

                {user && (
                    <button
                        onClick={handleLogout}
                        className="btn-icon"
                        aria-label="Cerrar Sesión"
                        style={{ color: 'var(--system-red)' }}
                    >
                        <LogOut size={20} />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
