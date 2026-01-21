export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    // Fix: Parse YYYY-MM-DD manually to create local date, avoiding timezone shifts
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0); // Noon

    return new Intl.DateTimeFormat('es-VE', {
        day: '2-digit',
        month: 'short' // "ene.", "feb."
    }).format(date);
};
