import React from 'react';
import Card from '../../components/ui/Card';
import { Calendar, Video } from 'lucide-react';
import Button from '../../components/ui/Button';

const ParentSchedule = () => {
    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '24px', color: 'var(--color-deep-blue)' }}>Weekly Schedule</h1>

            <Card>
                {[
                    { day: 'Monday', time: '5:00 PM', class: 'Intermediate B2', type: 'Live Class' },
                    { day: 'Wednesday', time: '5:00 PM', class: 'Intermediate B2', type: 'Live Class' },
                    { day: 'Friday', time: '5:00 PM', class: 'Intermediate B2', type: 'Practice Session' },
                ].map((slot, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: i < 2 ? '1px solid #eee' : 'none' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '100px' }}>{slot.day}</div>
                            <div>
                                <div style={{ color: 'var(--color-deep-blue)', fontWeight: '600' }}>{slot.time} - {slot.class}</div>
                                <div style={{ fontSize: '14px', color: '#666' }}>{slot.type}</div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            <Video size={16} /> Join
                        </Button>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default ParentSchedule;
