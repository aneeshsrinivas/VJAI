import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';
import Button from '../ui/Button';
import { Upload, Link, FileText, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UploadMaterialModal = ({ isOpen, onClose, batch }) => {
    if (!isOpen || !batch) return null;
    const { currentUser } = useAuth(); // for createdBy

    // Mode: 'LINK' or 'FILE'
    const [uploadMode, setUploadMode] = useState('FILE');
    const [type, setType] = useState('PDF'); // PDF, PGN

    // Inputs
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleUpload = async () => {
        if (!title) { alert('Please enter a title'); return; }
        if (uploadMode === 'LINK' && !url) { alert('Please enter a link'); return; }
        if (uploadMode === 'FILE' && !file) { alert('Please select a file'); return; }

        setLoading(true);
        try {
            let finalUrl = url;

            // Handle File Upload (To Secondary Storage Bucket)
            if (uploadMode === 'FILE' && file) {
                // Ensure unique path
                const storageRef = ref(storage, `materials/${batch.name || 'general'}/${Date.now()}_${file.name}`);

                // Upload
                const snapshot = await uploadBytes(storageRef, file);

                // Get URL
                finalUrl = await getDownloadURL(snapshot.ref);
            }

            // Save Metadata to Primary Firestore
            await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), {
                batchId: batch.id,
                batchName: batch.name,
                coachId: currentUser.uid,
                title,
                type,
                url: finalUrl,
                isLocalFile: uploadMode === 'FILE',
                fileName: file ? file.name : null,
                createdAt: serverTimestamp()
            });

            // Show Success UI
            setShowSuccess(true);

            // Auto close after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
                // Reset form
                setTitle('');
                setUrl('');
                setFile(null);
                setType('PDF');
            }, 2000);

        } catch (e) {
            console.error("Error uploading material:", e);
            alert('Failed to upload material: ' + e.message);
        }
        setLoading(false);
    };

    if (showSuccess) {
        return (
            <div className="modal-overlay" style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div className="modal-content" style={{
                    background: 'white', borderRadius: '16px', padding: '40px',
                    textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '400px'
                }}>
                    <div style={{
                        width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Check size={40} color="#10b981" />
                    </div>
                    <h2 style={{ margin: '0 0 8px', color: '#065f46' }}>Upload Successful!</h2>
                    <p style={{ color: '#6b7280' }}>Your material has been added to the batch.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                maxWidth: '500px', width: '90%', background: 'white', borderRadius: '16px', padding: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px', color: '#1e293b' }}>Upload Material</h2>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Target Batch: <strong>{batch.name}</strong></p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#94a3b8" /></button>
                </div>

                {/* Material Type Selector */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Material Type</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setType('PDF')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: type === 'PDF' ? '#eff6ff' : '#f8fafc',
                                border: type === 'PDF' ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: type === 'PDF' ? '600' : '400',
                                color: type === 'PDF' ? '#1d4ed8' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <FileText size={16} /> Document / PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('PGN')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: type === 'PGN' ? '#eff6ff' : '#f8fafc',
                                border: type === 'PGN' ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: type === 'PGN' ? '600' : '400',
                                color: type === 'PGN' ? '#1d4ed8' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Upload size={16} /> Chess PGN
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Masterclass on Rook Endgames"
                        style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                    />
                </div>

                {/* Input Method Tabs */}
                <div style={{ marginBottom: '16px', display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => setUploadMode('FILE')}
                        style={{
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: uploadMode === 'FILE' ? '2px solid #3b82f6' : '2px solid transparent',
                            color: uploadMode === 'FILE' ? '#3b82f6' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Upload File
                    </button>
                    <button
                        onClick={() => setUploadMode('LINK')}
                        style={{
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: uploadMode === 'LINK' ? '2px solid #3b82f6' : '2px solid transparent',
                            color: uploadMode === 'LINK' ? '#3b82f6' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Paste Link
                    </button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    {uploadMode === 'FILE' ? (
                        <div style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '8px',
                            padding: '32px',
                            textAlign: 'center',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
                                }}
                            />
                            {file ? (
                                <div>
                                    <div style={{ color: '#059669', marginBottom: '8px' }}><Check size={32} style={{ margin: '0 auto' }} /></div>
                                    <p style={{ margin: 0, color: '#334155', fontWeight: '500' }}>{file.name}</p>
                                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '12px' }}>{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ margin: 0, color: '#64748b' }}>Click or Drag file to upload</p>
                                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>PDF, PGN, or Images</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', background: 'white' }}>
                            <Link size={16} color="#94a3b8" />
                            <input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                style={{ width: '100%', padding: '12px', border: 'none', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Material'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UploadMaterialModal;
