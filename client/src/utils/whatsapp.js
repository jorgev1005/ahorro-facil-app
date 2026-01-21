export const generateWhatsAppMessage = (participants, payments, date) => {
    const header = `*Bolso - ${date}*\n\n`;

    const width = Math.max(...participants.map(p => p.name.length));

    const list = participants.map(p => {
        const isPaid = payments.some(pay => pay.participantId === p.id && pay.date === date);
        return `${isPaid ? '✅' : '❌'} ${p.name}`;
    }).join('\n');

    const total = payments.filter(p => p.date === date).reduce((acc, curr) => acc + curr.amount, 0);
    const expected = participants.length * 30;

    const footer = `\n\n*Total: $${total} / $${expected}*`;

    return encodeURIComponent(header + list + footer);
};

export const openWhatsApp = (message) => {
    window.open(`https://wa.me/?text=${message}`, '_blank');
};
