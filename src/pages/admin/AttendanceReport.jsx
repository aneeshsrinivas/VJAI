import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import { ClipboardCheck, Download, Search, Filter, Users, Calendar, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../../context/ThemeContext';
import './AttendanceReport.css';

const COLORS = {
    orange: '#FC8A24',
    deepBlue: '#003366',
    oliveGreen: '#6B8E23',
};

const AttendanceReport = () => {
    const { isDark } = useTheme();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coaches, setCoaches] = useState([]);
    const [students, setStudents] = useState([]);

    // Filters
    const [filterCoach, setFilterCoach] = useState('All');
    const [filterStudent, setFilterStudent] = useState('All');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Load all attendance records
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'attendance'), (snapshot) => {
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            setRecords(list);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Load coaches for filter dropdown
    useEffect(() => {
        const loadCoaches = async () => {
            const snap = await getDocs(collection(db, 'users'));
            const coachList = snap.docs
                .filter(d => d.data().role === 'coach')
                .map(d => ({ id: d.id, name: d.data().fullName || d.data().email }));
            setCoaches(coachList);
        };
        loadCoaches();
    }, []);

    // Load students for filter dropdown
    useEffect(() => {
        const loadStudents = async () => {
            const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'customer')));
            const studentList = snap.docs.map(d => ({
                id: d.id,
                name: d.data().studentName || d.data().fullName || d.data().email
            }));
            setStudents(studentList);
        };
        loadStudents();
    }, []);

    // Apply filters
    const filteredRecords = records.filter(r => {
        if (filterCoach !== 'All' && r.coachId !== filterCoach) return false;
        if (filterStudent !== 'All' && r.studentId !== filterStudent) return false;
        if (filterDateFrom && r.date < filterDateFrom) return false;
        if (filterDateTo && r.date > filterDateTo) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!(r.studentName || '').toLowerCase().includes(q) &&
                !(r.batchName || '').toLowerCase().includes(q)) return false;
        }
        return true;
    });

    // Calculate stats
    const totalPresent = filteredRecords.filter(r => r.status === 'present').length;
    const totalAbsent = filteredRecords.filter(r => r.status === 'absent').length;
    const attendancePercent = filteredRecords.length > 0
        ? Math.round((totalPresent / filteredRecords.length) * 100)
        : 0;

    // Group by student for per-student stats
    const studentStats = {};
    filteredRecords.forEach(r => {
        if (!studentStats[r.studentId]) {
            studentStats[r.studentId] = { name: r.studentName, present: 0, absent: 0, total: 0, batch: r.batchName };
        }
        studentStats[r.studentId].total++;
        if (r.status === 'present') studentStats[r.studentId].present++;
        else studentStats[r.studentId].absent++;
    });

    const exportPDF = () => {
        const pdf = new jsPDF();
        const dateStr = new Date().toLocaleDateString('en-IN');

        // Header
        pdf.setFillColor(0, 51, 102);
        pdf.rect(0, 0, 210, 35, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.text('Attendance Report', 14, 20);
        pdf.setFontSize(10);
        pdf.text(`Generated: ${dateStr}`, 14, 28);

        // Filters applied
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        let y = 42;
        if (filterStudent !== 'All') {
            const sName = students.find(s => s.id === filterStudent)?.name || filterStudent;
            pdf.text(`Student: ${sName}`, 14, y);
            y += 7;
        }
        if (filterDateFrom || filterDateTo) {
            pdf.text(`Date Range: ${filterDateFrom || 'Start'} to ${filterDateTo || 'Now'}`, 14, y);
            y += 7;
        }

        // Summary
        pdf.setFontSize(12);
        pdf.text(`Overall Attendance: ${attendancePercent}% (${totalPresent} present / ${filteredRecords.length} total)`, 14, y + 3);
        y += 12;

        // Per-student summary table
        pdf.setFontSize(14);
        pdf.text('Student Summary', 14, y);
        y += 4;

        const summaryRows = Object.values(studentStats).map(s => [
            s.name,
            s.batch || '-',
            String(s.present),
            String(s.absent),
            String(s.total),
            `${Math.round((s.present / s.total) * 100)}%`
        ]);

        autoTable(pdf, {
            startY: y,
            head: [['Student', 'Batch', 'Present', 'Absent', 'Total', 'Rate']],
            body: summaryRows,
            theme: 'striped',
            headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
        });

        // Detailed records table
        y = pdf.lastAutoTable.finalY + 12;
        pdf.setFontSize(14);
        pdf.text('Detailed Records', 14, y);
        y += 4;

        const detailRows = filteredRecords.slice(0, 100).map(r => [
            r.date,
            r.studentName,
            r.batchName || '-',
            r.status === 'present' ? 'Present' : 'Absent'
        ]);

        autoTable(pdf, {
            startY: y,
            head: [['Date', 'Student', 'Batch', 'Status']],
            body: detailRows,
            theme: 'striped',
            headStyles: { fillColor: [107, 142, 35], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
        });

        // Footer
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text(`Page ${i} of ${pageCount} | Indian Chess Academy`, 14, 287);
        }

        const fileName = filterStudent !== 'All'
            ? `Attendance-${students.find(s => s.id === filterStudent)?.name || 'Student'}-${dateStr}.pdf`
            : `Attendance-Report-${dateStr}.pdf`;
        pdf.save(fileName);
        toast.success('PDF exported successfully!');
    };

    return (
        <div className="attendance-report-page">
            <div className="report-header">
                <div>
                    <h1 style={{ margin: 0, color: isDark ? '#f0f0f0' : COLORS.deepBlue, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ClipboardCheck size={28} /> Attendance Report
                    </h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#666', margin: '8px 0 0' }}>View and export student attendance records</p>
                </div>
                <Button onClick={exportPDF} disabled={filteredRecords.length === 0} style={{ backgroundColor: COLORS.oliveGreen, border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={16} /> Export PDF
                </Button>
            </div>

            {/* Stats */}
            <div className="report-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe' }}><BarChart3 size={20} color="#2563eb" /></div>
                    <div>
                        <div className="stat-number">{filteredRecords.length}</div>
                        <div className="stat-desc">Total Records</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7' }}><Users size={20} color="#16a34a" /></div>
                    <div>
                        <div className="stat-number" style={{ color: '#16a34a' }}>{totalPresent}</div>
                        <div className="stat-desc">Present</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fee2e2' }}><Users size={20} color="#ef4444" /></div>
                    <div>
                        <div className="stat-number" style={{ color: '#ef4444' }}>{totalAbsent}</div>
                        <div className="stat-desc">Absent</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7' }}><BarChart3 size={20} color="#d97706" /></div>
                    <div>
                        <div className="stat-number" style={{ color: '#d97706' }}>{attendancePercent}%</div>
                        <div className="stat-desc">Rate</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="report-filters">
                    <div className="filter-item">
                        <label><Search size={14} /> Search</label>
                        <input
                            type="text"
                            placeholder="Student or batch name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-item">
                        <label><Filter size={14} /> Coach</label>
                        <select value={filterCoach} onChange={(e) => setFilterCoach(e.target.value)}>
                            <option value="All">All Coaches</option>
                            {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Users size={14} /> Student</label>
                        <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)}>
                            <option value="All">All Students</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Calendar size={14} /> From</label>
                        <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                    </div>
                    <div className="filter-item">
                        <label><Calendar size={14} /> To</label>
                        <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                    </div>
                </div>
            </Card>

            {/* Per-student summary */}
            {Object.keys(studentStats).length > 0 && (
                <Card style={{ padding: '0', marginBottom: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#003366'}`, background: isDark ? '#0f1117' : '#f8fafc' }}>
                        <h3 style={{ margin: 0, color: isDark ? '#f0f0f0' : COLORS.deepBlue, fontSize: '16px' }}>Student Summary</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Batch</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Total</th>
                                    <th>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(studentStats).map(([id, s]) => (
                                    <tr key={id}>
                                        <td style={{ fontWeight: '600' }}>{s.name}</td>
                                        <td>{s.batch || '-'}</td>
                                        <td><span className="badge-present">{s.present}</span></td>
                                        <td><span className="badge-absent">{s.absent}</span></td>
                                        <td>{s.total}</td>
                                        <td>
                                            <span className={`badge-rate ${(s.present / s.total) >= 0.75 ? 'good' : 'low'}`}>
                                                {Math.round((s.present / s.total) * 100)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Detailed Records */}
            <Card style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#003366'}`, background: isDark ? '#0f1117' : '#f8fafc' }}>
                    <h3 style={{ margin: 0, color: isDark ? '#f0f0f0' : COLORS.deepBlue, fontSize: '16px' }}>
                        Detailed Records ({filteredRecords.length})
                    </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Batch</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</td></tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No attendance records found.</td></tr>
                            ) : (
                                filteredRecords.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.date}</td>
                                        <td style={{ fontWeight: '600' }}>{r.studentName}</td>
                                        <td>{r.batchName || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${r.status}`}>
                                                {r.status === 'present' ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AttendanceReport;
