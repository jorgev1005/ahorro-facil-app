export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '';

    let date;

    // 1. Try strict YYYY-MM-DD to avoid timezone shifts for pure dates
    // Check if it's a string and matches simplified ISO format "2026-01-21"
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [y, m, d] = dateString.split('-').map(Number);
        date = new Date(y, m - 1, d, 12, 0, 0); // Noon Local
    } else {
        // 2. Fallback for ISO Timestamps (2026-01-21T...) or Date objects
        date = new Date(dateString);
    }

    // 3. Safety Check
    if (isNaN(date.getTime())) {
        console.warn('Invalid date passed to formatter:', dateString);
        return String(dateString); // Return original value as fallback
    }

    // 4. Default options
    const defaultOptions = {
        day: '2-digit',
        month: 'short' // "ene.", "feb."
    };

    return new Intl.DateTimeFormat('es-VE', { ...defaultOptions, ...options }).format(date);
};
