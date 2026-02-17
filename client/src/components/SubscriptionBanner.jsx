import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import { AlertTriangle, Clock } from 'lucide-react';

const SubscriptionBanner = () => {
    const { user } = useAuth();

    if (!user || user.isAdmin) return null;

    const expiryDate = user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) : null;
    if (!expiryDate) return null;

    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    // Only show if expired or expiring in less than 5 days
    if (daysLeft > 5) return null;

    const isExpired = daysLeft <= 0;

    return (
        <div className={`w-full p-3 flex justify-center items-center gap-2 text-sm font-medium text-center shadow-lg backdrop-blur-md z-50 ${isExpired ? 'bg-red-500/90 text-white' : 'bg-yellow-500/90 text-black'}`}>
            {isExpired ? (
                <>
                    <AlertTriangle size={18} />
                    <span>Tu suscripción ha vencido. Modo solo lectura activado. Contacta al soporte.</span>
                </>
            ) : (
                <>
                    <Clock size={18} />
                    <span>Tu prueba vence en {daysLeft} días. ¡Asegura tu acceso!</span>
                </>
            )}
        </div>
    );
};

export default SubscriptionBanner;
