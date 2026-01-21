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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            marginBottom: '20px',
            paddingTop: '20px'
        }}>
            <div>
                <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--ios-text-secondary)',
                    textTransform: 'capitalize',
                    marginBottom: '4px'
                }}>
                    {today}
                </div>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Bolso</h1>
            </div>
            <button
                onClick={onShare}
                style={{
                    background: 'var(--ios-blue)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-md)'
                }}>
                <Share size={20} color="white" />
            </button>
        </header>
    );
};

export default Header;
