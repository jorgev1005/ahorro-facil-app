import React from 'react';
import { Printer } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const ParticipantReport = ({ participant, bolso, onClose }) => {
    // 1. Calculations
    const totalExpected = bolso.schedule.length * parseFloat(bolso.amount);

    // Payments for this specific participant
    const payments = bolso.payments.filter(p => p.participantId === participant.id);
    const totalPaid = payments.reduce((acc, curr) => acc + parseFloat(curr.amountPaid), 0);

    // Remaining to complete
    const remaining = totalExpected - totalPaid;

    // Overdue calculation
    const todayStr = new Date().toLocaleDateString('en-CA');
    const scheduleUntilNow = bolso.schedule.filter(d => d < todayStr);

    let overdueAmount = 0;
    // Simple logic: Expected so far vs Paid so far
    // Or strictly by missed dates? Let's do missed dates for accuracy in report.
    // Actually, "Deuda Vencida" is usually (Count of Dates < Today) * Amount - (Count of Full Payments).
    // Let's use the logic: Sum of (Amount - Paid) for all dates in paste?
    // Let's stick to the visual logic:
    // For each date < today: if no payment (or partial), add distinct.

    // Better Logic aligned with details view:
    const history = bolso.schedule.map(date => {
        const pay = payments.find(p => p.date === date);
        const amount = bolso.amount || 30;
        const paid = pay ? parseFloat(pay.amountPaid) : 0;
        return { date, amount, paid, status: pay ? pay.status : 'pending' };
    });

    overdueAmount = history
        .filter(item => item.date < todayStr && item.paid < item.amount)
        .reduce((sum, item) => sum + (item.amount - item.paid), 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,1)', zIndex: 2000,
            overflowY: 'auto'
        }}>
            {/* No Print Toolbar */}
            <div className="no-print" style={{
                position: 'fixed', top: 0, left: 0, right: 0,
                backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #ddd'
            }}>
                <button onClick={onClose} style={{
                    border: 'none', background: 'none', color: '#007AFF', fontSize: '16px', fontWeight: 600, cursor: 'pointer'
                }}>
                    Cerrar
                </button>
                <button onClick={handlePrint} style={{
                    backgroundColor: '#007AFF', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <Printer size={16} />
                    Imprimir / PDF
                </button>
            </div>

            {/* Printable Content */}
            <div className="report-content" style={{ padding: '80px 40px 40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

                {/* Header */}
                <div style={{ marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Estado de Cuenta</h1>
                        <span style={{ fontSize: '18px', fontWeight: 600, color: '#666' }}>{participant.name}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', marginTop: '8px' }}>
                        <span>Bolso: <strong>{bolso.name}</strong></span>
                        <span>Generado: {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Financial Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Total Pagado</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#34C759' }}>{formatCurrency(totalPaid)}</span>
                        <span style={{ display: 'block', fontSize: '12px', color: '#999', marginTop: '4px' }}>de {formatCurrency(totalExpected)}</span>
                    </div>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Deuda Vencida</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: overdueAmount > 0 ? '#FF3B30' : '#ccc' }}>{formatCurrency(overdueAmount)}</span>
                        {overdueAmount === 0 && <span style={{ display: 'block', fontSize: '12px', color: '#34C759', marginTop: '4px' }}>¡Al día!</span>}
                    </div>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Resta por Pagar</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>{formatCurrency(remaining)}</span>
                    </div>
                </div>

                {/* Payout Info Section */}
                <div style={{ marginBottom: '40px', padding: '20px', border: '2px dashed #ddd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>Fecha de Entrega (Turno #{participant.turn || '?'})</h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            {participant.turn && bolso.schedule[participant.turn - 1]
                                ? formatDate(bolso.schedule[participant.turn - 1], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                                : 'Por definir'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {participant.payoutDate ? (
                            <div style={{ color: '#34C759', fontWeight: 700, fontSize: '18px' }}>
                                ENTREGADO <br />
                                <span style={{ fontSize: '14px', fontWeight: 400 }}>{formatDate(participant.payoutDate)}</span>
                            </div>
                        ) : (
                            <div style={{ color: '#007AFF', fontWeight: 700, fontSize: '24px' }}>
                                {formatCurrency(parseFloat(bolso.amount) * bolso.participants.length)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Table */}
                <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Cronograma de Pagos</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '10px', width: '50px' }}>#</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Fecha Programada</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Monto Cuota</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Abonado</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bolso.schedule.map((date, index) => {
                            const pay = payments.find(p => p.date === date);
                            const amount = bolso.amount || 30;
                            const paid = pay ? parseFloat(pay.amountPaid) : 0;

                            // Determine display status
                            let statusText = 'Pendiente';
                            let statusColor = '#ccc';

                            if (pay) {
                                if (paid >= amount) {
                                    statusText = 'Pagado';
                                    statusColor = '#34C759';
                                } else {
                                    statusText = 'Parcial';
                                    statusColor = '#007AFF';
                                }
                            } else if (date < todayStr) {
                                statusText = 'Vencido';
                                statusColor = '#FF3B30';
                            }

                            return (
                                <tr key={date} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px 10px', color: '#666' }}>{index + 1}</td>
                                    <td style={{ padding: '12px 10px' }}>{formatDate(date)}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right', color: '#666' }}>{formatCurrency(amount)}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600 }}>{paid > 0 ? formatCurrency(paid) : '-'}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right', color: statusColor, fontWeight: 700 }}>
                                        {statusText}
                                        {pay && pay.paidAt && (statusText === 'Pagado' || statusText === 'Parcial') && (
                                            <div style={{ fontSize: '10px', color: '#999', fontWeight: 400 }}>
                                                {formatDate(pay.paidAt)}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {/* Footer */}
                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '12px', color: '#999', textAlign: 'center' }}>
                    Reporte individual generado automáticamente por Ahorro Fácil
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; background: white; }
                    .report-content { padding: 20px !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                }
            `}</style>
        </div>
    );
};

export default ParticipantReport;
