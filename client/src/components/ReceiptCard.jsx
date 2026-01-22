import React, { useState, useRef } from 'react';
import Card from './Card';
import { Share2, X, CheckCircle2, AlertCircle, Edit2, Download, Trash2, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import html2canvas from 'html2canvas';

const ReceiptCard = ({ payment, participant = {}, onClose, onShare, onUpdateReference, onDelete }) => {
    const [isEditingRef, setIsEditingRef] = useState(false);
    const [newRef, setNewRef] = useState(payment.reference || '');
    const cardRef = useRef(null);

    // Safe Late Check
    let isLate = false;

    // Check if payment object and dates exist before comparing
    if (payment && payment.paidAt && payment.date) {
        // Simple string comparison works for ISO dates (YYYY-MM-DD), 
        // but if paidAt includes time/is object, we might need normalization.
        // Assuming YYYY-MM-DD strings:
        if (payment.paidAt > payment.date) {
            isLate = true;
        }
    }

    const handleSaveRef = () => {
        onUpdateReference(payment, newRef);
        setIsEditingRef(false);
    };

    const handleShareImage = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], 'recibo.png', { type: 'image/png' });
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        navigator.share({ files: [file], title: 'Comprobante', text: `Pago de ${participant.name}` }).catch(console.error);
                    } else {
                        const link = document.createElement('a');
                        link.download = `recibo-${participant.name}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    }
                }
            });
        } catch (err) { console.error(err); }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200,
            display: 'flex', flexDirection: 'column', alignItems: 'center', // Column flex
            overflowY: 'auto', // Allow scroll
            padding: '20px 0',
            backdropFilter: 'blur(10px)'
        }} onClick={onClose}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                margin: 'auto' // Vertically center but allow scrolling
            }} onClick={(e) => e.stopPropagation()}>

                {/* Capture Area */}
                <div ref={cardRef} style={{ width: '320px', marginBottom: '24px' }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        position: 'relative'
                    }}>
                        {/* Receipt Header */}
                        <div style={{
                            backgroundColor: 'var(--color-green)',
                            padding: '32px 20px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                backgroundColor: 'white', color: 'var(--color-green)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <CheckCircle2 size={32} strokeWidth={3} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Pago Exitoso</h2>
                            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>Comprobante Oficial</div>
                        </div>

                        {/* Jagged Edge (CSS Trick) */}
                        <div style={{
                            height: '16px',
                            background: 'radial-gradient(circle, transparent 50%, white 50%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 -10px',
                            transform: 'rotate(180deg)',
                            marginTop: '-1px'
                        }}></div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                                    {formatCurrency(payment.amount)}
                                </div>
                                {payment.currency === 'BS' && (
                                    <div style={{
                                        marginTop: '8px', display: 'inline-block',
                                        padding: '6px 12px', borderRadius: '8px',
                                        backgroundColor: 'var(--ios-bg)', color: 'var(--text-secondary)',
                                        fontSize: '13px', fontWeight: 600
                                    }}>
                                        Bs. {payment.amountBs} @ {payment.exchangeRate}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <ReceiptRow label="Participante" value={participant.name} />
                                <ReceiptRow label="Fecha Pago" value={payment.paidAt ? formatDate(payment.paidAt) : 'N/A'} highlight={isLate} />
                                <ReceiptRow label="Corresponde" value={payment.date ? formatDate(payment.date) : 'N/A'} />

                                <div style={{ borderTop: '2px dashed var(--ios-bg)', margin: '8px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Referencia</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {isEditingRef ? (
                                            <input
                                                autoFocus
                                                value={newRef}
                                                onChange={(e) => setNewRef(e.target.value)}
                                                onBlur={handleSaveRef}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRef()}
                                                style={{ width: '100px', textAlign: 'right', padding: '4px', borderRadius: '4px', border: '1px solid var(--color-blue)' }}
                                            />
                                        ) : (
                                            <span onClick={() => setIsEditingRef(true)} style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, letterSpacing: '1px' }}>
                                                {payment.reference || '#SIN-REF'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '16px', backgroundColor: 'var(--ios-bg)', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Ahorro Fácil • Recibo Digital</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', width: '320px' }}>
                    <button onClick={handleShareImage} className="btn btn-primary" style={{ flex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        <Share2 size={18} /> Imagen
                    </button>
                    <button onClick={onShare} className="btn" style={{ backgroundColor: '#25D366', color: 'white', flex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        WhatsApp
                    </button>
                    <button onClick={onClose} className="btn-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <X size={24} />
                    </button>
                    <button onClick={() => onDelete(payment)} className="btn-icon" style={{ backgroundColor: 'rgba(255,59,48,0.2)', color: '#FF3B30' }}>
                        <Trash2 size={24} />
                    </button>
                </div>

            </div>
        </div>
    );
};

const ReceiptRow = ({ label, value, highlight }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '15px', fontWeight: 600, color: highlight ? 'var(--color-red)' : 'var(--text-primary)' }}>{value}</span>
    </div>
);

export default ReceiptCard;
