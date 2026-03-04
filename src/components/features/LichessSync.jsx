import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LICHESS_STATUS } from '../../config/firestoreCollections';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, TrendingUp, Puzzle, Timer, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import './LichessSync.css';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const LichessSync = ({ currentUser, userData }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ratingHistory, setRatingHistory] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);

    const status = userData?.lichessStatus;
    const linkedUsername = userData?.lichessUsername;

    // Listen to ratingHistory subcollection when approved
    useEffect(() => {
        if (status !== LICHESS_STATUS.APPROVED || !currentUser?.uid || !db) return;
        const histRef = collection(db, 'users', currentUser.uid, 'ratingHistory');
        const q = query(histRef, orderBy('timestamp', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                date: d.data().timestamp?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''
            }));
            setRatingHistory(data);
        });
        return () => unsub();
    }, [status, currentUser?.uid]);

    // Fetch Lichess rating history for chart when approved
    useEffect(() => {
        if (status !== LICHESS_STATUS.APPROVED || !linkedUsername) return;
        const fetchHistory = async () => {
            setChartLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/lichess/rating-history/${encodeURIComponent(linkedUsername)}`);
                const json = await res.json();
                if (json.success) {
                    const dateMap = new Map();
                    json.rapid.forEach(p => {
                        dateMap.set(p.date, { ...dateMap.get(p.date), date: p.date, rapid: p.rating });
                    });
                    json.puzzle.forEach(p => {
                        dateMap.set(p.date, { ...dateMap.get(p.date), date: p.date, puzzle: p.rating });
                    });
                    const merged = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
                    setChartData(merged.slice(-30));
                }
            } catch (err) {
                console.error('Failed to fetch rating history:', err);
            } finally {
                setChartLoading(false);
            }
        };
        fetchHistory();
    }, [status, linkedUsername]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/lichess/user/${encodeURIComponent(username.trim())}`);
            const json = await res.json();
            if (!json.success) {
                setError(json.error || 'Lichess user not found');
                setLoading(false);
                return;
            }
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                lichessUsername: json.data.username,
                lichessStatus: LICHESS_STATUS.PENDING,
                lichessRequestedAt: serverTimestamp(),
            });
            setUsername('');
        } catch (err) {
            console.error('Lichess link error:', err);
            setError('Failed to validate username. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getGrowth = (field) => {
        if (ratingHistory.length < 2) return null;
        const first = ratingHistory[0]?.[field];
        const last = ratingHistory[ratingHistory.length - 1]?.[field];
        if (first == null || last == null) return null;
        return last - first;
    };

    const rapidGrowth = getGrowth('rapid');
    const puzzleGrowth = getGrowth('puzzle');
    const lastSynced = userData?.lastSyncedAt?.toDate?.();
    const lastSyncedStr = lastSynced
        ? lastSynced.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never';

    // ─── No username or rejected ───
    if (!status || status === LICHESS_STATUS.REJECTED) {
        return (
            <div className="ls-body">
                {status === LICHESS_STATUS.REJECTED && (
                    <div className="lichess-rejected-notice">
                        <AlertCircle size={16} />
                        <span>Your previous request was rejected. You can try again with the same or a different username.</span>
                    </div>
                )}
                <p className="ls-desc">Link your Lichess account so your coach can track your rating progress.</p>
                <form onSubmit={handleSubmit} className="lichess-form">
                    <div className="lichess-input-row">
                        <input
                            type="text"
                            placeholder="Enter your Lichess username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="lichess-input"
                            disabled={loading}
                            maxLength={20}
                            minLength={2}
                        />
                        <button type="submit" className="lichess-submit-btn" disabled={loading || !username.trim()}>
                            {loading ? <Loader2 size={18} className="spin" /> : 'Link Account'}
                        </button>
                    </div>
                    {error && <p className="lichess-error"><AlertCircle size={14} /> {error}</p>}
                </form>
            </div>
        );
    }

    // ─── Pending ───
    if (status === LICHESS_STATUS.PENDING) {
        return (
            <div className="ls-body">
                <div className="ls-status-row">
                    <Clock size={16} color="#b45309" />
                    <span className="ls-username">@{linkedUsername}</span>
                </div>
                <div className="lichess-pending-body">
                    <div className="pending-badge">
                        <Loader2 size={16} className="spin" />
                        <span>Waiting for coach approval</span>
                    </div>
                    <p className="pending-desc">
                        Your coach will review and approve your Lichess account. Once approved, your ratings will sync automatically on each login.
                    </p>
                </div>
            </div>
        );
    }

    // ─── Approved — Analytics ───
    return (
        <div className="ls-body">
            <div className="ls-status-row">
                <CheckCircle2 size={16} color="#16a34a" />
                <a href={`https://lichess.org/@/${linkedUsername}`} target="_blank" rel="noopener noreferrer" className="lichess-profile-link">
                    @{linkedUsername}
                </a>
                <span className="lichess-synced-badge">
                    <Timer size={12} />
                    Synced: {lastSyncedStr}
                </span>
            </div>

            <div className="lichess-ratings-grid">
                <div className="lichess-rating-card rapid">
                    <div className="rating-label"><TrendingUp size={16} /> Rapid Rating</div>
                    <div className="rating-value">{userData?.currentRapid ?? '—'}</div>
                    {rapidGrowth != null && (
                        <div className={`rating-growth ${rapidGrowth >= 0 ? 'positive' : 'negative'}`}>
                            {rapidGrowth >= 0 ? '+' : ''}{rapidGrowth} since linked
                        </div>
                    )}
                </div>
                <div className="lichess-rating-card puzzle">
                    <div className="rating-label"><Puzzle size={16} /> Puzzle Rating</div>
                    <div className="rating-value">{userData?.currentPuzzle ?? '—'}</div>
                    {puzzleGrowth != null && (
                        <div className={`rating-growth ${puzzleGrowth >= 0 ? 'positive' : 'negative'}`}>
                            {puzzleGrowth >= 0 ? '+' : ''}{puzzleGrowth} since linked
                        </div>
                    )}
                </div>
            </div>

            <div className="lichess-chart-section">
                <h4 className="chart-title">Rating History</h4>
                {chartLoading ? (
                    <div className="chart-loading">
                        <Loader2 size={24} className="spin" />
                        <span>Loading chart...</span>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }} />
                            <Legend />
                            <Line type="monotone" dataKey="rapid" stroke="#3b82f6" strokeWidth={2} dot={false} name="Rapid" />
                            <Line type="monotone" dataKey="puzzle" stroke="#f59e0b" strokeWidth={2} dot={false} name="Puzzle" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="chart-empty">No rating history available yet.</p>
                )}
            </div>

            <div className="lichess-puzzle-target">
                <div className="puzzle-target-header">
                    <Puzzle size={16} />
                    <span>Weekly Target: Solve 200 Puzzles</span>
                </div>
                <div className="puzzle-target-bar-bg">
                    <div className="puzzle-target-bar-fill" style={{ width: `${Math.min(((userData?.weeklyPuzzlesSolved || 0) / 200) * 100, 100)}%` }} />
                </div>
                <div className="puzzle-target-label">{userData?.weeklyPuzzlesSolved || 0} / 200 puzzles this week</div>
            </div>
        </div>
    );
};

export default LichessSync;
