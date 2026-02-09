import React from 'react';
import { Share } from 'lucide-react';

const Header = ({ onShare }) => {
    const today = new Date().toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

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
                {/* Removed redundant h1 "Mis Bolsos" if HomeView has it, or keep it if it's the main app header */}
                <h1 style={{ fontSize: '22px', margin: 0 }}>Ahorro Fácil</h1>
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
