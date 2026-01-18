import React from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Mock Data based on Core Entities
const mockAccounts = [
    { account_id: 'ACC-001', email: 'admin@vjai.com', role: 'ADMIN', created_at: '2025-01-15' },
    { account_id: 'ACC-002', email: 'coach.ramesh@vjai.com', role: 'COACH', created_at: '2025-01-20' },
    { account_id: 'ACC-003', email: 'priya.parent@gmail.com', role: 'CUSTOMER', created_at: '2025-02-01' },
    { account_id: 'ACC-004', email: 'rahul.student@yahoo.co.in', role: 'CUSTOMER', created_at: '2025-02-05' },
    { account_id: 'ACC-005', email: 'finance.dept@vjai.com', role: 'ADMIN', created_at: '2025-01-10' },
];

const AccountsPage = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="welcome-text">System Accounts</h1>
                    <p className="sub-text">View and audit system authentication records.</p>
                </div>
                <Button>+ Create Invite</Button>
            </div>

            <div className="dashboard-grid">
                <div className="col-12">
                    <Card>
                        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                            <Input placeholder="Search emails..." style={{ width: '300px' }} />
                            <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #BDBDBD' }}>
                                <option value="">All Roles</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="COACH">COACH</option>
                                <option value="CUSTOMER">CUSTOMER</option>
                            </select>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '12px' }}>Account ID</th>
                                    <th style={{ padding: '12px' }}>Email (Login)</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                    <th style={{ padding: '12px' }}>Created At</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockAccounts.map(acc => (
                                    <tr key={acc.account_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px 12px', fontFamily: 'monospace', color: '#666' }}>{acc.account_id}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: '500' }}>{acc.email}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                                backgroundColor: acc.role === 'ADMIN' ? '#E3F2FD' : acc.role === 'COACH' ? '#FFF3E0' : '#E8F5E9',
                                                color: acc.role === 'ADMIN' ? '#1565C0' : acc.role === 'COACH' ? '#EF6C00' : '#2E7D32'
                                            }}>
                                                {acc.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px', color: '#666' }}>{acc.created_at}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <Button variant="ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>Reset Internal Password</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AccountsPage;
