```javascript
import React from 'react';
import Card from './Card';
import { CheckCircle2, Circle, Gift } from 'lucide-react';

const ParticipantRow = ({ participant, paidCount, totalCount, expectedCount, hasPaidToday, onTogglePayment, readOnly }) => {
    const percentage = Math.round((paidCount / totalCount) * 100);
    const hasReceivedPayout = !!participant.payoutDate;

    // Debt Calculation
    // If paidCount < expectedCount, they are overdue.
    const overdueCount = Math.max(0, expectedCount - paidCount);

    return (
        <div
            onClick={() => !readOnly && onTogglePayment(participant.id)}
            className={readOnly ? "" : "active-scale"}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--ios-separator)',
                cursor: readOnly ? 'default' : 'pointer',
                opacity: readOnly ? 0.9 : 1
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
                    {/* Debug: Show placeholder if turn is missing but we want to see layout */}
                    {!participant.turn && (
                        <span style={{
                            fontSize: '0.8rem', backgroundColor: 'var(--ios-separator)', color: 'white',
                            padding: '1px 6px', borderRadius: '6px', fontWeight: 700, marginRight: '4px'
                        }}>
                            #?
                        </span>
                    )}

                    {participant.name}

                    {hasReceivedPayout && (
                        <Gift size={14} color="var(--color-green)" style={{ marginLeft: '4px' }} />
                    )}

                    {overdueCount > 0 && (
                        <span style={{
                            fontSize: '0.7rem', backgroundColor: 'var(--color-red)', color: 'white',
                            padding: '1px 6px', borderRadius: '4px', fontWeight: 600, marginLeft: 'auto', marginRight: '8px'
                        }}>
                            Debe {overdueCount}
                        </span>
                    )}
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        flex: 1, height: '6px', backgroundColor: '#F2F2F7', borderRadius: '3px', overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${ percentage }% `, height: '100%', backgroundColor: overdueCount > 0 ? 'var(--color-orange)' : 'var(--ios-green)', borderRadius: '3px'
                        }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: overdueCount > 0 ? 'var(--color-red)' : 'var(--ios-text-secondary)', minWidth: '35px', textAlign: 'right', fontWeight: overdueCount > 0 ? 600 : 400 }}>
                        {paidCount}/{totalCount}
                    </span>
                </div>
            </div>

            {!readOnly && (
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
            )}
        </div >
    );
};

const ParticipantList = ({ participants, payments, bolsoSchedule, currentDate, onTogglePayment, readOnly }) => {
    const getPaidCount = (participantId) => {
        return payments.filter(p => p.participantId === participantId).length;
    };

    const isPaidToday = (participantId) => {
        return payments.some(p => p.participantId === participantId && p.date === currentDate);
    };

    const totalCount = bolsoSchedule ? bolsoSchedule.length : 10;

    // Calculate how many dates in schedule are <= today
    const expectedCount = bolsoSchedule ? bolsoSchedule.filter(date => date <= currentDate).length : 0;

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
                        expectedCount={expectedCount}
                        hasPaidToday={isPaidToday(p.id)}
                        onTogglePayment={onTogglePayment}
                        readOnly={readOnly}
                    />
                ))}
            </div>
        </Card>
    );
};

export default ParticipantList;
