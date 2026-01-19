import React from 'react';
import { X, Calendar, MapPin, Clipboard } from 'lucide-react';

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '24px', padding: '32px',
                width: '100%', maxWidth: '500px',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '24px', right: '24px',
                    background: '#f1f5f9', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b'
                }}>
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '24px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: 'white', fontSize: '32px', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
                    }}>
                        {(student.studentName || 'S').charAt(0)}
                    </div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                        {student.studentName}
                    </h2>
                    <p style={{ margin: 0, color: '#64748b' }}>{student.level} • {student.studentAge} Years Old</p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                        <div style={{ background: '#e2e8f0', padding: '8px', borderRadius: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Contact Information</div>
                            <div style={{ fontWeight: '600', color: '#94a3b8' }}>Hidden for Privacy</div>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Calendar size={18} color="#f59e0b" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Joined Date</div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                {student.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Clipboard size={18} color="#8b5cf6" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Assigned Batch</div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{student.batchName || 'No Batch Assigned'}</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>Student ID: {student.id}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailsModal;
