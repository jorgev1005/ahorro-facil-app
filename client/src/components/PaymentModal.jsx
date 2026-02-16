import React, { useState, useEffect } from 'react';
import Card from './Card';
import { X } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const PaymentModal = ({ payment, participant, scheduledDate, totalAmount = 30, onClose, onConfirm }) => {

    // Existing Payment State (if partial)
    const existingPaid = payment ? (Number(payment.amountPaid) || 0) : 0;
    const remaining = totalAmount - existingPaid;

    const targetDate = payment ? payment.date : scheduledDate;

    // Form State
    const [amountToPay, setAmountToPay] = useState(remaining);
    const [paidDate, setPaidDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [reference, setReference] = useState('');

    // Multi-Currency State
    const [currency, setCurrency] = useState('USD');
    const [exchangeRate, setExchangeRate] = useState('');
    const [amountBs, setAmountBs] = useState(0);

    // Auto-calculate Bs
    useEffect(() => {
        if (currency === 'BS' && exchangeRate) {
            // Fix: Replace comma with dot for calculation
            const rate = parseFloat(exchangeRate.replace(',', '.'));
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
            // Identification
            paymentId: payment ? payment.id : null,
            date: paidDate, // Transaction Date

            // Financials
            // Financials
            paidAmount: parseFloat(amountToPay.toString().replace(',', '.')), // Amount in this transaction

            // Meta
            reference,
            currency,
            exchangeRate: currency === 'BS' ? parseFloat(exchangeRate.toString().replace(',', '.')) : null,
            amountBs: currency === 'BS' ? parseFloat(amountBs) : null
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', // Align bottom for slide up
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <Card className="animate-slide-up" style={{
                width: '100%', maxWidth: '500px', maxHeight: '90vh',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: 0, // Reset card margin
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto', // Enable scrolling
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Registrar Pago</h2>
                    <button onClick={onClose} className="btn-icon" style={{ backgroundColor: 'var(--ios-bg)', boxShadow: 'none' }}>
                        <X size={20} color="var(--ios-text-secondary)" />
                    </button>
                </div>

                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <span style={{ fontSize: '15px', color: 'var(--ios-text-secondary)', fontWeight: 500 }}>{participant.name}</span>

                    {/* Amount Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <div className="text-display" style={{ fontSize: '42px' }}>
                            ${amountToPay}
                        </div>
                        {existingPaid > 0 && (
                            <div style={{ fontSize: '13px', color: 'var(--color-orange)', backgroundColor: 'rgba(255,149,0,0.1)', padding: '4px 12px', borderRadius: '100px', fontWeight: 600 }}>
                                Abonado: ${existingPaid} · Resta: ${remaining}
                            </div>
                        )}
                        <div style={{ fontSize: '13px', color: 'var(--ios-text-secondary)', marginTop: '4px' }}>
                            Fecha Corresp.: {formatDate(targetDate)}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Amount Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Monto a Pagar ($)</label>
                        <input
                            type="number"
                            value={amountToPay}
                            onChange={(e) => setAmountToPay(e.target.value)}
                            max={remaining}
                            min="1"
                        />
                    </div>

                    {/* Date Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Fecha Real del Pago</label>
                        <input
                            type="date"
                            value={paidDate}
                            onChange={(e) => setPaidDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Currency Toggle */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Moneda</label>
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
                    {/* Exchange Rate Input (Conditional) */}
                    {/* Exchange Rate Input (Conditional) */}
                    {currency === 'BS' && (
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}> {/* minWidth 0 prevents flex item from overflowing */}
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Tasa</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(e.target.value)}
                                    placeholder="0.00"
                                    required={currency === 'BS'}
                                    style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase' }}>Total Bs</label>
                                <div style={{
                                    padding: '12px 16px', borderRadius: '12px',
                                    backgroundColor: 'var(--ios-bg)',
                                    color: 'var(--text-primary)', fontWeight: 600, fontSize: '17px',
                                    height: '44px', display: 'flex', alignItems: 'center',
                                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                    width: '100%', boxSizing: 'border-box'
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
                            placeholder="Ej: Pago Móvil 1234"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Confirmar Pago
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default PaymentModal;
