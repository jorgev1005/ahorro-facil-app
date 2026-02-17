import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Loader, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import '../index.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubscription = async (userId, durationDays) => {
        setUpdating(userId);
        try {
            await adminService.updateSubscription(userId, { durationDays });
            await loadUsers(); // Refresh list
        } catch (error) {
            alert('Error updating subscription');
        } finally {
            setUpdating(null);
        }
    };

    const handleDeactivate = async (userId) => {
        if (!confirm('¿Seguro de desactivar este usuario?')) return;
        setUpdating(userId);
        try {
            await adminService.updateSubscription(userId, { status: 'inactive' });
            await loadUsers();
        } catch (error) {
            alert('Error updating subscription');
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin text-primary" /></div>;

    return (
        <div className="p-4 max-w-6xl mx-auto pb-24">
            <h1 className="text-2xl font-bold mb-6 text-text-primary">Panel de Administración (SaaS)</h1>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 text-text-tertiary" size={20} />
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/10 text-text-primary outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filteredUsers.map(user => {
                    const isExpired = user.subscriptionStatus !== 'active' && (!user.subscriptionEndsAt || new Date(user.subscriptionEndsAt) < new Date());
                    const statusColor = user.subscriptionStatus === 'active' ? 'text-green-400' :
                        user.subscriptionStatus === 'trial' ? 'text-blue-400' : 'text-red-400';

                    return (
                        <div key={user.id} className="glass-card p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-text-primary">{user.name}</h3>
                                <p className="text-sm text-text-secondary">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className={`font-medium ${statusColor} capitalize`}>
                                        {user.subscriptionStatus === 'trial' ? 'Prueba Gratis' :
                                            user.subscriptionStatus === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <span className="text-text-tertiary">•</span>
                                    <span className="text-text-tertiary">
                                        Vence: {user.subscriptionEndsAt ? formatDate(user.subscriptionEndsAt) : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                    onClick={() => handleUpdateSubscription(user.id, 30)}
                                    disabled={updating === user.id}
                                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition text-sm font-medium"
                                >
                                    +1 Mes
                                </button>
                                <button
                                    onClick={() => handleUpdateSubscription(user.id, 365)}
                                    disabled={updating === user.id}
                                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition text-sm font-medium"
                                >
                                    +1 Año
                                </button>
                                {user.subscriptionStatus !== 'inactive' && (
                                    <button
                                        onClick={() => handleDeactivate(user.id)}
                                        disabled={updating === user.id}
                                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
                                    >
                                        Desactivar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPanel;
