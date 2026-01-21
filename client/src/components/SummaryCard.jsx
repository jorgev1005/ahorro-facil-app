import React from 'react';
import Card from './Card';
import { formatCurrency } from '../utils/formatters';

const SummaryCard = ({ totalCollected, totalExpected, label = "Recaudado Hoy" }) => {
    const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return (
        <Card className="summary-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ios-text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{ color: 'var(--ios-blue)', fontWeight: 600 }}>{percentage}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(totalCollected)}</span>
                <span style={{ color: 'var(--ios-text-secondary)', fontWeight: 500 }}>/ {formatCurrency(totalExpected)}</span>
            </div>

            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#F2F2F7',
                borderRadius: '4px',
                marginTop: '12px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: 'var(--ios-blue)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </Card>
    );
};

export default SummaryCard;
