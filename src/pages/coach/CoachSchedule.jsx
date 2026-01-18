import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Ban, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const CoachSchedule = () => {
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timeSlots = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

    // Mock existing classes
    const existingClasses = [
        { day: 'Mon', time: '5:00 PM', title: 'Intermediate B2', type: 'class' },
        { day: 'Wed', time: '5:00 PM', title: 'Intermediate B2', type: 'class' },
        { day: 'Mon', time: '4:00 PM', title: 'Beginner A1', type: 'class' },
    ];

    const toggleBlock = (day, time) => {
        const id = `${day}-${time}`;
        if (blockedSlots.includes(id)) {
            setBlockedSlots(blockedSlots.filter(s => s !== id));
        } else {
            setBlockedSlots([...blockedSlots, id]);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>My Schedule</h1>
                    <p style={{ margin: '4px 0 0', color: '#666' }}>Manage availability and view classes.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Button variant="outline" size="sm"><ChevronLeft size={16} /></Button>
                    <span style={{ fontWeight: '600' }}>Jan 19 - Jan 25, 2026</span>
                    <Button variant="outline" size="sm"><ChevronRight size={16} /></Button>
                </div>
            </div>

            <Card>
                <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', gap: '1px', backgroundColor: '#eee', border: '1px solid #eee' }}>

                    {/* Header Row */}
                    <div style={{ backgroundColor: '#fff', padding: '12px', fontWeight: 'bold' }}>Time</div>
                    {weekDays.map(day => (
                        <div key={day} style={{ backgroundColor: '#F9FAFB', padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                            {day}
                        </div>
                    ))}

                    {/* Time Rows */}
                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            <div style={{ backgroundColor: '#fff', padding: '16px', fontSize: '12px', color: '#666', borderTop: '1px solid #f0f0f0' }}>
                                {time}
                            </div>
                            {weekDays.map(day => {
                                const id = `${day}-${time}`;
                                const isBlocked = blockedSlots.includes(id);
                                const existingClass = existingClasses.find(c => c.day === day && time.includes(c.time.split(':')[0])); // Simple check

                                return (
                                    <div
                                        key={id}
                                        style={{
                                            backgroundColor: isBlocked ? '#FEE2E2' : existingClass ? '#E0E7FF' : '#fff',
                                            padding: '8px',
                                            borderTop: '1px solid #f0f0f0',
                                            borderLeft: '1px solid #f0f0f0',
                                            minHeight: '80px',
                                            cursor: existingClass ? 'default' : 'pointer',
                                            position: 'relative'
                                        }}
                                        onClick={() => !existingClass && toggleBlock(day, time)}
                                    >
                                        {existingClass ? (
                                            <div style={{ fontSize: '11px', color: '#3730A3', fontWeight: 'bold' }}>
                                                {existingClass.title}
                                            </div>
                                        ) : isBlocked ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#991B1B' }}>
                                                <Ban size={16} />
                                                <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>UNAVAILABLE</span>
                                            </div>
                                        ) : (
                                            <div style={{ opacity: 0, hover: { opacity: 1 }, textAlign: 'center', fontSize: '10px', color: '#aaa', marginTop: '20px' }}>
                                                Click to Block
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '24px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#E0E7FF', borderRadius: '4px' }}></div>
                        <span>Assigned Class</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#FEE2E2', borderRadius: '4px' }}></div>
                        <span>Personal Block (Unavailable)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '4px' }}></div>
                        <span>Available Slot</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CoachSchedule;
