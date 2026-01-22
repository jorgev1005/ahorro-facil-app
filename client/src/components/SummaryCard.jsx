import React from 'react';
import Card from './Card';
import { formatCurrency } from '../utils/formatters';

const SummaryCard = ({ totalCollected, totalExpected, label = "Recaudado Hoy" }) => {
    const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return (
        <Card className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span className="text-caption" style={{ fontSize: '15px', fontWeight: 600 }}>{label.toUpperCase()}</span>
                <span style={{ color: 'var(--color-blue)', fontWeight: 700, fontSize: '15px' }}>{percentage}%</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
                <span className="text-display" style={{ fontSize: '32px' }}>{formatCurrency(totalCollected)}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '17px' }}>
                    / {formatCurrency(totalExpected)}
                </span>
            </div>

            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(118, 118, 128, 0.12)',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-blue)',
                    borderRadius: '4px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
            </div>
        </Card>
    );
};

export default SummaryCard;
