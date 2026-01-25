import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import Button from '../../components/ui/Button';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLLECTIONS } from '../../config/firestoreCollections';

import ScheduleClassModal from '../../components/features/ScheduleClassModal';
import ClassDetailsModal from '../../components/features/ClassDetailsModal';

const CoachSchedule = () => {
    const { currentUser } = useAuth();
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timeSlots = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

    // Calculate the week's start (Monday) and end (Sunday) based on offset
    const getWeekBounds = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to get Monday

        const monday = new Date(today);
        monday.setDate(today.getDate() + diff + (weekOffset * 7));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { monday, sunday };
    };

    const getWeekLabel = () => {
        const { monday, sunday } = getWeekBounds();
        const options = { month: 'short', day: 'numeric' };
        const start = monday.toLocaleDateString('en-US', options);
        const end = sunday.toLocaleDateString('en-US', { ...options, year: 'numeric' });
        return `${start} - ${end}`;
    };

    const getWeekDates = () => {
        const { monday } = getWeekBounds();
        return weekDays.map((_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            return date.getDate();
        });
    };

    useEffect(() => {
        if (!currentUser?.uid) return;

        // 1. Fetch Regular Scheduled Classes
        const qClasses = query(
            collection(db, COLLECTIONS.SCHEDULE),
            where('coachId', '==', currentUser.uid) // Assuming coachId is stored
        );

        // 2. Fetch Assigned Demos
        const qDemos = query(
            collection(db, COLLECTIONS.DEMOS),
            where('assignedCoachId', '==', currentUser.uid),
            where('status', '==', 'SCHEDULED')
        );

        const unsubscribeClasses = onSnapshot(qClasses, (snapshot) => {
            const classes = snapshot.docs.map(doc => {
                const data = doc.data();
                const date = data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date(); // Fallback
                return {
                    id: doc.id,
                    type: 'class',
                    title: data.batchName || data.topic || 'Class',
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    rawDate: date,
                    batchId: data.batchId,
                    coachId: data.coachId,
                    meetLink: data.meetLink
                };
            });
            updateSchedule(classes, 'classes');
        });

        const unsubscribeDemos = onSnapshot(qDemos, (snapshot) => {
            const demos = snapshot.docs.map(doc => {
                const data = doc.data();
                // Handle different date formats (Request vs Scheduled)
                let date = new Date();
                if (data.scheduledStart) {
                    date = new Date(data.scheduledStart);
                } else if (data.preferredDateTime) {
                    date = new Date(data.preferredDateTime);
                }

                return {
                    id: doc.id,
                    type: 'demo',
                    title: `Demo: ${data.studentName}`,
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    rawDate: date
                };
            });
            updateSchedule(demos, 'demos');
        });

        // Helper to merge lists
        let currentClasses = [];
        let currentDemos = [];

        const updateSchedule = (items, source) => {
            if (source === 'classes') currentClasses = items;
            if (source === 'demos') currentDemos = items;
            setScheduleItems([...currentClasses, ...currentDemos]);
        };

        return () => {
            unsubscribeClasses();
            unsubscribeDemos();
        };
    }, [currentUser]);

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
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <Button onClick={() => setIsScheduleModalOpen(true)}>
                        + Schedule Class
                    </Button>
                </div>

                {/* Week Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Button variant="outline" size="sm" onClick={() => setWeekOffset(weekOffset - 1)}><ChevronLeft size={16} /></Button>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', minWidth: '180px', textAlign: 'center' }}>{getWeekLabel()}</span>
                        <Button variant="outline" size="sm" onClick={() => setWeekOffset(weekOffset + 1)}><ChevronRight size={16} /></Button>
                        {weekOffset !== 0 && (
                            <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} style={{ marginLeft: '8px', fontSize: '12px' }}>Today</Button>
                        )}
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
                                {weekDays.map((dayName, dayIdx) => {
                                    // Calculate the exact date for this column
                                    const { monday } = getWeekBounds();
                                    const columnDate = new Date(monday);
                                    columnDate.setDate(monday.getDate() + dayIdx);

                                    const id = `${dayName}-${time}`;
                                    const isBlocked = blockedSlots.includes(id);

                                    // Robust Matching: Compare Date string and Hour
                                    const existingClass = scheduleItems.find(c => {
                                        if (!c.rawDate) return false;

                                        // 1. Compare Date (Day/Month/Year)
                                        const isSameDate = c.rawDate.toDateString() === columnDate.toDateString();
                                        if (!isSameDate) return false;

                                        // 2. Compare Hour
                                        // Parse slot time '10:00 AM'
                                        let [slotTime, modifier] = time.split(' ');
                                        let [slotHourStr] = slotTime.split(':');
                                        let slotHour = parseInt(slotHourStr);
                                        if (modifier === 'PM' && slotHour !== 12) slotHour += 12;
                                        if (modifier === 'AM' && slotHour === 12) slotHour = 0;

                                        const classHour = c.rawDate.getHours();

                                        // Match if class starts within this slot's hour (or close enough for this grid)
                                        // Simplification: exact hour match or class falls in this 2-hour block (e.g. 10:30 falls in 10:00)
                                        // Assuming slots are 2 hours apart: 10, 12, 2...
                                        // So we check if classHour is >= slotHour and < nextSlotHour (slotHour + 2)
                                        return classHour >= slotHour && classHour < slotHour + 2;
                                    });

                                    return (
                                        <div
                                            key={id}
                                            style={{
                                                backgroundColor: isBlocked ? '#fee2e2' : existingClass ? (existingClass.type === 'demo' ? '#d1fae5' : '#dbeafe') : '#fff',
                                                padding: '12px',
                                                borderTop: timeIdx > 0 ? '1px solid #f0f0f0' : 'none',
                                                borderLeft: '1px solid #f0f0f0',
                                                minHeight: '90px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onClick={() => existingClass ? setSelectedClass(existingClass) : toggleBlock(dayName, time)}
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
                                                    fontWeight: '700',
                                                    textAlign: 'center',
                                                    background: existingClass.type === 'demo' ? '#10b981' : '#3b82f6',
                                                    color: 'white',
                                                    padding: '6px 10px',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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

            <ScheduleClassModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                batchId="global"
                batchName="General Session"
                onSuccess={() => {
                    // Show success modal instead of alert
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 2000);
                }}
            />

            {/* Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '40px',
                        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '400px'
                    }}>
                        <div style={{
                            width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 style={{ margin: '0 0 8px', color: '#065f46' }}>Class Scheduled!</h2>
                        <p style={{ color: '#6b7280' }}>Your session has been created successfully.</p>
                    </div>
                </div>
            )}

            <ClassDetailsModal
                isOpen={!!selectedClass}
                onClose={() => setSelectedClass(null)}
                classData={selectedClass}
            />
        </div>
    );
};


export default CoachSchedule;
