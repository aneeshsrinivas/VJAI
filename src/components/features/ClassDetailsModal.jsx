import React, { useState } from 'react';
import { X, Upload, FileText, Check } from 'lucide-react';
import Button from '../ui/Button';
import { createAssignment } from '../../services/firestoreService';

const ClassDetailsModal = ({ isOpen, onClose, classData }) => {
    if (!isOpen || !classData) return null;

    const [uploading, setUploading] = useState(false);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [fileUrl, setFileUrl] = useState(''); // In a real app, integrate file upload service

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        // Simulate upload or use real service if available
        // For MVP, we'll just create an assignment record with a mock or text limit
        const assignmentPayload = {
            title: assignmentTitle,
            description: 'Assignment for class: ' + classData.title,
            batchId: classData.batchId || 'group',
            classId: classData.id,
            coachId: classData.coachId,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
            fileUrl: fileUrl || 'https://example.com/mock-assignment.pdf'
        };

        const result = await createAssignment(assignmentPayload);

        setUploading(false);
        if (result.success) {
            alert('Assignment uploaded successfully!');
            setAssignmentTitle('');
            onClose();
        } else {
            alert('Failed to upload assignment');
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                background: 'white', padding: '24px', borderRadius: '20px',
                width: '100%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Class Details</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#3b82f6' }}>{classData.title}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {classData.day}, {classData.time}
                    </p>
                    {classData.meetLink && (
                        <a href={classData.meetLink} target="_blank" rel="noreferrer" style={{
                            display: 'inline-block', marginTop: '12px', color: '#059669', fontSize: '14px', fontWeight: '500'
                        }}>
                            Join Meeting Link
                        </a>
                    )}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>Upload Assignment</h4>
                    <form onSubmit={handleUpload}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Assignment Title</label>
                            <input
                                type="text"
                                required
                                value={assignmentTitle}
                                onChange={e => setAssignmentTitle(e.target.value)}
                                placeholder="e.g. Chess Tactics Worksheet #1"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <Button type="submit" disabled={uploading} style={{ width: '100%', justifyContent: 'center' }}>
                            {uploading ? 'Uploading...' : 'Upload & Assign'} <Upload size={16} style={{ marginLeft: '8px' }} />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClassDetailsModal;
