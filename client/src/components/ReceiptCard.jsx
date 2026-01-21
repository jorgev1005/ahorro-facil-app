import React, { useState, useRef } from 'react';
import Card from './Card';
import { Share2, X, CheckCircle2, AlertCircle, Edit2, Download, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import html2canvas from 'html2canvas';

const ReceiptCard = ({ payment, participant = {}, onClose, onShare, onUpdateReference, onDelete }) => {
    const [isEditingRef, setIsEditingRef] = useState(false);
    const [newRef, setNewRef] = useState(payment.reference || '');
    const cardRef = useRef(null);

    // Safe Late Check
    let isLate = false;
    let daysLate = 0;

    if (payment.paidAt && payment.date && typeof payment.paidAt === 'string' && typeof payment.date === 'string') {
        const paidAtTime = new Date(payment.paidAt).getTime(); // fast check
        const dateTime = new Date(payment.date).getTime();

        // String comparison usually work for YYYY-MM-DD but let's be robust
        if (payment.paidAt > payment.date) {
            isLate = true;
            try {
                const [sy, sm, sd] = payment.date.split('-').map(Number);
                const [py, pm, pd] = payment.paidAt.split('-').map(Number);

                const sDate = new Date(sy, sm - 1, sd);
                const pDate = new Date(py, pm - 1, pd);

                const diffTime = Math.abs(pDate - sDate);
                daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } catch (e) {
                isLate = false;
            }
        }
    }

    const handleSaveRef = () => {
        onUpdateReference(payment, newRef);
        setIsEditingRef(false);
    };

    const handleShareImage = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2
            });

            canvas.toBlob(blob => {
                if (blob) {
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'recibo.png', { type: 'image/png' })] })) {
                        navigator.share({
                            files: [new File([blob], 'recibo.png', { type: 'image/png' })],
                            title: 'Comprobante de Pago',
                            text: `Pago de ${participant.name}`
                        }).catch(console.error);
                    } else {
                        const link = document.createElement('a');
                        link.download = `recibo-${participant.name}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    }
                }
            });
        } catch (err) {
            console.error("Error generating image:", err);
            alert("No se pudo generar la imagen");
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(5px)',
            overflowY: 'auto'
        }}>
            <div style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 'auto' }}>
                {/* Capture Area */}
                <div ref={cardRef} style={{ width: '100%', maxWidth: '300px' }}>
                    <Card style={{
                        width: '100%',
                        padding: '0',
                        overflow: 'hidden',
                        borderRadius: '16px',
                        backgroundColor: '#fff',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        marginBottom: '12px'
                    }}>
                        {/* Header - Compact */}
                        <div style={{
                            backgroundColor: 'var(--ios-green)',
                            padding: '16px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            color: 'white'
                        }}>
                            <div style={{ padding: '6px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                                <CheckCircle2 size={32} strokeWidth={3} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Pago Exitoso</h2>
                        </div>

                        {/* Body - Ultra Compact */}
                        <div style={{ padding: '16px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--ios-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monto Pagado</span>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ios-text-primary)' }}>
                                    {formatCurrency(payment.amount)}
                                </div>

                                {/* BS info */}
                                {payment.currency === 'BS' && (
                                    <div style={{ marginTop: '4px', padding: '4px 10px', backgroundColor: 'var(--ios-bg-secondary)', borderRadius: '6px', display: 'inline-block' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ios-text-primary)' }}>
                                            Bs. {payment.amountBs}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--ios-text-secondary)' }}>
                                            Tasa: {payment.exchangeRate}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isLate && (
                                <div style={{
                                    backgroundColor: '#FF3B3015', color: '#FF3B30', padding: '6px', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px',
                                    fontWeight: 600, fontSize: '0.8rem'
                                }}>
                                    <AlertCircle size={14} />
                                    <span>Atrasado ({daysLate}d)</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--ios-separator)', paddingTop: '12px', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--ios-text-secondary)' }}>Participante</span>
                                    <span style={{ fontWeight: 600 }}>{participant.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--ios-text-secondary)' }}>Fecha Pago</span>
                                    <span style={{ fontWeight: 600, color: isLate ? 'var(--ios-red)' : 'inherit' }}>{formatDate(payment.paidAt)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--ios-text-secondary)' }}>Corresponde</span>
                                    <span style={{ fontWeight: 600 }}>{formatDate(payment.date)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--ios-text-secondary)' }}>Referencia</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {isEditingRef ? (
                                            <input
                                                autoFocus
                                                className="ref-input"
                                                value={newRef}
                                                onChange={(e) => setNewRef(e.target.value)}
                                                onBlur={handleSaveRef}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRef()}
                                                style={{
                                                    width: '70px', textAlign: 'right', padding: '2px', borderRadius: '4px',
                                                    border: '1px solid var(--ios-blue)'
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 600 }}>{payment.reference || '---'}</span>
                                        )}
                                        {!isEditingRef && (
                                            <Edit2 size={12} color="var(--ios-text-secondary)" style={{ cursor: 'pointer' }} onClick={() => setIsEditingRef(true)} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.65rem', color: 'var(--ios-text-secondary)', fontStyle: 'italic' }}>
                                Recibo Digital • {payment.receiptStatus === 'sent' ? 'Enviado' : 'Generado'}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '300px', paddingBottom: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '10px',
                            backgroundColor: '#3A3A3C', color: 'white', fontWeight: 600,
                            border: 'none', fontSize: '0.8rem', cursor: 'pointer',
                        }}
                    >
                        Cerrar
                    </button>

                    <button
                        onClick={onShare}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '10px',
                            backgroundColor: 'var(--ios-green)', color: 'white', fontWeight: 600,
                            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            fontSize: '0.8rem', cursor: 'pointer',
                        }}
                    >
                        <Share2 size={16} />
                        Txt
                    </button>

                    <button
                        onClick={handleShareImage}
                        style={{
                            flex: 2, padding: '12px', borderRadius: '10px',
                            backgroundColor: 'var(--ios-blue)', color: 'white', fontWeight: 600,
                            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            fontSize: '0.8rem', cursor: 'pointer',
                        }}
                    >
                        <Download size={16} />
                        Img
                    </button>
                </div>

                {/* Delete Button - Danger Zone */}
                <button
                    onClick={() => onDelete(payment)}
                    style={{
                        padding: '10px', borderRadius: '20px', background: 'none',
                        color: 'var(--ios-red)', fontWeight: 500,
                        border: '1px solid rgba(255,59,48, 0.3)', display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px'
                    }}
                >
                    <Trash2 size={14} />
                    Eliminar Pago (Corregir)
                </button>
            </div>
        </div>
    );
};

export default ReceiptCard;
