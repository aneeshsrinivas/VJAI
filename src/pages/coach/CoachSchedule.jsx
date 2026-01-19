import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import Button from '../../components/ui/Button';

const CoachSchedule = () => {
    const [blockedSlots, setBlockedSlots] = useState([]);

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
        <div style={{
            minHeight: 'calc(100vh - 70px)',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '32px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <CalendarIcon size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#003366' }}>
                                My Schedule
                            </h1>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '15px' }}>
                                Manage your availability and view upcoming classes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Week Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Button variant="outline" size="sm"><ChevronLeft size={16} /></Button>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>Jan 19 - Jan 25, 2026</span>
                        <Button variant="outline" size="sm"><ChevronRight size={16} /></Button>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#dbeafe', borderRadius: '4px', border: '2px solid #3b82f6' }}></div>
                            <span style={{ color: '#64748b' }}>Assigned Class</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#fee2e2', borderRadius: '4px', border: '2px solid #ef4444' }}></div>
                            <span style={{ color: '#64748b' }}>Blocked</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '16px', height: '16px', background: '#f8fafc', borderRadius: '4px', border: '2px solid #e2e8f0' }}></div>
                            <span style={{ color: '#64748b' }}>Available</span>
                        </div>
                    </div>
                </div>

                {/* Calendar Card */}
                <Card style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '0',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', gap: '0', backgroundColor: '#f8fafc' }}>
                        {/* Header Row */}
                        <div style={{ backgroundColor: '#fff', padding: '16px', fontWeight: '700', color: '#64748b', fontSize: '13px', borderBottom: '2px solid #e2e8f0' }}>
                            Time
                        </div>
                        {weekDays.map(day => (
                            <div key={day} style={{
                                backgroundColor: '#f8fafc',
                                padding: '16px',
                                textAlign: 'center',
                                fontWeight: '700',
                                color: '#1e293b',
                                fontSize: '14px',
                                borderBottom: '2px solid #e2e8f0'
                            }}>
                                {day}
                            </div>
                        ))}

                        {/* Time Rows */}
                        {timeSlots.map((time, timeIdx) => (
                            <React.Fragment key={time}>
                                <div style={{
                                    backgroundColor: '#fff',
                                    padding: '16px',
                                    fontSize: '13px',
                                    color: '#64748b',
                                    fontWeight: '600',
                                    borderTop: timeIdx > 0 ? '1px solid #f0f0f0' : 'none',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {time}
                                </div>
                                {weekDays.map(day => {
                                    const id = `${day}-${time}`;
                                    const isBlocked = blockedSlots.includes(id);
                                    const existingClass = existingClasses.find(c => c.day === day && time.includes(c.time.split(':')[0]));

                                    return (
                                        <div
                                            key={id}
                                            style={{
                                                backgroundColor: isBlocked ? '#fee2e2' : existingClass ? '#dbeafe' : '#fff',
                                                padding: '12px',
                                                borderTop: timeIdx > 0 ? '1px solid #f0f0f0' : 'none',
                                                borderLeft: '1px solid #f0f0f0',
                                                minHeight: '90px',
                                                cursor: existingClass ? 'default' : 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onClick={() => !existingClass && toggleBlock(day, time)}
                                            onMouseEnter={(e) => {
                                                if (!existingClass) {
                                                    e.currentTarget.style.backgroundColor = isBlocked ? '#fecaca' : '#f1f5f9';
                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!existingClass) {
                                                    e.currentTarget.style.backgroundColor = isBlocked ? '#fee2e2' : '#fff';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }}
                                        >
                                            {existingClass ? (
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#1e40af',
                                                    fontWeight: '700',
                                                    textAlign: 'center',
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    padding: '6px 10px',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                                }}>
                                                    {existingClass.title}
                                                </div>
                                            ) : isBlocked ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                                                    <Ban size={20} />
                                                    <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: '700' }}>BLOCKED</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </Card>

                {/* Instructions */}
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#1e40af'
                }}>
                    <strong>💡 Tip:</strong> Click on any available slot to mark it as unavailable. Students cannot book classes during blocked times.
                </div>
            </div>
        </div>
    );
};

export default CoachSchedule;
