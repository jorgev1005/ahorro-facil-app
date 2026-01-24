import React from 'react';
import Card from './Card';
import { Share2, X, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const PayoutReceiptCard = ({ participant, bolso, onClose, onShare }) => {
    if (!participant) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <Card className="animate-scale-in" style={{
                width: '100%', maxWidth: '340px',
                padding: '0', overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header Pattern */}
                <div style={{
                    height: '8px',
                    background: 'repeating-linear-gradient(45deg, var(--color-green), var(--color-green) 10px, #e5f9e7 10px, #e5f9e7 20px)'
                }} />

                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: '#e5f9e7', color: 'var(--color-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <CheckCircle2 size={32} />
                    </div>

                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                        ¡Entrega Exitosa!
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>
                        {bolso.name}
                    </p>

                    <div style={{ borderTop: '1px dashed var(--ios-separator)', borderBottom: '1px dashed var(--ios-separator)', padding: '20px 0', margin: '0 0 24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Recibe
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {participant.name}
                            </span>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Fecha de Entrega
                            </span>
                            <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                {formatDate(participant.payoutDate)}
                            </span>
                        </div>

                        <div>
                            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Monto Entregado
                            </span>
                            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-green)', letterSpacing: '-0.5px' }}>
                                {formatCurrency(participant.payoutAmount)}
                            </span>
                        </div>

                        {participant.payoutReference && (
                            <div style={{ marginTop: '16px' }}>
                                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Referencia / Nota
                                </span>
                                <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                                    "{participant.payoutReference}"
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onShare} style={{
                            flex: 1,
                            backgroundColor: 'white', color: 'var(--text-secondary)',
                            border: '1px solid var(--ios-separator)', padding: '12px', borderRadius: '12px',
                            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontSize: '14px'
                        }}>
                            <Share2 size={18} /> Compartir
                        </button>
                    </div>
                </div>

                {/* Close Button at bottom */}
                <button onClick={onClose} style={{
                    width: '100%', padding: '16px',
                    background: 'var(--ios-bg)', border: 'none', borderTop: '1px solid var(--ios-separator)',
                    color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px'
                }}>
                    Cerrar
                </button>
            </Card>
        </div>
    );
};

export default PayoutReceiptCard;
