import React, { useState } from 'react';
import Card from './Card';
import { X, CheckCircle2, AlertCircle, Clock, Edit2, Check, PieChart, Gift, Printer, Share2, Link } from 'lucide-react';
import { bolsoService, participantService } from '../services/api';
import { formatDate, formatCurrency } from '../utils/formatters';

const ParticipantDetailsModal = ({ participant, bolso, onClose, onPayDate, onViewReceipt, onUpdateName, onUpdateTurn, onRegisterPayout, onViewPayoutReceipt, readOnly }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(participant.name);
    const [linkLoading, setLinkLoading] = useState(false);

    // Turn State
    const [isEditingTurn, setIsEditingTurn] = useState(false);
    const [newTurn, setNewTurn] = useState(participant.turn || '');

    // ... (rest of logic same until return)

    // Helper for List Click
    const handleRowClick = (item) => {
        if (item.status === 'paid') {
            onViewReceipt(item); // Always allow viewing receipts
        } else if (!readOnly) {
            onPayDate(item.date); // Only allow paying if not readOnly
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <Card className="animate-slide-up" style={{
                width: '100%', maxWidth: '500px', maxHeight: '85vh', // Reduced slightly to avoid address bar overlap
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: 0, padding: 0,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', // Key for flex scrolling
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
                backgroundColor: 'var(--ios-bg)'
            }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '20px 24px', backgroundColor: 'white', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            {/* Name Edit */}
                            {isEditingName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <input value={newName} onChange={(e) => setNewName(e.target.value)}
                                        style={{ fontSize: '24px', fontWeight: 600, padding: '4px', borderRadius: '8px', border: '1px solid var(--color-blue)', width: '100%' }} autoFocus />
                                    <button onClick={handleSaveName} style={{ background: 'var(--color-blue)', color: 'white', borderRadius: '50%', padding: '6px', border: 'none' }}><Check size={16} /></button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h2 style={{ margin: 0, fontSize: '24px' }}>{participant.name}</h2>
                                    {!readOnly && <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><Edit2 size={16} /></button>}
                                </div>
                            )}

                            {/* Turn & Payout Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Turno:</span>
                                    {isEditingTurn ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <input type="number" value={newTurn} onChange={(e) => setNewTurn(e.target.value)}
                                                style={{ width: '50px', padding: '2px', borderRadius: '4px', border: '1px solid var(--color-blue)', textAlign: 'center' }} autoFocus />
                                            <button onClick={handleSaveTurn} style={{ background: 'var(--color-blue)', color: 'white', borderRadius: '4px', padding: '2px 6px', border: 'none', fontSize: '13px' }}>OK</button>
                                        </div>
                                    ) : (
                                        <div onClick={() => !readOnly && setIsEditingTurn(true)}
                                            style={{ backgroundColor: 'var(--color-blue)', color: 'white', padding: '2px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: readOnly ? 'default' : 'pointer', opacity: readOnly ? 0.8 : 1 }}>
                                            #{participant.turn || '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Payout Date Display */}
                                {payoutDateDisplay && (
                                    <>
                                        {participant.payoutDate ? (
                                            <div onClick={onViewPayoutReceipt} style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                backgroundColor: 'rgba(52, 199, 89, 0.15)', color: 'var(--color-green)',
                                                padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                                                cursor: 'pointer', border: '1px solid rgba(52, 199, 89, 0.2)'
                                            }}>
                                                <CheckCircle2 size={14} />
                                                <span>Entregado: {formatDate(participant.payoutDate, { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)',
                                                    padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600
                                                }}>
                                                    <Gift size={14} />
                                                    <span>{payoutDateDisplay}</span>
                                                </div>
                                                {!readOnly && (
                                                    <button
                                                        onClick={onRegisterPayout}
                                                        style={{
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px 12px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Entregar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={async () => {
                                    try {
                                        setLinkLoading(true);
                                        const { token } = await participantService.getShareToken(participant.id);
                                        const url = `${window.location.origin}/public/participant/${token}`;
                                        await navigator.clipboard.writeText(url);
                                        alert('Enlace copiado al portapapeles');
                                    } catch (err) {
                                        console.error(err);
                                        alert('Error al generar el enlace');
                                    } finally {
                                        setLinkLoading(false);
                                    }
                                }} className="btn-icon" style={{ backgroundColor: 'var(--ios-bg)' }} title="Copiar Enlace Público">
                                    {linkLoading ? <Clock size={20} className="spin" color="var(--ios-blue)" /> : <Link size={20} color="var(--ios-blue)" />}
                                </button>
                                <button onClick={() => onClose('print')} className="btn-icon" style={{ backgroundColor: 'var(--ios-bg)' }} title="Imprimir Estado de Cuenta">
                                    <Printer size={20} color="var(--ios-blue)" />
                                </button>
                                <button onClick={() => onClose()} className="btn-icon" style={{ backgroundColor: 'var(--ios-bg)' }}><X size={20} color="var(--text-secondary)" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ backgroundColor: 'var(--ios-bg)', padding: '12px', borderRadius: '12px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Pagado</span>
                            <span style={{ display: 'block', fontSize: '18px', fontWeight: 600, color: 'var(--color-green)' }}>{formatCurrency(totalPaid)}</span>
                        </div>
                        <div style={{ backgroundColor: 'var(--ios-bg)', padding: '12px', borderRadius: '12px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Deuda</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 600, color: currentDebt > 0 ? 'var(--color-orange)' : 'var(--text-primary)' }}>{formatCurrency(currentDebt)}</span>
                                {overdueCount > 0 && <span style={{ fontSize: '11px', color: 'var(--color-orange)', fontWeight: 600 }}>({overdueCount})</span>}
                            </div>
                        </div>
                        <div style={{ backgroundColor: 'var(--ios-bg)', padding: '12px', borderRadius: '12px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Faltan</span>
                            <span style={{ display: 'block', fontSize: '18px', fontWeight: 600, color: 'var(--color-blue)' }}>{remainingCount}</span>
                        </div>
                    </div>
                </div>

                {/* List - iOS Style List */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {history.map((item, i) => {
                        const status = getStatusInfo(item);
                        return (
                            <div
                                key={item.date}
                                onClick={() => handleRowClick(item)}
                                className={(!readOnly || item.status === 'paid') ? "active-scale" : ""}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '16px 24px',
                                    backgroundColor: 'white',
                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                    cursor: (!readOnly || item.status === 'paid') ? 'pointer' : 'default'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        backgroundColor: 'var(--ios-bg)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)'
                                    }}>
                                        {item.index + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                                            {formatDate(item.date)}
                                        </div>
                                        <div style={{ fontSize: '13px', color: status.subtextColor, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {status.mainText === 'Pagado' ? (
                                                <> {status.subtext} </>
                                            ) : (status.mainText)}
                                            {item.status === 'partial' && (
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}> ({status.subtext})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text-primary)' }}>
                                        {item.status === 'partial' ? formatCurrency(item.amountPaid) : formatCurrency(item.amount)}
                                    </span>
                                    {status.icon}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card >
        </div >
    );
};

export default ParticipantDetailsModal;
