import React from 'react';

const Card = ({ children, className = '', onClick, style = {} }) => {
    return (
        <div
            onClick={onClick}
            className={className}
            style={{
                backgroundColor: 'var(--ios-card-bg)',
                borderRadius: 'var(--radius-l)',
                boxShadow: 'var(--shadow-sm)',
                padding: '16px',
                marginBottom: '16px',
                cursor: onClick ? 'pointer' : 'default',
                ...style // Allow overriding/extending styles
            }}
        >
            {children}
        </div>
    );
};

export default Card;
