export const calculateSchedule = (startDate, frequency, duration, targetDay = null) => {
    const dates = [];

    // Parse "YYYY-MM-DD" explicitly to Local Time
    const [y, m, d] = startDate.split('-').map(Number);
    // Create date at Local Noon to avoid DST/Timezone border issues
    let current = new Date(y, m - 1, d, 12, 0, 0);

    // If a target day is specified (0-6), find the next occurrence
    // valid targetDay: 0 (Sun) - 6 (Sat)
    if (targetDay !== null && targetDay !== undefined && targetDay !== '') {
        const currentDay = current.getDay();
        const target = parseInt(targetDay);

        let diff = target - currentDay;
        if (diff < 0) {
            diff += 7;
        }
        // If diff is 0, it means Today is the day. We keep it. 
        // If user wants "Next Friday" when today is Friday, logic might need check.
        // Usually, if today matches, we start today.

        current.setDate(current.getDate() + diff);
    }

    for (let i = 0; i < duration; i++) {
        // Format manual YYYY-MM-DD to ensure we keep the local date "stable"
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);

        // Add interval
        if (frequency === 'weekly') {
            current.setDate(current.getDate() + 7);
        } else if (frequency === 'biweekly') {
            current.setDate(current.getDate() + 14);
        } else if (frequency === 'monthly') {
            current.setMonth(current.getMonth() + 1);
        }
    }

    return dates;
};

export const generateParticipants = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Participante ${i + 1}`,
    }));
};

export const calculateEndDate = (schedule) => {
    if (!schedule || schedule.length === 0) return '';
    return schedule[schedule.length - 1];
};
