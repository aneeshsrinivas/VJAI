import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Clock, Calendar, Upload, FileText, BookOpen } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, batchName }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>
                        Upload Material
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                        Target: <strong style={{ color: '#3b82f6' }}>{batchName}</strong>
                    </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        Material Type
                    </label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '10px 16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            flex: 1
                        }}>
                            <input type="radio" name="type" defaultChecked />
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Class PDF</span>
                        </label>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '10px 16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            flex: 1
                        }}>
                            <input type="radio" name="type" />
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Homework PGN</span>
                        </label>
                    </div>
                </div>

                <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    marginBottom: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                    onClick={() => alert('File Selector Triggered')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#f8fafc';
                    }}>
                    <Upload size={32} color="#3b82f6" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                        Click to Browse Files
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        PDF, PGN, CBV allowed
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { alert('Material Uploaded Successfully!'); onClose(); }}>
                        Upload Material
                    </Button>
                </div>
            </div>
        </div>
    );
};

const CoachBatches = () => {
    const [selectedBatch, setSelectedBatch] = useState(null);

    const batches = [
        { id: 1, name: 'Intermediate B2', time: 'Mon, Wed, Fri • 5:00 PM', students: 8, level: 'Intermediate', color: '#3b82f6' },
        { id: 2, name: 'Advanced C1', time: 'Tue, Thu, Sat • 7:00 PM', students: 6, level: 'Advanced', color: '#8b5cf6' },
        { id: 3, name: 'Beginner A1', time: 'Mon, Wed • 4:00 PM', students: 12, level: 'Beginner', color: '#10b981' }
    ];

    return (
        <div style={{
            minHeight: 'calc(100vh - 70px)',
            background: 'linear-gradient(180deg, #f8f9fc 0%, #f0f2f5 100%)',
            padding: '32px',
            fontFamily: "'Figtree', sans-serif"
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                            <BookOpen size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#003366' }}>
                                My Batches
                            </h1>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '15px' }}>
                                Manage your classes and share resources
                            </p>
                        </div>
                    </div>
                    <Button variant="outline">Download All Reports</Button>
                </div>

                {/* Batches Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                    {batches.map(batch => (
                        <Card key={batch.id} style={{
                            border: 'none',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            padding: '24px',
                            borderTop: `4px solid ${batch.color}`,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                            }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{
                                    margin: '0 0 16px',
                                    fontSize: '20px',
                                    fontWeight: '800',
                                    color: '#1e293b'
                                }}>
                                    {batch.name}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: `${batch.color}15`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Clock size={16} color={batch.color} />
                                        </div>
                                        <span>{batch.time}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: `${batch.color}15`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Users size={16} color={batch.color} />
                                        </div>
                                        <span>{batch.students} Students</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: `${batch.color}15`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Calendar size={16} color={batch.color} />
                                        </div>
                                        <span>{batch.level} Level</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                borderTop: '1px solid #f1f5f9',
                                paddingTop: '16px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px'
                            }}>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedBatch(batch)}
                                    style={{
                                        background: `${batch.color}`,
                                        border: 'none',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Upload size={14} /> Upload
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <FileText size={14} /> Reports
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <UploadModal
                isOpen={!!selectedBatch}
                batchName={selectedBatch?.name}
                onClose={() => setSelectedBatch(null)}
            />
        </div>
    );
};

export default CoachBatches;
