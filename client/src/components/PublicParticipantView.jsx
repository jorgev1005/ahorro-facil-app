import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';
import { Loader, CheckCircle, Clock } from 'lucide-react';
import '../index.css'; // Ensure styles are loaded

const PublicParticipantView = () => {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use production URL directly since this might be accessed outside main app context/env
    // Or rely on the same build config.
    const API_URL = import.meta.env.VITE_API_URL || 'https://bolso-api.grupoaludra.com/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/public/participant/${token}`);
                setData(response.data);
            } catch (err) {
                console.error(err);
                setError('Enlace inválido o expirado');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--ios-background)' }}>
            <Loader className="spin" size={32} color="var(--ios-blue)" />
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px', background: 'var(--ios-background)' }}>
            <h2 style={{ color: 'var(--ios-red)' }}>Error</h2>
            <p>{error}</p>
        </div>
    );

    const { participant, bolso } = data;
    const paidAmount = participant.Payments.reduce((acc, curr) => acc + parseFloat(curr.amountPaid), 0);
    const totalExpected = parseFloat(bolso.amount) * bolso.schedule.length; // Approximate if strictly weekly
    // A better expected is: how many weeks passed * amount? Or just total share?
    // Let's show Total Paid vs Total Share

    return (
        <div className="app-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card animate-enter" style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{bolso.name}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Resumen del Participante</p>
            </div>

            <div className="glass-card animate-enter" style={{ animationDelay: '0.1s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar-placeholder" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                        {participant.name.charAt(0)}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', margin: 0 }}>{participant.name}</h2>
                        <span style={{
                            fontSize: '14px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: participant.payoutDate ? 'var(--ios-green)' : 'var(--glass-border)',
                            color: participant.payoutDate ? '#fff' : 'var(--text-secondary)',
                            marginTop: '4px',
                            display: 'inline-block'
                        }}>
                            {participant.payoutDate ? 'Entregado 🎉' : 'En Espera'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Aportado</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ios-blue)' }}>
                            {formatCurrency(paidAmount)}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Total Cuota</div>
                        <div style={{ fontSize: '18px', fontWeight: 600 }}>
                            {formatCurrency(totalExpected)}
                        </div>
                    </div>
                </div>
            </div>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', paddingLeft: '8px' }}>Historial de Pagos</h3>

            <div className="glass-card animate-enter" style={{ animationDelay: '0.2s', padding: 0, overflow: 'hidden' }}>
                {participant.Payments.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Sin pagos registrados.
                    </div>
                ) : (
                    participant.Payments.map((payment, idx) => (
                        <div key={payment.id} style={{
                            padding: '16px',
                            borderBottom: idx < participant.Payments.length - 1 ? '1px solid var(--glass-border)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'var(--ios-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff'
                                }}>
                                    <CheckCircle size={16} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>Pago Registrado</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{payment.date}</div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 600 }}>
                                {formatCurrency(payment.amountPaid)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PublicParticipantView;
