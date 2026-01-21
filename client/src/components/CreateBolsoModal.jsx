import React, { useState } from 'react';
import Card from './Card';
import { calculateSchedule, calculateEndDate } from '../utils/BolsoLogic';
import { X } from 'lucide-react';

const CreateBolsoModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        startDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD Local
        frequency: 'weekly',
        paymentDay: '', // Default empty (use start date), or we can set a default
        duration: 10,
        amount: 30,
        participantsCount: 10
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration' || name === 'amount' || name === 'participantsCount'
                ? parseInt(value) || 0
                : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Pass paymentDay (if set) to logic
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
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(5px)'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Nuevo Bolso</h2>
                    <button onClick={onClose}><X size={24} color="var(--ios-text-secondary)" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Nombre</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Ahorro Familiar"
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Inicio</label>
                            <input
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Día de Pago</label>
                            <select
                                name="paymentDay"
                                value={formData.paymentDay}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="">Mismo día</option>
                                {daysOfWeek.map(d => (
                                    <option key={d.val} value={d.val}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Frecuencia</label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="weekly">Semanal</option>
                            <option value="biweekly">Quincenal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Duración (Pagos)</label>
                            <input
                                name="duration"
                                type="number"
                                min="1"
                                max="52"
                                value={formData.duration}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Participantes</label>
                            <input
                                name="participantsCount"
                                type="number"
                                min="2"
                                max="50"
                                value={formData.participantsCount}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Monto por Pago ($)</label>
                        <input
                            name="amount"
                            type="number"
                            min="1"
                            value={formData.amount}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <button type="submit" style={{
                        width: '100%', padding: '16px', backgroundColor: 'var(--ios-blue)', color: 'white',
                        borderRadius: '12px', fontWeight: 600, fontSize: '1rem', border: 'none'
                    }}>
                        Crear Bolso
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
    color: 'var(--ios-text-primary)'
};

export default CreateBolsoModal;
