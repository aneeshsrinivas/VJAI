import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import '../../pages/Dashboard.css';

const CoachRoster = () => {
    const coaches = [
        { name: 'Ramesh Babu', level: 'FIDE Master', rating: 2450, students: 42, color: '#f0f4ff' },
        { name: 'Suhani Shah', level: 'Grandmaster', rating: 2600, students: 15, color: '#fff4e6' },
        { name: 'Aditya Mittal', level: 'IM', rating: 2380, students: 28, color: '#f0fff4' },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">Coach Roster</h1>
                    <p className="sub-text">Performance metrics and assignments.</p>
                </div>
                <Button>Add New Coach</Button>
            </div>

            <div className="dashboard-grid">
                {coaches.map((coach, i) => (
                    <div key={i} className="col-4">
                        <Card>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: coach.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                    ♞
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>{coach.name}</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{coach.level}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{coach.rating}</div>
                                    <div style={{ fontSize: '10px', color: '#999' }}>RATING</div>
                                </div>
                                <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{coach.students}</div>
                                    <div style={{ fontSize: '10px', color: '#999' }}>STUDENTS</div>
                                </div>
                            </div>

                            <Button variant="secondary" style={{ width: '100%' }}>View Profile</Button>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachRoster;
