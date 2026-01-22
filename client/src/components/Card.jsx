import React from 'react';

const Card = ({ children, className = '', onClick, style = {}, glass = false }) => {
    return (
        <div
            onClick={onClick}
            className={`card-ios ${glass ? 'glass' : ''} ${className}`}
            style={{
                backgroundColor: glass ? 'var(--ios-card)' : 'white',
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
