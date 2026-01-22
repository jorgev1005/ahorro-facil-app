import React, { useState, useEffect } from 'react';
import Card from './Card';
import { X, Gift } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const PayoutModal = ({ participant, totalCollected, onClose, onConfirm }) => {
    // Default to total collected or a safe fallback
    const defaultAmount = totalCollected > 0 ? totalCollected : 300;

    // Form State
    const [amountToPay, setAmountToPay] = useState(defaultAmount);
    const [payoutDate, setPayoutDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
    const [reference, setReference] = useState('');

    // Multi-Currency State
    const [currency, setCurrency] = useState('USD');
    const [exchangeRate, setExchangeRate] = useState('');
    const [amountBs, setAmountBs] = useState(0);

    // Auto-calculate Bs
    useEffect(() => {
        if (currency === 'BS' && exchangeRate) {
            const rate = parseFloat(exchangeRate);
            if (!isNaN(rate)) {
                setAmountBs((amountToPay * rate).toFixed(2));
            } else {
                setAmountBs(0);
            }
        }
    }, [exchangeRate, currency, amountToPay]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            payoutDate,
            payoutAmount: parseFloat(amountToPay),
            payoutReference: reference,
            payoutCurrency: currency,
            payoutExchangeRate: currency === 'BS' ? parseFloat(exchangeRate) : null,
            payoutAmountBs: currency === 'BS' ? parseFloat(amountBs) : null
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <Card className="animate-slide-up" style={{
                width: '100%', maxWidth: '500px', maxHeight: '90vh',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: 0,
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Registrar Entrega</h2>
                    <button onClick={onClose} className="btn-icon" style={{ backgroundColor: 'var(--ios-bg)', boxShadow: 'none' }}>
                        <X size={20} color="var(--ios-text-secondary)" />
                    </button>
                </div>

                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: '#e5f9e7', color: 'var(--color-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Gift size={32} />
                    </div>

                    <span style={{ fontSize: '15px', color: 'var(--ios-text-secondary)', fontWeight: 500 }}>
                        Entrega para: {participant.name}
                    </span>

                    <div style={{ fontSize: '42px', fontWeight: 600, marginTop: '8px' }}>
                        ${amountToPay}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Date Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Fecha de Entrega</label>
                        <input
                            type="date"
                            value={payoutDate}
                            onChange={(e) => setPayoutDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Amount Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Monto a Entregar ($)</label>
                        <input
                            type="number"
                            value={amountToPay}
                            onChange={(e) => setAmountToPay(e.target.value)}
                            required
                        />
                    </div>

                    {/* Currency Toggle */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Moneda de Entrega</label>
                        <div style={{ display: 'flex', backgroundColor: 'rgba(118, 118, 128, 0.12)', padding: '2px', borderRadius: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setCurrency('USD')}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '8px',
                                    backgroundColor: currency === 'USD' ? 'white' : 'transparent',
                                    color: currency === 'USD' ? 'black' : 'var(--text-secondary)',
                                    fontWeight: 600, fontSize: '13px', boxShadow: currency === 'USD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                USD
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrency('BS')}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '8px',
                                    backgroundColor: currency === 'BS' ? 'white' : 'transparent',
                                    color: currency === 'BS' ? 'black' : 'var(--text-secondary)',
                                    fontWeight: 600, fontSize: '13px', boxShadow: currency === 'BS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                BS
                            </button>
                        </div>
                    </div>

                    {/* Exchange Rate Input (Conditional) */}
                    {currency === 'BS' && (
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Tasa</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(e.target.value)}
                                    placeholder="0.00"
                                    required={currency === 'BS'}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Total Bs</label>
                                <div style={{
                                    padding: '16px', borderRadius: '12px',
                                    backgroundColor: 'var(--ios-bg)',
                                    color: 'var(--text-primary)', fontWeight: 600, fontSize: '17px'
                                }}>
                                    {amountBs}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reference Input */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Referencia / Nota</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Ej: Efectivo, Transferencia..."
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Confirmar Entrega
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default PayoutModal;
