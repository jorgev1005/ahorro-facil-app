import React, { useState } from 'react';
import Card from './Card';
import { X, CheckCircle2, AlertCircle, Clock, Calendar, Edit2, Check, DollarSign, PieChart, Gift } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const ParticipantDetailsModal = ({ participant, bolso, onClose, onPayDate, onViewReceipt, onUpdateName, onUpdateTurn }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(participant.name);

    // Turn State
    const [isEditingTurn, setIsEditingTurn] = useState(false);
    const [newTurn, setNewTurn] = useState(participant.turn || '');

    // Payout Date Calculation
    let payoutDateDisplay = null;
    if (participant.turn && bolso.schedule && bolso.schedule[participant.turn - 1]) {
        payoutDateDisplay = formatDate(bolso.schedule[participant.turn - 1], { month: 'long', day: 'numeric' });
    }

    // 1. Construct the complete history
    const history = bolso.schedule.map((date, index) => {
        const payment = bolso.payments.find(p => p.participantId === participant.id && p.date === date);
        const totalDue = bolso.amount || 30;

        if (payment) {
            return {
                ...payment,
                index,
                amountPaid: payment.amountPaid || payment.amount,
                status: payment.status || 'paid'
            };
        }

        return {
            id: `${participant.id}-${date}`,
            participantId: participant.id,
            date: date,
            amount: totalDue,
            amountPaid: 0,
            status: 'pending',
            index
        };
    });

    // 2. Calculate Stats
    const todayStr = new Date().toLocaleDateString('en-CA');

    const totalPaid = history
        .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

    const overdueItems = history.filter(p => {
        return (p.status === 'pending' || p.status === 'partial') && p.date < todayStr;
    });

    const currentDebt = overdueItems.reduce((sum, p) => {
        const fullAmount = bolso.amount || 30;
        const paid = Number(p.amountPaid) || 0;
        return sum + (fullAmount - paid);
    }, 0);

    const overdueCount = overdueItems.length;
    const remainingCount = history.filter(p => p.status !== 'paid').length;

    const handleSaveName = () => {
        if (newName.trim()) {
            onUpdateName(participant.id, newName);
            setIsEditingName(false);
        }
    };

    const handleSaveTurn = () => {
        onUpdateTurn(participant.id, newTurn);
        setIsEditingTurn(false);
    };

    const getStatusInfo = (item) => {
        if (item.status === 'paid') {
            const isLate = item.paidAt && item.paidAt > item.date;
            const receiptLabel = item.receiptStatus === 'sent' ? 'Enviado' : 'Emitido';
            return {
                icon: <CheckCircle2 size={24} color={isLate ? "var(--ios-orange)" : "var(--ios-green)"} />,
                color: "var(--ios-text-primary)",
                mainText: 'Pagado',
                subtext: `el ${formatDate(item.paidAt)} • ${receiptLabel}`,
                subtextColor: isLate ? 'var(--ios-orange)' : 'var(--ios-green)'
            };
        }

        if (item.status === 'partial') {
            return {
                icon: <PieChart size={24} color="var(--ios-blue)" />,
                color: "var(--ios-text-primary)",
                mainText: `Abonado: ${formatCurrency(item.amountPaid)}`,
                subtext: `Resta: ${formatCurrency((bolso.amount || 30) - item.amountPaid)}`,
                subtextColor: "var(--ios-blue)"
            };
        }

        const isOverdue = item.date < todayStr;
        if (isOverdue) {
            return {
                icon: <AlertCircle size={24} color="var(--ios-red)" />,
                color: "var(--ios-red)",
                mainText: 'Vencido',
                subtext: 'Pago Atrasado',
                subtextColor: 'var(--ios-red)'
            };
        }

        return {
            icon: <Clock size={24} color="var(--ios-text-tertiary)" />,
            color: "var(--ios-text-primary)",
            mainText: 'Pendiente',
            subtext: 'Esperando fecha',
            subtextColor: "var(--ios-text-secondary)"
        };
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(5px)'
        }}>
            <Card style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--ios-separator)', backgroundColor: 'var(--ios-bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            {/* Name Edit */}
                            {isEditingName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <input value={newName} onChange={(e) => setNewName(e.target.value)}
                                        style={{ fontSize: '1.5rem', fontWeight: 600, padding: '4px', borderRadius: '8px', border: '1px solid var(--ios-blue)', width: '100%' }} autoFocus />
                                    <button onClick={handleSaveName} style={{ background: 'var(--ios-blue)', color: 'white', borderRadius: '50%', padding: '4px', border: 'none' }}><Check size={16} /></button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{participant.name}</h2>
                                    <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><Edit2 size={16} /></button>
                                </div>
                            )}

                            {/* Turn & Payout Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--ios-text-secondary)' }}>Turno:</span>
                                    {isEditingTurn ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <input type="number" value={newTurn} onChange={(e) => setNewTurn(e.target.value)}
                                                style={{ width: '50px', padding: '2px', borderRadius: '4px', border: '1px solid var(--ios-blue)', textAlign: 'center' }} autoFocus />
                                            <button onClick={handleSaveTurn} style={{ background: 'var(--ios-blue)', color: 'white', borderRadius: '4px', padding: '2px 6px', border: 'none', fontSize: '0.8rem' }}>OK</button>
                                        </div>
                                    ) : (
                                        <div onClick={() => setIsEditingTurn(true)}
                                            style={{ backgroundColor: 'var(--ios-blue)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                            #{participant.turn || '?'}
                                        </div>
                                    )}
                                </div>

                                {/* Payout Date Display */}
                                {payoutDateDisplay && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        backgroundColor: '#34C75920', color: 'var(--ios-green)',
                                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600
                                    }}>
                                        <Gift size={12} />
                                        <span>Recibe: {payoutDateDisplay}</span>
                                    </div>
                                )}
                            </div>


                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="var(--ios-text-secondary)" /></button>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ios-text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Pagado</span>
                            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 600, color: 'var(--ios-green)' }}>{formatCurrency(totalPaid)}</span>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ios-text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Deuda</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: currentDebt > 0 ? 'var(--ios-orange)' : 'var(--ios-text-primary)' }}>{formatCurrency(currentDebt)}</span>
                                {overdueCount > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--ios-orange)', fontWeight: 500 }}>({overdueCount})</span>}
                            </div>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ios-text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Faltan</span>
                            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 600, color: 'var(--ios-blue)' }}>{remainingCount}</span>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }}>
                    {history.map((item) => {
                        const status = getStatusInfo(item);
                        return (
                            <div
                                key={item.date}
                                onClick={() => item.status === 'paid' ? onViewReceipt(item) : onPayDate(item.date)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 16px', marginBottom: '12px',
                                    backgroundColor: 'var(--ios-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--ios-separator)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s active'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: 'var(--ios-bg-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: 600, color: 'var(--ios-text-secondary)'
                                    }}>
                                        {item.index + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {formatDate(item.date)}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: status.subtextColor, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {status.mainText === 'Pagado' ? (
                                                <> <CheckCircle2 size={12} /> {status.subtext} </>
                                            ) : (status.mainText)}
                                            {item.status === 'partial' && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--ios-text-tertiary)' }}> ({status.subtext})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                                        {item.status === 'partial' ? formatCurrency(item.amountPaid) : formatCurrency(item.amount)}
                                    </span>
                                    {status.icon}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default ParticipantDetailsModal;
