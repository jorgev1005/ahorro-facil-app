import React from 'react';
import { Share } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onShare }) => {
    const { user } = useAuth();

    const today = new Date().toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const getFirstName = (fullName) => {
        if (!fullName) return '';
        return fullName.split(' ')[0];
    }

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
                <h1 style={{ fontSize: '22px', margin: 0 }}>
                    {user ? `Hola, ${getFirstName(user.name)}` : 'Ahorro Fácil'}
                </h1>
            </div>

            <button
                onClick={onShare}
                className="btn-icon"
                aria-label="Compartir"
            >
                <Share size={20} style={{ color: 'var(--ios-blue)' }} />
            </button>
        </header>
    );
};

export default Header;
