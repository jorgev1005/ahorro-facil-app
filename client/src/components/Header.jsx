import React from 'react';
import { Share } from 'lucide-react';

const Header = ({ onShare }) => {
    const today = new Date().toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            margin: '0 -20px 24px -20px', // Negative margin to stretch full width within container
            backdropFilter: 'saturate(180%) blur(20px)',
            backgroundColor: 'rgba(242, 242, 247, 0.8)', // Translucent background matching body
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div>
                <div className="text-caption" style={{
                    textTransform: 'capitalize',
                    marginBottom: '2px',
                    fontWeight: 600
                }}>
                    {today}
                </div>
                <h1 style={{ fontSize: '30px' }}>Mis Bolsos</h1>
            </div>

            <button
                onClick={onShare}
                className="btn-icon"
                aria-label="Compartir"
            >
                <Share size={20} className="text-primary" style={{ color: 'var(--color-blue)' }} />
            </button>
        </header>
    );
};

export default Header;
