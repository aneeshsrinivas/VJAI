import React from 'react';
import Card from '../../components/ui/Card';
import { Calendar, Video, Clock, MapPin } from 'lucide-react';
import Button from '../../components/ui/Button';

const ParentSchedule = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '40px 24px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#003366',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #FC8A24, #ff9d4d)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Calendar size={24} color="white" />
                        </span>
                        Weekly Schedule
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px', marginLeft: '54px' }}>
                        Track your child's upcoming classes and practice sessions.
                    </p>
                </header>

                <Card className="schedule-card" style={{
                    border: 'none',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    <div className="schedule-list">
                        {[
                            { day: 'Monday', fullDay: 'Monday, Oct 23', time: '5:00 PM - 6:30 PM', class: 'Intermediate B2', type: 'Live Class', status: 'upcoming', topic: 'King & Pawn Endgames' },
                            { day: 'Wednesday', fullDay: 'Wednesday, Oct 25', time: '5:00 PM - 6:30 PM', class: 'Intermediate B2', type: 'Live Class', status: 'upcoming', topic: 'Middle Game Tactics' },
                            { day: 'Friday', fullDay: 'Friday, Oct 27', time: '5:00 PM - 6:00 PM', class: 'Intermediate B2', type: 'Practice Session', status: 'upcoming', topic: 'Rapid Fire Drills' },
                        ].map((slot, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px',
                                borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none',
                                transition: 'background 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fcfcfc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minWidth: '80px',
                                        background: i === 0 ? 'linear-gradient(135deg, #FFF7ED, #FFF)' : '#f8f9fc',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: i === 0 ? '1px solid #FC8A24' : '1px solid #eee'
                                    }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: i === 0 ? '#FC8A24' : '#666', textTransform: 'uppercase' }}>
                                            {slot.day.substring(0, 3)}
                                        </span>
                                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#003366' }}>
                                            {23 + (i * 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#003366', margin: 0 }}>
                                                {slot.class}
                                            </h3>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: slot.type === 'Live Class' ? '#E0F2FE' : '#F3E8FF',
                                                color: slot.type === 'Live Class' ? '#0284C7' : '#9333EA',
                                                textTransform: 'uppercase'
                                            }}>
                                                {slot.type}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} /> {slot.time}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={14} /> Online
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#444' }}>
                                            <span style={{ fontWeight: '600', color: '#888' }}>Topic:</span> {slot.topic}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    style={{
                                        background: i === 0 ? 'linear-gradient(135deg, #FC8A24, #ff9d4d)' : 'white',
                                        color: i === 0 ? 'white' : '#003366',
                                        border: i === 0 ? 'none' : '1px solid #003366',
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        boxShadow: i === 0 ? '0 4px 12px rgba(252, 138, 36, 0.3)' : 'none'
                                    }}
                                >
                                    <Video size={16} style={{ marginRight: '8px' }} />
                                    {i === 0 ? 'Join Now' : 'Details'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ParentSchedule;
