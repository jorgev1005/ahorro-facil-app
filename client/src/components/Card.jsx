import React from 'react';

const Card = ({ children, className = '', onClick, style = {}, glass = false, activeScale = false }) => {
    // Determine classes
    const baseClass = glass ? 'glass-card' : 'card-ios';
    const interactiveClass = (onClick || activeScale) ? 'interactive-card' : '';

    return (
        <div
            onClick={onClick}
            className={`${baseClass} ${interactiveClass} ${className}`}
            style={{
                // Remove inline background if glass is true to let CSS handle the blur/transparency
                backgroundColor: glass ? undefined : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: glass ? undefined : 'blur(12px)',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
