const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const nodemailer = require('nodemailer');
const { spawn } = require('child_process');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const STOCKFISH_PATH = require.resolve('stockfish/src/stockfish-nnue-16-no-simd.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// RAZORPAY INTEGRATION
// ==========================================

const razorpayInstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
	key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere'
});

app.post('/api/razorpay/create-order', async (req, res) => {
	try {
		const { amountINR, receipt, notes } = req.body;

		const options = {
			amount: amountINR * 100, // paise
			currency: 'INR',
			receipt: receipt || crypto.randomBytes(10).toString('hex'),
			notes: notes || {}
		};

		const order = await razorpayInstance.orders.create(options);
		res.json({ success: true, order });
	} catch (error) {
		console.error('Razorpay Create Order Error:', error);
		res.status(500).json({ success: false, error: error.message || 'Failed to create order' });
	}
});

app.post('/api/razorpay/verify-payment', (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return res.status(400).json({ success: false, message: "Missing Razorpay payment parameters" });
		}

		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSign = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere')
			.update(sign.toString())
			.digest("hex");

		if (razorpay_signature === expectedSign) {
			return res.json({ success: true, message: "Payment verified successfully" });
		} else {
			return res.status(400).json({ success: false, message: "Invalid signature sent!" });
		}
	} catch (error) {
		console.error('Razorpay Verify Error:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// ==========================================
// STOCKFISH ENGINE HELPERS (spawn no-Worker build)
// ==========================================

const runStockfish = ({ fen, depth = 12, skill = 10, movetime } = {}) => {
	return new Promise((resolve, reject) => {
		const nodeArgs = [STOCKFISH_PATH];
		const engine = spawn(process.execPath, nodeArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
		let bestMove = null;
		let score = null;
		let lastPv = null;
		let resolved = false;

		const timeout = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				engine.kill();
				reject(new Error('Engine timeout'));
			}
		}, 30000);

		const send = (cmd) => {
			if (engine.stdin.writable) {
				engine.stdin.write(cmd + '\n');
			}
		};

		const handleLine = (line) => {
			if (!resolved) console.log('SF:', line);

			if (line === 'uciok') {
				send(`setoption name Skill Level value ${skill}`);
				send('isready');
				return;
			}

			if (line === 'readyok') {
				send(`position fen ${fen || 'startpos'}`);
				send(movetime ? `go movetime ${movetime}` : `go depth ${depth}`);
				return;
			}

			if (typeof line === 'string' && line.startsWith('info') && line.includes('score')) {
				const parts = line.split(' ');
				const scoreIdx = parts.indexOf('score');
				if (scoreIdx !== -1 && parts[scoreIdx + 1]) {
					const type = parts[scoreIdx + 1];
					const val = parseInt(parts[scoreIdx + 2], 10);
					if (!Number.isNaN(val)) {
						score = type === 'cp' ? val / 100 : `#${val}`;
					}
				}

				// Capture principal variation if present
				const pvIdx = parts.indexOf('pv');
				if (pvIdx !== -1 && parts[pvIdx + 1]) {
					lastPv = parts.slice(pvIdx + 1).join(' ');
				}
			}

			if (typeof line === 'string' && line.startsWith('bestmove')) {
				const tokens = line.split(' ');
				bestMove = tokens[1];
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					engine.kill();
					resolve({ bestMove, score, pv: lastPv });
				}
			}
		};

		let buffer = '';
		engine.stdout.on('data', (data) => {
			buffer += data.toString();
			let idx;
			while ((idx = buffer.indexOf('\n')) >= 0) {
				const line = buffer.slice(0, idx).trim();
				buffer = buffer.slice(idx + 1);
				if (line) handleLine(line);
			}
		});

		engine.stderr.on('data', (d) => {
			console.error('SF stderr:', d.toString());
		});

		engine.on('error', (err) => {
			console.error('Stockfish process error:', err);
			if (!resolved) {
				resolved = true;
				clearTimeout(timeout);
				reject(err);
			}
		});

		engine.on('exit', (code) => {
			if (!resolved && code !== 0) {
				resolved = true;
				clearTimeout(timeout);
				reject(new Error(`Engine exited with code ${code}`));
			}
		});

		send('uci');
	});
};

