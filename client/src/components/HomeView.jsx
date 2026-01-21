import React, { useState } from 'react';
import Card from './Card';
import { Plus, ChevronRight, Wallet, Calendar, Users, Trash2, Archive, RefreshCw, XCircle } from 'lucide-react';

const HomeView = ({ bolsos, onSelectBolso, onRequestCreate, onResetApp, onArchiveBolso, onRestoreBolso, onDeleteBolso }) => {
    const [showArchived, setShowArchived] = useState(false);

    // Filter based on view mode (Archived vs Active)
    // Default legacy bolsos (without 'archived' prop) are treated as active (false)
    const displayedBolsos = bolsos.filter(b => showArchived ? !!b.archived : !b.archived);

    return (
        <div className="home-container">
            <header style={{ marginBottom: '24px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                        {showArchived ? 'Papelera' : 'Mis Bolsos'}
                    </h1>
                    <p style={{ color: 'var(--ios-text-secondary)' }}>
                        {showArchived ? 'Bolsos archivados.' : 'Administra tus grupos de ahorro.'}
                    </p>
                </div>

                <button
                    onClick={() => setShowArchived(!showArchived)}
                    style={{
                        padding: '10px',
                        borderRadius: '50%',
                        backgroundColor: showArchived ? 'var(--ios-blue)' : 'var(--ios-card-bg)',
                        color: showArchived ? 'white' : 'var(--ios-text-secondary)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                    title={showArchived ? "Ver Activos" : "Ver Papelera"}
                >
                    {showArchived ? <Wallet size={20} /> : <Archive size={20} />}
                </button>
            </header>

            {displayedBolsos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ios-text-secondary)' }}>
                    {showArchived ? (
                        <>
                            <Trash2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>La papelera está vacía.</p>
                        </>
                    ) : (
                        <>
                            <Wallet size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>No tienes ningún bolso activo.</p>
                            <button
                                onClick={onRequestCreate}
                                style={{
                                    marginTop: '16px', color: 'var(--ios-blue)', fontWeight: 600, fontSize: '1rem',
                                    background: 'none', border: 'none', cursor: 'pointer'
                                }}>
                                Crear el primero
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayedBolsos.map(bolso => (
                        <Card
                            key={bolso.id}
                            className="bolso-card"
                            style={{ position: 'relative' }} // For absolute positioning of actions if needed, or flex
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div
                                    onClick={() => !showArchived && onSelectBolso(bolso.id)}
                                    style={{ flex: 1, cursor: showArchived ? 'default' : 'pointer' }}
                                >
                                    <h3 style={{ marginBottom: '6px', fontSize: '1.2rem', color: showArchived ? 'var(--ios-text-secondary)' : 'inherit' }}>{bolso.name}</h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--ios-text-secondary)', display: 'flex', gap: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={14} />
                                            {bolso.frequency === 'weekly' ? 'Semanal' : bolso.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={14} />
                                            {bolso.participants.length}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingLeft: '16px', borderLeft: '1px solid var(--ios-separator)' }}>
                                    {showArchived ? (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRestoreBolso(bolso.id); }}
                                                style={{ color: 'var(--ios-blue)', padding: '4px' }}
                                                title="Restaurar"
                                            >
                                                <RefreshCw size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteBolso(bolso.id); }}
                                                style={{ color: 'var(--ios-red)', padding: '4px' }}
                                                title="Eliminar permanentemente"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {/* Archive Button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onArchiveBolso(bolso.id); }}
                                                style={{ color: 'var(--ios-text-secondary)', padding: '4px' }}
                                                title="Archivar"
                                            >
                                                <Archive size={20} />
                                            </button>
                                            <div onClick={() => onSelectBolso(bolso.id)} style={{ cursor: 'pointer' }}>
                                                <ChevronRight color="var(--ios-text-secondary)" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Footer Actions only visible in Active View */}
            {!showArchived && bolsos.length > 0 && (
                <>
                    <button
                        onClick={onRequestCreate}
                        style={{
                            marginTop: '20px', width: '100%', padding: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            color: 'var(--ios-blue)', fontWeight: 600, backgroundColor: 'var(--ios-card-bg)',
                            borderRadius: 'var(--radius-l)', boxShadow: 'var(--shadow-sm)', border: 'none', cursor: 'pointer'
                        }}>
                        <Plus size={20} />
                        Nuevo Bolso
                    </button>

                    <button
                        onClick={onResetApp}
                        style={{
                            marginTop: '32px', width: '100%', padding: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            color: 'var(--ios-red)', fontSize: '0.9rem', opacity: 0.8,
                            border: 'none', background: 'none', cursor: 'pointer'
                        }}>
                        <Trash2 size={16} />
                        Borrar todos los datos
                    </button>
                </>
            )}
        </div>
    );
};

export default HomeView;
