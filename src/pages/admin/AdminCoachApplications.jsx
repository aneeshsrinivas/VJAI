import React, { useState, useEffect } from 'react';
import { getCoachApplications } from '../../services/firestoreService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ApproveCoachModal from '../../components/features/ApproveCoachModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminCoachApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        const result = await getCoachApplications();
        if (result.success) {
            setApplications(result.applications);
        } else {
            toast.error('Failed to fetch applications');
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0 }}>Coach Applications</h1>
                <p style={{ color: '#666', margin: '4px 0 0' }}>Review and approve incoming coach requests.</p>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                ) : applications.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        No pending applications.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Name</th>
                                <th style={{ padding: '16px' }}>Credentials</th>
                                <th style={{ padding: '16px' }}>Experience</th>
                                <th style={{ padding: '16px' }}>Contact</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '16px', fontWeight: 'bold' }}>{app.fullName}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div>{app.title}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>FIDE: {app.fideRating || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{app.experience} Years</td>
                                    <td style={{ padding: '16px' }}>
                                        <div>{app.email}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{app.phone}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <Button size="sm" onClick={() => { setSelectedApp(app); setModalOpen(true); }}>
                                            Approve
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {modalOpen && selectedApp && (
                <ApproveCoachModal
                    application={selectedApp}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => {
                        fetchApplications();
                        setModalOpen(false);
                        toast.success('Coach Approved!');
                    }}
                />
            )}
        </div>
    );
};

export default AdminCoachApplications;
