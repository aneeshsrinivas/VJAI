import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { COLLECTIONS } from '../../config/firestoreCollections';
import Button from '../ui/Button';
import { Upload, Link, FileText, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const UploadMaterialModal = ({ isOpen, onClose, batch }) => {
    const { isDark } = useTheme();
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
                    background: isDark ? '#1a1d27' : 'white', borderRadius: '16px', padding: '40px',
                    textAlign: 'center', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.2)', width: '400px',
                    color: isDark ? '#f0f0f0' : 'inherit'
                }}>
                    <div style={{
                        width: '80px', height: '80px', background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Check size={40} color={isDark ? '#34d399' : '#10b981'} />
                    </div>
                    <h2 style={{ margin: '0 0 8px', color: isDark ? '#34d399' : '#065f46' }}>Upload Successful!</h2>
                    <p style={{ color: isDark ? '#94a3b8' : '#6b7280' }}>Your material has been added to the batch.</p>
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
                maxWidth: '500px', width: '90%', background: isDark ? '#1a1d27' : 'white', borderRadius: '16px', padding: '24px',
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.2)',
                maxHeight: '90vh', overflowY: 'auto',
                color: isDark ? '#f0f0f0' : 'inherit'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px', color: isDark ? '#f0f0f0' : '#1e293b' }}>Upload Material</h2>
                        <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>Target Batch: <strong style={{color: isDark ? '#f0f0f0' : 'inherit'}}>{batch.name}</strong></p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color={isDark ? '#94a3b8' : '#94a3b8'} /></button>
                </div>

                {/* Material Type Selector */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: isDark ? '#cbd5e1' : 'inherit' }}>Material Type</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setType('PDF')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: type === 'PDF' ? (isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                                border: type === 'PDF' ? `1px solid ${isDark ? '#3b82f6' : '#3b82f6'}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: type === 'PDF' ? '600' : '400',
                                color: type === 'PDF' ? (isDark ? '#60a5fa' : '#1d4ed8') : (isDark ? '#94a3b8' : '#64748b'),
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
                                background: type === 'PGN' ? (isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                                border: type === 'PGN' ? `1px solid ${isDark ? '#3b82f6' : '#3b82f6'}` : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: type === 'PGN' ? '600' : '400',
                                color: type === 'PGN' ? (isDark ? '#60a5fa' : '#1d4ed8') : (isDark ? '#94a3b8' : '#64748b'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Upload size={16} /> Chess PGN
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: isDark ? '#cbd5e1' : 'inherit' }}>Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Masterclass on Rook Endgames"
                        style={{ width: '100%', padding: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, background: isDark ? 'rgba(255,255,255,0.05)' : 'white', borderRadius: '8px', fontSize: '14px', color: isDark ? '#f0f0f0' : 'inherit' }}
                    />
                </div>

                {/* Input Method Tabs */}
                <div style={{ marginBottom: '16px', display: 'flex', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                    <button
                        onClick={() => setUploadMode('FILE')}
                        style={{
                            padding: '8px 16px',
                            background: 'none',
                            border: 'none',
                            borderBottom: uploadMode === 'FILE' ? `2px solid ${isDark ? '#60a5fa' : '#3b82f6'}` : '2px solid transparent',
                            color: uploadMode === 'FILE' ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? '#94a3b8' : '#64748b'),
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
                            borderBottom: uploadMode === 'LINK' ? `2px solid ${isDark ? '#60a5fa' : '#3b82f6'}` : '2px solid transparent',
                            color: uploadMode === 'LINK' ? (isDark ? '#60a5fa' : '#3b82f6') : (isDark ? '#94a3b8' : '#64748b'),
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
                            border: `2px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
                            borderRadius: '8px',
                            padding: '32px',
                            textAlign: 'center',
                            background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
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
                                    <div style={{ color: isDark ? '#34d399' : '#059669', marginBottom: '8px' }}><Check size={32} style={{ margin: '0 auto' }} /></div>
                                    <p style={{ margin: 0, color: isDark ? '#f0f0f0' : '#334155', fontWeight: '500' }}>{file.name}</p>
                                    <p style={{ margin: '4px 0 0', color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px' }}>{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={32} color={isDark ? '#475569' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Click or Drag file to upload</p>
                                    <p style={{ margin: '4px 0 0', color: isDark ? '#475569' : '#94a3b8', fontSize: '12px' }}>PDF, PGN, or Images</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRadius: '8px', padding: '0 12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'white' }}>
                            <Link size={16} color={isDark ? '#94a3b8' : '#94a3b8'} />
                            <input
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                style={{ width: '100%', padding: '12px', border: 'none', fontSize: '14px', outline: 'none', background: 'transparent', color: isDark ? '#f0f0f0' : 'inherit' }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}`, paddingTop: '16px' }}>
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