const server = http.createServer(app);

// ==========================================
// NODEMAILER CONFIGURATION
// ==========================================

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
	service: 'gmail', // Or use 'smtp.gmail.com' with host/port
	auth: {
		user: process.env.EMAIL_USER, // Your Gmail address
		pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password (not regular password)
	}
});

console.log('Email User:', process.env.EMAIL_USER);
console.log('Email App Password:', process.env.EMAIL_APP_PASSWORD ? 'Provided' : 'Not Provided');

// Verify transporter configuration on startup
transporter.verify((error, success) => {
	if (error) {
		console.error('❌ Email transporter verification failed:', error);
	} else {
		console.log('✅ Email server is ready to send messages');
	}
});

// ==========================================
// EMAIL API ENDPOINTS
// ==========================================

/**
 * Send Student Welcome Email
 * POST /api/email/student-welcome
 */
app.post('/api/email/student-welcome', async (req, res) => {
	try {
		const { parentEmail, parentName, studentName, password } = req.body;

		if (!parentEmail || !parentName || !studentName || !password) {
			return res.status(400).json({ success: false, error: 'Missing required fields' });
		}

		const loginLink = process.env.FRONTEND_URL || 'https://vjai.onrender.com';

		const mailOptions = {
			from: `"Indian Chess Academy" <${process.env.EMAIL_USER}>`,
			to: parentEmail,
			subject: `🎉 Welcome to Indian Chess Academy, ${studentName}!`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #1a365d;">♟️ Indian Chess Academy</h1>
					</div>

					<p>Dear <strong>${parentName}</strong>,</p>

					<p>Welcome to Indian Chess Academy! 🎉</p>

					<p>We are excited to have <strong>${studentName}</strong> join our chess learning community. Your account has been created successfully.</p>

					<div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3182ce;">
						<h3 style="margin-top: 0; color: #2d3748;">🔐 Your Login Credentials</h3>
						<p style="margin: 5px 0;"><strong>Email:</strong> ${parentEmail}</p>
						<p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
					</div>

					<p style="color: #e53e3e; font-size: 14px;">⚠️ Please change your password after your first login for security.</p>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${loginLink}/login" style="background-color: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
					</div>

					<p>Once logged in, you can:</p>
					<ul>
						<li>View your assigned coach and batch</li>
						<li>Check class schedules</li>
						<li>Track assignments and progress</li>
						<li>Access learning materials</li>
					</ul>

					<p>If you have any questions, feel free to reach out to us.</p>

					<p>Best regards,<br><strong>Indian Chess Academy Team</strong></p>

					<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
					<p style="font-size: 12px; color: #718096; text-align: center;">
						This is an automated email. Please do not reply directly to this message.
					</p>
				</div>
			`
		};

		await transporter.sendMail(mailOptions);
		console.log(`✅ Student welcome email sent to: ${parentEmail}`);
		res.json({ success: true, message: 'Email sent successfully' });

	} catch (error) {
		console.error('❌ Failed to send student email:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

/**
 * Send Coach Welcome Email
 * POST /api/email/coach-welcome
 */
app.post('/api/email/coach-welcome', async (req, res) => {
	try {
		const { personalEmail, fullName, assignedEmail, password } = req.body;

		if (!personalEmail || !fullName || !assignedEmail || !password) {
			return res.status(400).json({ success: false, error: 'Missing required fields' });
		}

		const loginLink = process.env.FRONTEND_URL || 'https://vjai.onrender.com';

		const mailOptions = {
			from: `"Indian Chess Academy" <${process.env.EMAIL_USER}>`,
			to: personalEmail,
			subject: `🎓 Welcome to the Faculty - Indian Chess Academy`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #1a365d;">♟️ Indian Chess Academy</h1>
					</div>

					<p>Dear <strong>${fullName}</strong>,</p>

					<p>We are delighted to welcome you to the Indian Chess Academy teaching faculty! 🎉</p>

					<p>Your coach account has been created successfully. You can now access the Coach Dashboard to manage your profile, batches, and students.</p>

					<div style="background-color: #f0fff4; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #38a169;">
						<h3 style="margin-top: 0; color: #2d3748;">🔐 Your Login Credentials</h3>
						<p style="margin: 5px 0;"><strong>Login Email:</strong> ${assignedEmail}</p>
						<p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
					</div>

					<p style="color: #e53e3e; font-size: 14px;">⚠️ Please change your password after your first login for security.</p>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${loginLink}/login" style="background-color: #38a169; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Coach Dashboard</a>
					</div>

					<p>As a coach, you can:</p>
					<ul>
						<li>Manage your assigned batches and students</li>
						<li>Schedule and conduct classes</li>
						<li>Create and grade assignments</li>
						<li>Track student progress</li>
						<li>Upload learning materials</li>
					</ul>

					<p>We look forward to seeing your expertise in action!</p>

					<p>Best regards,<br><strong>Indian Chess Academy Admin Team</strong></p>

					<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
					<p style="font-size: 12px; color: #718096; text-align: center;">
						This is an automated email. Please do not reply directly to this message.
					</p>
				</div>
			`
		};

		await transporter.sendMail(mailOptions);
		console.log(`✅ Coach welcome email sent to: ${personalEmail}`);
		res.json({ success: true, message: 'Email sent successfully' });

	} catch (error) {
		console.error('❌ Failed to send coach email:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

/**
 * Generic Email Endpoint
 * POST /api/email/send
 */
app.post('/api/email/send', async (req, res) => {
	try {
		const { to, subject, html, text } = req.body;

		if (!to || !subject || (!html && !text)) {
			return res.status(400).json({ success: false, error: 'Missing required fields: to, subject, and html or text' });
		}

		const mailOptions = {
			from: `"Indian Chess Academy" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			...(html && { html }),
			...(text && { text })
		};

		await transporter.sendMail(mailOptions);
		console.log(`✅ Email sent to: ${to}`);
		res.json({ success: true, message: 'Email sent successfully' });

	} catch (error) {
		console.error('❌ Failed to send email:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// ==========================================
// CHESS ENGINE ENDPOINTS (STOCKFISH)
// ==========================================

/**
 * Get best move from Stockfish
 * POST /api/chess/engine-move
 * Body: { fen, depth?: number, skill?: 0-20, movetime?: ms, difficulty?: 'easy'|'medium'|'hard' }
 */
app.post('/api/chess/engine-move', async (req, res) => {
	try {
		const { fen, depth, skill, movetime, difficulty } = req.body || {};
		if (!fen) return res.status(400).json({ success: false, error: 'fen is required' });

		const resolvedParams = (() => {
			if (difficulty === 'easy') return { depth: depth ?? 6, skill: skill ?? 3 };
			if (difficulty === 'medium') return { depth: depth ?? 10, skill: skill ?? 8 };
			if (difficulty === 'hard') return { depth: depth ?? 16, skill: skill ?? 15 };
			return { depth: depth ?? 12, skill: skill ?? 10 };
		})();

		console.log('Engine-move request ->', { fen, difficulty, ...resolvedParams, movetime });
		const result = await runStockfish({ fen, ...resolvedParams, movetime });
		console.log('Engine-move response <-', { bestMove: result.bestMove, score: result.score, pv: result.pv });
		res.json({ success: true, ...result, ...resolvedParams });
	} catch (err) {
		console.error('Engine move error:', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

/**
 * Simple puzzle suggestion: returns best move + eval for a given FEN
 * POST /api/chess/puzzle
 * Body: { fen, depth?: number, skill?: 0-20, difficulty?: 'easy'|'medium'|'hard' }
 */
app.post('/api/chess/puzzle', async (req, res) => {
	try {
		const { fen, depth, skill, difficulty } = req.body || {};
		if (!fen) return res.status(400).json({ success: false, error: 'fen is required' });

		const resolvedParams = (() => {
			if (difficulty === 'easy') return { depth: depth ?? 6, skill: skill ?? 3 };
			if (difficulty === 'medium') return { depth: depth ?? 10, skill: skill ?? 8 };
			if (difficulty === 'hard') return { depth: depth ?? 16, skill: skill ?? 15 };
			return { depth: depth ?? 12, skill: skill ?? 12 };
		})();

		console.log('Puzzle request ->', { fen, difficulty, depth: resolvedParams.depth, skill: resolvedParams.skill });
		const result = await runStockfish({ fen, ...resolvedParams });
		console.log('Puzzle response <-', { bestMove: result.bestMove, score: result.score, pv: result.pv });
		res.json({
			success: true,
			puzzle: {
				fen,
				bestMove: result.bestMove,
				score: result.score,
				pv: result.pv,
				depth: resolvedParams.depth,
				skill: resolvedParams.skill
			}
		});
	} catch (err) {
		console.error('Puzzle generation error:', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// ==========================================
// LICHESS API PROXY (rate-limited)
// ==========================================

const lichessRateLimit = new Map();
const LICHESS_RATE_LIMIT = 30;      // max requests
const LICHESS_RATE_WINDOW = 60000;  // per 60 seconds

function checkLichessRateLimit(ip) {
	const now = Date.now();
	const entry = lichessRateLimit.get(ip);
	if (!entry || now > entry.resetTime) {
		lichessRateLimit.set(ip, { count: 1, resetTime: now + LICHESS_RATE_WINDOW });
		return true;
	}
	if (entry.count >= LICHESS_RATE_LIMIT) return false;
	entry.count++;
	return true;
}

// Clean up stale rate-limit entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [ip, entry] of lichessRateLimit.entries()) {
		if (now > entry.resetTime) lichessRateLimit.delete(ip);
	}
}, 300000);

/**
 * Validate & fetch Lichess user profile
 * GET /api/lichess/user/:username
 */
app.get('/api/lichess/user/:username', async (req, res) => {
	try {
		const ip = req.ip || req.connection.remoteAddress;
		if (!checkLichessRateLimit(ip)) {
			return res.status(429).json({ success: false, error: 'Rate limit exceeded. Try again later.' });
		}

		const { username } = req.params;
		if (!username || username.length < 2 || username.length > 20) {
			return res.status(400).json({ success: false, error: 'Invalid username' });
		}

		const response = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}`, {
			headers: { 'Accept': 'application/json' }
		});

		if (!response.ok) {
			if (response.status === 404) {
				return res.status(404).json({ success: false, error: 'Lichess user not found' });
			}
			return res.status(502).json({ success: false, error: 'Lichess API error' });
		}

		const data = await response.json();
		res.json({
			success: true,
			data: {
				username: data.username,
				rapid: data.perfs?.rapid?.rating || null,
				rapidGames: data.perfs?.rapid?.games || 0,
				puzzle: data.perfs?.puzzle?.rating || null,
				puzzleGames: data.perfs?.puzzle?.games || 0,
				createdAt: data.createdAt,
				online: data.online || false,
				playTime: data.playTime?.total || 0,
			}
		});
	} catch (err) {
		console.error('Lichess user fetch error:', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

/**
 * Fetch Lichess rating history (Rapid + Puzzle)
 * GET /api/lichess/rating-history/:username
 */
app.get('/api/lichess/rating-history/:username', async (req, res) => {
	try {
		const ip = req.ip || req.connection.remoteAddress;
		if (!checkLichessRateLimit(ip)) {
			return res.status(429).json({ success: false, error: 'Rate limit exceeded. Try again later.' });
		}

		const { username } = req.params;
		if (!username || username.length < 2 || username.length > 20) {
			return res.status(400).json({ success: false, error: 'Invalid username' });
		}

		const response = await fetch(`https://lichess.org/api/user/${encodeURIComponent(username)}/rating-history`, {
			headers: { 'Accept': 'application/json' }
		});

		if (!response.ok) {
			if (response.status === 404) {
				return res.status(404).json({ success: false, error: 'Lichess user not found' });
			}
			return res.status(502).json({ success: false, error: 'Lichess API error' });
		}

		const data = await response.json();

		// Filter to Rapid and Puzzle only
		const rapidData = data.find(cat => cat.name === 'Rapid');
		const puzzleData = data.find(cat => cat.name === 'Puzzles');

		const formatPoints = (category) => {
			if (!category || !category.points) return [];
			return category.points.map(([year, month, day, rating]) => ({
				date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
				rating
			}));
		};

		res.json({
			success: true,
			rapid: formatPoints(rapidData),
			puzzle: formatPoints(puzzleData),
		});
	} catch (err) {
		console.error('Lichess rating history error:', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// ==========================================
// WEBSOCKET CHAT (Existing Code)
// ==========================================

// roomName -> Set of ws
const rooms = new Map();
// ws -> Set of roomName
const clientRooms = new Map();

function joinRoom(ws, room) {
	if (!rooms.has(room)) rooms.set(room, new Set());
	rooms.get(room).add(ws);
	if (!clientRooms.has(ws)) clientRooms.set(ws, new Set());
	clientRooms.get(ws).add(room);
}

function leaveRoom(ws, room) {
	if (!rooms.has(room)) return;
	rooms.get(room).delete(ws);
	if (rooms.get(room).size === 0) rooms.delete(room);
	if (clientRooms.has(ws)) {
		clientRooms.get(ws).delete(room);
		if (clientRooms.get(ws).size === 0) clientRooms.delete(ws);
	}
}

function broadcastToRoom(room, payload, excludeWs) {
	const set = rooms.get(room);
	if (!set) return;
	for (const client of set) {
		if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
			client.send(JSON.stringify(payload));
		}
	}
}

const wss = new WebSocket.Server({ server });

// Log incoming upgrade requests (handshake) for debugging
server.on('upgrade', (req, socket, head) => {
	// eslint-disable-next-line no-console
	console.log('HTTP upgrade request:', {
		url: req.url,
		headers: {
			origin: req.headers.origin,
			host: req.headers.host,
			'sec-websocket-protocol': req.headers['sec-websocket-protocol'],
			'sec-websocket-key': req.headers['sec-websocket-key']
		}
	});
});

wss.on('connection', (ws, req) => {
	ws.isAlive = true;
	ws.on('pong', () => { ws.isAlive = true; });

	ws.on('message', (data) => {
		let msg;
		try {
			msg = JSON.parse(data.toString());
		} catch (e) {
			ws.send(JSON.stringify({ type: 'error', message: 'invalid_json' }));
			return;
		}

		const { type } = msg;
		if (type === 'join') {
			const { room, user } = msg;
			if (!room) return;
			joinRoom(ws, room);
			broadcastToRoom(room, { type: 'user_joined', room, user }, ws);
			ws.send(JSON.stringify({ type: 'joined', room }));
		} else if (type === 'leave') {
			const { room, user } = msg;
			if (!room) return;
			leaveRoom(ws, room);
			broadcastToRoom(room, { type: 'user_left', room, user }, ws);
			ws.send(JSON.stringify({ type: 'left', room }));
		} else if (type === 'message') {
			const { room, text, user } = msg;
			if (!room || typeof text === 'undefined') return;
			const payload = { type: 'message', room, text, user, ts: Date.now() };
			broadcastToRoom(room, payload, ws);
			ws.send(JSON.stringify({ type: 'sent', room, ts: payload.ts }));
		} else if (type === 'list') {
			// list rooms
			const list = Array.from(rooms.keys());
			ws.send(JSON.stringify({ type: 'rooms', rooms: list }));
		} else {
			ws.send(JSON.stringify({ type: 'error', message: 'unknown_type' }));
		}
	});

	ws.on('close', () => {
		// remove from all rooms
		const rset = clientRooms.get(ws);
		if (rset) {
			for (const room of rset) {
				leaveRoom(ws, room);
				broadcastToRoom(room, { type: 'user_left', room }, ws);
			}
		}
		clientRooms.delete(ws);
	});
});

// heartbeat
const interval = setInterval(() => {
	wss.clients.forEach((ws) => {
		if (ws.isAlive === false) return ws.terminate();
		ws.isAlive = false;
		ws.ping(() => { });
	});
}, 30000);

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/rooms', (req, res) => {
	const out = {};
	for (const [room, set] of rooms.entries()) out[room] = set.size;
	res.json(out);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
	clearInterval(interval);
	wss.close(() => process.exit(0));
});
