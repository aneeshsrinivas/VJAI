import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            const accs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAccounts(accs);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const getRoleBadgeStyle = (role) => {
        const r = (role || '').toUpperCase();
        if (r === 'ADMIN') return { bg: '#E3F2FD', color: '#1565C0' };
        if (r === 'COACH') return { bg: '#FFF3E0', color: '#EF6C00' };
        return { bg: '#E8F5E9', color: '#2E7D32' };
    };

    const filteredAccounts = accounts.filter(acc => {
        const matchesRole = !filterRole || (acc.role || '').toUpperCase() === filterRole;
        const matchesSearch = !searchTerm || (acc.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">System Accounts</h1>
                    <p className="sub-text">View and audit system authentication records.</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="col-12">
                    <Card>
                        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                            <Input
                                placeholder="Search emails..."
                                style={{ width: '300px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="">All Roles</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="COACH">COACH</option>
                                <option value="CUSTOMER">CUSTOMER</option>
                            </select>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Loading accounts...</div>
                        ) : filteredAccounts.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                No accounts found. User accounts will appear here when people sign up.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '12px' }}>Account ID</th>
                                        <th style={{ padding: '12px' }}>Email (Login)</th>
                                        <th style={{ padding: '12px' }}>Role</th>
                                        <th style={{ padding: '12px' }}>Created At</th>
                                        <th style={{ padding: '12px' }}>Last Login</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts.map(acc => (
                                        <tr key={acc.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '16px 12px', fontFamily: 'monospace', color: '#666' }}>
                                                {acc.id.substring(0, 12)}...
                                            </td>
                                            <td style={{ padding: '16px 12px', fontWeight: '500' }}>{acc.email}</td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: getRoleBadgeStyle(acc.role).bg,
                                                    color: getRoleBadgeStyle(acc.role).color
                                                }}>
                                                    {(acc.role || 'CUSTOMER').toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 12px', color: '#666' }}>
                                                {acc.createdAt?.toDate?.().toLocaleDateString() || '-'}
                                            </td>
                                            <td style={{ padding: '16px 12px', color: '#666' }}>
                                                {acc.lastLoginAt?.toDate?.().toLocaleString() || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AccountsPage;
