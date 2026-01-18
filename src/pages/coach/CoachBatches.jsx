import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Clock, Calendar, Upload, FileText } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, batchName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Upload Material</h2>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Target: <strong>{batchName}</strong></p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Material Type</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="radio" name="type" defaultChecked /> Class PDF
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="radio" name="type" /> Homework PGN
                        </label>
                    </div>
                </div>

                <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '24px', textAlign: 'center', backgroundColor: '#FAFAFA', marginBottom: '24px', cursor: 'pointer' }} onClick={() => alert('File Selector Triggered')}>
                    <Upload size={24} color="#888" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Click to Browse Files</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>PDF, PGN, CBV allowed</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { alert('Material Uploaded Successfully!'); onClose(); }}>Upload</Button>
                </div>
            </div>
        </div>
    );
};

const CoachBatches = () => {
    const [selectedBatch, setSelectedBatch] = useState(null);

    const batches = [
        { id: 1, name: 'Intermediate B2', time: 'Mon, Wed, Fri • 5:00 PM', students: 8, level: 'Intermediate' },
        { id: 2, name: 'Advanced C1', time: 'Tue, Thu, Sat • 7:00 PM', students: 6, level: 'Advanced' },
        { id: 3, name: 'Beginner A1', time: 'Mon, Wed • 4:00 PM', students: 12, level: 'Beginner' }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, color: 'var(--color-deep-blue)' }}>My Batches</h1>
                <Button variant="outline">Download All Reports</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {batches.map(batch => (
                    <Card key={batch.id} title={batch.name}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                                    <Clock size={18} color="var(--color-warm-orange)" />
                                    <span>{batch.time}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                                    <Users size={18} color="var(--color-olive-green)" />
                                    <span>{batch.students} Students</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                                    <Calendar size={18} color="var(--color-deep-blue)" />
                                    <span>{batch.level} Level</span>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                                <Button size="sm" style={{ flex: 1 }} onClick={() => setSelectedBatch(batch)}>
                                    <Upload size={14} style={{ marginRight: '6px' }} /> Upload Material
                                </Button>
                                <Button size="sm" variant="secondary" style={{ flex: 1 }}>
                                    <FileText size={14} style={{ marginRight: '6px' }} /> View Reports
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
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
