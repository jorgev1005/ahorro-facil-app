import React from 'react';
import Card from './Card';
import { Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const LiquidityIndicator = ({ totalCollected, totalPaidOut, payoutAmount }) => {
    const balance = totalCollected - totalPaidOut;
    const isEnough = balance >= payoutAmount;

    // Calculate how many full payouts we can make
    const payoutsAvailable = Math.floor(balance / payoutAmount);

    return (
        <Card style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--ios-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Liquidez del Bolso
                </span>
                {isEnough ? (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Disponible para Pagar
                    </span>
                ) : (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Falta Dinero
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(balance)}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    en caja
                </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ flex: 1, backgroundColor: 'white', padding: '8px', borderRadius: '8px' }}>
                    <span style={{ display: 'block', marginBottom: '2px' }}>Entradas</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-blue)' }}>{formatCurrency(totalCollected)}</span>
                </div>
                <div style={{ flex: 1, backgroundColor: 'white', padding: '8px', borderRadius: '8px' }}>
                    <span style={{ display: 'block', marginBottom: '2px' }}>Salidas</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(totalPaidOut)}</span>
                </div>
            </div>

            {payoutsAvailable > 0 && (
                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'rgba(52, 199, 89, 0.1)', borderRadius: '8px', color: 'var(--color-green)', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
                    💰 Tienes para <b>{payoutsAvailable}</b> entrega{payoutsAvailable > 1 ? 's' : ''}
                </div>
            )}
        </Card>
    );
};

export default LiquidityIndicator;
