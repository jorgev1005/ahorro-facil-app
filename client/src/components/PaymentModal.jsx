import React, { useState, useEffect } from 'react';
import Card from './Card';
import { X, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

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
            // Identification
            paymentId: payment ? payment.id : null,
            date: paidDate, // Transaction Date

            // Financials
            paidAmount: parseFloat(amountToPay), // Amount in this transaction

            // Meta
            reference,
            currency,
            exchangeRate: currency === 'BS' ? parseFloat(exchangeRate) : null,
            amountBs: currency === 'BS' ? parseFloat(amountBs) : null
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(5px)',
            overflowY: 'auto' // Allow container to scroll if needed
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Registrar Pago</h2>
                    <button onClick={onClose}><X size={24} color="var(--ios-text-secondary)" /></button>
                </div>

                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--ios-text-secondary)' }}>{participant.name}</span>

                    {/* Amount Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ios-text-primary)' }}>
                            ${amountToPay}
                        </div>
                        {existingPaid > 0 && (
                            <div style={{ fontSize: '0.9rem', color: 'var(--ios-orange)', backgroundColor: 'rgba(255,149,0,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                                Abonado: ${existingPaid} / Resta: ${remaining}
                            </div>
                        )}
                        <div style={{ fontSize: '0.9rem', color: 'var(--ios-text-secondary)' }}>
                            Fecha Corresp.: {formatDate(targetDate)}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Amount Input */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Monto a Pagar ($)</label>
                        <input
                            type="number"
                            value={amountToPay}
                            onChange={(e) => setAmountToPay(e.target.value)}
                            max={remaining}
                            min="1"
                            style={inputStyle}
                        />
                    </div>

                    {/* Date Input */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Fecha Real del Pago</label>
                        <input
                            type="date"
                            value={paidDate}
                            onChange={(e) => setPaidDate(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {/* Currency Toggle */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Moneda de Pago</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setCurrency('USD')}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--ios-separator)',
                                    backgroundColor: currency === 'USD' ? 'var(--ios-blue)' : 'var(--ios-bg)',
                                    color: currency === 'USD' ? 'white' : 'var(--ios-text-primary)',
                                    fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                USD
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrency('BS')}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--ios-separator)',
                                    backgroundColor: currency === 'BS' ? 'var(--ios-blue)' : 'var(--ios-bg)',
                                    color: currency === 'BS' ? 'white' : 'var(--ios-text-primary)',
                                    fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                BS
                            </button>
                        </div>
                    </div>

                    {/* Exchange Rate Input (Conditional) */}
                    {currency === 'BS' && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Tasa</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={exchangeRate}
                                    onChange={(e) => setExchangeRate(e.target.value)}
                                    placeholder="0.00"
                                    required={currency === 'BS'}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Total Bs</label>
                                <div style={{
                                    ...inputStyle, backgroundColor: 'var(--ios-bg-secondary)',
                                    color: 'var(--ios-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center'
                                }}>
                                    {amountBs}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reference Input */}
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Referencia / Nota</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Ej: Pago Móvil 1234"
                            style={inputStyle}
                        />
                    </div>

                    <button type="submit" style={{
                        width: '100%', padding: '16px', backgroundColor: 'var(--ios-blue)', color: 'white',
                        borderRadius: '12px', fontWeight: 600, fontSize: '1rem', border: 'none'
                    }}>
                        Confirmar Pago
                    </button>
                </form>
            </Card>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--ios-separator)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    backgroundColor: 'var(--ios-bg)',
    color: 'var(--ios-text-primary)',
    boxSizing: 'border-box'
};

export default PaymentModal;
