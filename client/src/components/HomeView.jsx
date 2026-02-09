import React, { useState } from 'react';
import Card from './Card';
import { Plus, ChevronRight, Wallet, Calendar, Users, Trash2, Archive, RefreshCw, XCircle } from 'lucide-react';

const HomeView = ({ bolsos, onSelectBolso, onRequestCreate, onResetApp, onArchiveBolso, onRestoreBolso, onDeleteBolso }) => {
    const [showArchived, setShowArchived] = useState(false);

    // Filter based on view mode (Archived vs Active)
    const displayedBolsos = bolsos.filter(b => showArchived ? !!b.archived : !b.archived);

    return (
        <div className="home-container animate-enter">
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '34px', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                        {showArchived ? 'Papelera' : 'Mis Bolsos'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        {showArchived ? 'Bolsos archivados.' : 'Administra tus grupos.'}
                    </p>
                </div>

                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`btn-icon ${showArchived ? 'active' : ''}`}
                    style={{
                        backgroundColor: showArchived ? 'var(--ios-blue)' : 'rgba(255,255,255,0.6)',
                        color: showArchived ? 'white' : 'var(--text-secondary)',
                        border: showArchived ? 'none' : '1px solid rgba(255,255,255,0.6)'
                    }}
                    title={showArchived ? "Ver Activos" : "Ver Papelera"}
                >
                    {showArchived ? <Wallet size={20} color="white" /> : <Archive size={20} />}
                </button>
            </header>

            {displayedBolsos.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    {showArchived ? (
                        <>
                            <Trash2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p>La papelera está vacía.</p>
                        </>
                    ) : (
                        <>
                            <Wallet size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p style={{ marginBottom: '24px' }}>No tienes ningún bolso activo.</p>
                            <button
                                onClick={onRequestCreate}
                                className="btn btn-primary"
                            >
                                <Plus size={18} />
                                Crear el primero
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {displayedBolsos.map((bolso, index) => (
                        <Card
                            key={bolso.id}
                            style={{ animationDelay: `${index * 0.05}s` }}
                            className="animate-enter"
                            glass={true}
                            onClick={() => !showArchived && onSelectBolso(bolso.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '4px', fontSize: '18px', color: showArchived ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                        {bolso.name}
                                    </h3>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
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

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '16px' }}>
                                    {showArchived ? (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRestoreBolso(bolso.id); }}
                                                className="btn-icon"
                                                style={{ width: '36px', height: '36px', color: 'var(--ios-blue)' }}
                                                title="Restaurar"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDeleteBolso(bolso.id); }}
                                                className="btn-icon"
                                                style={{ width: '36px', height: '36px', color: 'var(--ios-red)', backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
                                                title="Eliminar permanentemente"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onArchiveBolso(bolso.id); }}
                                                className="btn-icon"
                                                style={{ width: '36px', height: '36px', color: 'var(--text-tertiary)', backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}
                                                title="Archivar"
                                            >
                                                <Archive size={18} />
                                            </button>
                                            <ChevronRight color="var(--text-tertiary)" size={20} />
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
                <div className="animate-enter" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={onRequestCreate}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '24px' }}
                    >
                        <Plus size={20} />
                        Nuevo Bolso
                    </button>

                    <button
                        onClick={onResetApp}
                        className="btn"
                        style={{
                            marginTop: '20px', width: '100%',
                            color: 'var(--ios-red)', background: 'transparent',
                            fontSize: '14px', opacity: 0.7
                        }}
                    >
                        <Trash2 size={16} />
                        Borrar todos los datos
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomeView;
