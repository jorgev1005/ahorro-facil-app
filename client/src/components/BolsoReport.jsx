import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const BolsoReport = ({ bolso, onClose }) => {
    // Calculations
    const totalExpected = bolso.participants.length * bolso.schedule.length * parseFloat(bolso.amount);
    const totalCollected = bolso.payments.reduce((acc, curr) => acc + parseFloat(curr.amountPaid), 0);
    const totalPaidOut = bolso.participants.reduce((acc, curr) => acc + (parseFloat(curr.payoutAmount) || 0), 0);
    const balance = totalCollected - totalPaidOut;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const expectedCount = bolso.schedule.filter(d => d <= todayStr).length;

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
                    <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{bolso.name}</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                        <span>Reporte Semanal</span>
                        <span>Generado: {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Financial Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Recaudado</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#007AFF' }}>{formatCurrency(totalCollected)}</span>
                        <span style={{ display: 'block', fontSize: '12px', color: '#999', marginTop: '4px' }}>de {formatCurrency(totalExpected)}</span>
                    </div>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Entregado</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>{formatCurrency(totalPaidOut)}</span>
                    </div>
                    <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>En Caja (Liquidez)</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: balance >= 0 ? '#34C759' : '#FF3B30' }}>{formatCurrency(balance)}</span>
                    </div>
                </div>

                {/* Participants Table */}
                <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Detalle de Participantes</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '10px', width: '50px' }}>#</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Nombre</th>
                            <th style={{ textAlign: 'center', padding: '10px' }}>Progreso Pagos</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Estado Pagos</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Entrega Bolso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bolso.participants.map((p, index) => {
                            const payments = bolso.payments.filter(pay => pay.participantId === p.id);
                            const paidCount = payments.length;
                            const overdue = Math.max(0, expectedCount - paidCount);
                            const paidAmount = payments.reduce((sum, pay) => sum + parseFloat(pay.amountPaid), 0);

                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px 10px', color: '#666' }}>{p.turn || '-'}</td>
                                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                        {paidCount} / {bolso.schedule.length}
                                        <div style={{ fontSize: '11px', color: '#888' }}>{formatCurrency(paidAmount)}</div>
                                    </td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                        {overdue > 0 ? (
                                            <span style={{ color: '#FF3B30', fontWeight: 700 }}>Debe {overdue} cuota{overdue > 1 ? 's' : ''}</span>
                                        ) : (
                                            <span style={{ color: '#34C759', fontWeight: 600 }}>Al día</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                                        {p.payoutDate ? (
                                            <div>
                                                <span style={{ display: 'block', color: '#34C759', fontWeight: 600 }}>Entregado</span>
                                                <span style={{ fontSize: '11px', color: '#666' }}>{formatDate(p.payoutDate)}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#ccc' }}>Pendiente</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '12px', color: '#999', textAlign: 'center' }}>
                    Reporte generado automáticamente por Ahorro Fácil
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

export default BolsoReport;
