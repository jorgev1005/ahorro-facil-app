import React, { useState } from 'react';
import Card from './Card';
import { Plus, ChevronRight, Wallet, Calendar, Users, Trash2, Archive, RefreshCw, XCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomeView = ({ bolsos, onSelectBolso, onRequestCreate, onResetApp, onArchiveBolso, onRestoreBolso, onDeleteBolso }) => {
    const [showArchived, setShowArchived] = useState(false);
    const { user, logout } = useAuth();

    // Filter based on view mode (Archived vs Active)
    // For regular users: Show only theirs (backend filters anyway)
    // For Admin: Backend returns ALL. Split them.

    // Sort logic
    const safeBolsos = bolsos || [];

    const myBolsos = safeBolsos.filter(b => b.userId === user?.id || (!b.userId && !user?.isAdmin)); // Non-admin sees orphaned as theirs? No, backend handles.
    // Actually, Admin sees userId=null as "System/Legacy".

    const communityBolsos = user?.isAdmin
        ? safeBolsos.filter(b => b.userId !== user.id)
        : [];

    const displayedMyBolsos = myBolsos.filter(b => showArchived ? !!b.archived : !b.archived);
    const displayedCommunity = communityBolsos.filter(b => showArchived ? !!b.archived : !b.archived);

    const getFirstName = (fullName) => {
        if (!fullName) return '';
        return fullName.split(' ')[0];
    }

    const handleLogout = () => {
        if (window.confirm('¿Deseas cerrar sesión?')) {
            logout();
            window.location.reload();
        }
    };

    return (
        <div className="home-container animate-enter">
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="text-caption" style={{
                        textTransform: 'capitalize',
                        marginBottom: '4px',
                        fontWeight: 600,
                        fontSize: '13px',
                        letterSpacing: '0.05em'
                    }}>
                        {user ? `Hola, ${getFirstName(user.name)}` : 'Bienvenido'}
                        {user?.isAdmin && <span className="badge" style={{ marginLeft: '8px', background: 'var(--ios-yellow)', color: 'black' }}>ADMIN</span>}
                    </div>
                    <h1 style={{ fontSize: '34px', marginBottom: '4px', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                        {showArchived ? 'Papelera' : 'Mis Bolsos'}
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
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

                    <button
                        onClick={handleLogout}
                        className="btn-icon"
                        style={{
                            backgroundColor: 'rgba(255, 59, 48, 0.1)',
                            color: 'var(--system-red)',
                            border: 'none'
                        }}
                        title="Cerrar Sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* MY BOLSOS SECTION */}
            {displayedMyBolsos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {displayedMyBolsos.map((bolso, index) => (
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

            {/* COMMUNITY / OTHER USERS SECTION (ADMIN ONLY) */}
            {user?.isAdmin && displayedCommunity.length > 0 && (
                <div className="animate-enter" style={{ animationDelay: '0.2s' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Comunidad / Otros Usuarios
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayedCommunity.map((bolso, index) => (
                            <Card
                                key={bolso.id}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                className="animate-enter"
                                glass={true}
                                onClick={() => !showArchived && onSelectBolso(bolso.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h3 style={{ marginBottom: '4px', fontSize: '18px', color: showArchived ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                                {bolso.name}
                                            </h3>
                                            <span style={{ fontSize: '11px', background: 'var(--glass-bg)', padding: '2px 8px', borderRadius: '12px', color: 'var(--ios-blue)' }}>
                                                {bolso.User?.name || 'Sin Asignar'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calendar size={14} />
                                                {bolso.frequency}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Users size={14} />
                                                {bolso.participants.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ paddingLeft: '16px' }}>
                                        <ChevronRight color="var(--text-tertiary)" size={20} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* EMPTY STATE */}
            {displayedMyBolsos.length === 0 && displayedCommunity.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    {/* Reuse existing empty state logic if needed, simplified here */}
                    <p>No hay bolsos para mostrar.</p>
                    {!showArchived && (
                        <button onClick={onRequestCreate} className="btn btn-primary" style={{ marginTop: '16px' }}>
                            <Plus size={18} /> Crear Bolso
                        </button>
                    )}
                </div>
            )}

            {/* Footer Actions only visible in Active View AND if we have My bolsos (or empty) */}
            {!showArchived && (
                <div className="animate-enter" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={onRequestCreate}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '24px' }}
                    >
                        <Plus size={20} />
                        Nuevo Bolso
                    </button>
                    {/* Reset app logic... keep or remove? Keep for now */}
                </div>
            )}
            {/* DEBUG SECTION */}
            <div style={{ marginTop: '40px', padding: '10px', background: '#333', color: '#0f0', fontSize: '10px', borderRadius: '8px', opacity: 0.8 }}>
                <p><strong>DEBUG INFO:</strong></p>
                <p>User ID: {user?.id} ({user?.name})</p>
                <p>Is Admin: {user?.isAdmin ? 'Yes' : 'No'}</p>
                <p>Total Bolsos Fetched: {safeBolsos.length}</p>
                <p>My Bolsos Count: {myBolsos.length}</p>
                <hr style={{ borderColor: '#555' }} />
                {safeBolsos.map(b => (
                    <p key={b.id}>
                        Bolso: {b.name} | Owner: {b.userId} | Match: {b.userId === user?.id ? 'YES' : 'NO'} | Archived: {b.archived ? 'YES' : 'NO'}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default HomeView;
