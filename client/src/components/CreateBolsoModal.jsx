import React, { useState } from 'react';
import Card from './Card';
import { calculateSchedule, calculateEndDate } from '../utils/BolsoLogic';
import { X } from 'lucide-react';

const CreateBolsoModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        startDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD Local
        frequency: 'weekly',
        paymentDay: '',
        duration: 10,
        amount: 30,
        participantsCount: 10
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration' || name === 'amount' || name === 'participantsCount' || name === 'paymentDay'
                ? (value === '' ? '' : parseInt(value))
                : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const schedule = calculateSchedule(
            formData.startDate,
            formData.frequency,
            formData.duration,
            formData.paymentDay
        );

        const config = {
            ...formData,
            schedule,
            endDate: calculateEndDate(schedule)
        };

        onCreate(config);
    };

    const daysOfWeek = [
        { val: 1, label: 'Lunes' },
        { val: 2, label: 'Martes' },
        { val: 3, label: 'Miércoles' },
        { val: 4, label: 'Jueves' },
        { val: 5, label: 'Viernes' },
        { val: 6, label: 'Sábado' },
        { val: 0, label: 'Domingo' },
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <Card className="animate-slide-up" style={{
                width: '100%', maxWidth: '500px', maxHeight: '90vh',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: 0, overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
            }} onClick={(e) => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Nuevo Bolso</h2>
                    <button onClick={onClose} className="btn-icon" style={{ backgroundColor: 'var(--ios-bg)', boxShadow: 'none' }}>
                        <X size={20} color="var(--ios-text-secondary)" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Nombre del Bolso</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Ahorro Navideño 2026"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Inicio</label>
                            <input
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Día Preferido</label>
                            <select
                                name="paymentDay"
                                value={formData.paymentDay}
                                onChange={handleChange}
                            >
                                <option value="">Automático</option>
                                {daysOfWeek.map(d => (
                                    <option key={d.val} value={d.val}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Frecuencia</label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                        >
                            <option value="weekly">Semanal</option>
                            <option value="biweekly">Quincenal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Duración (Pagos)</label>
                            <input
                                name="duration"
                                type="number"
                                min="1"
                                max="52"
                                value={formData.duration}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Participantes</label>
                            <input
                                name="participantsCount"
                                type="number"
                                min="2"
                                max="50"
                                value={formData.participantsCount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={labelStyle}>Monto por Pago ($)</label>
                        <input
                            name="amount"
                            type="number"
                            min="1"
                            value={formData.amount}
                            onChange={handleChange}
                            style={{ fontSize: '18px', fontWeight: 600 }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Crear Bolso
                    </button>
                </form>
            </Card>
        </div>
    );
};

const labelStyle = {
    display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ios-text-secondary)', textTransform: 'uppercase'
};

export default CreateBolsoModal;
