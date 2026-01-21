import React from 'react';
import Card from './Card';
import { CheckCircle2, Circle } from 'lucide-react';

const ParticipantRow = ({ participant, paidCount, totalCount, hasPaidToday, onTogglePayment }) => {
    const percentage = Math.round((paidCount / totalCount) * 100);

    return (
        <div
            onClick={() => onTogglePayment(participant.id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--ios-separator)',
                cursor: 'pointer'
            }}
        >
            <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {participant.turn && (
                        <span style={{
                            fontSize: '0.8rem', backgroundColor: 'var(--ios-blue)', color: 'white',
                            padding: '1px 6px', borderRadius: '6px', fontWeight: 700
                        }}>
                            #{participant.turn}
                        </span>
                    )}
                    {participant.name}
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        flex: 1, height: '6px', backgroundColor: '#F2F2F7', borderRadius: '3px', overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${percentage}%`, height: '100%', backgroundColor: 'var(--ios-green)', borderRadius: '3px'
                        }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ios-text-secondary)', minWidth: '35px', textAlign: 'right' }}>
                        {paidCount}/{totalCount}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* We can still show indicator for "Next Unpaid" or just a generic arrow? 
             Previously it showed "Today's Status". 
             Let's keep Today's status if scheduled, otherwise maybe just an arrow > 
             But user liked toggle. Let's keep toggle but maybe just open details. 
          */}
                {hasPaidToday ? (
                    <CheckCircle2 color="var(--ios-green)" fill="var(--ios-bg)" size={24} />
                ) : (
                    <Circle color="var(--ios-separator)" size={24} />
                )}
            </div>
        </div>
    );
};

const ParticipantList = ({ participants, payments, bolsoSchedule, currentDate, onTogglePayment }) => {
    const getPaidCount = (participantId) => {
        return payments.filter(p => p.participantId === participantId).length;
    };

    const isPaidToday = (participantId) => {
        return payments.some(p => p.participantId === participantId && p.date === currentDate);
    };

    const totalCount = bolsoSchedule ? bolsoSchedule.length : 10;

    return (
        <Card>
            <h3 style={{ marginBottom: '12px', color: 'var(--ios-text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                Participantes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {participants.map((p) => (
                    <ParticipantRow
                        key={p.id}
                        participant={p}
                        paidCount={getPaidCount(p.id)}
                        totalCount={totalCount}
                        hasPaidToday={isPaidToday(p.id)}
                        onTogglePayment={onTogglePayment}
                    />
                ))}
            </div>
        </Card>
    );
};

export default ParticipantList;
