const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const nodemailer = require('nodemailer');
const { spawn } = require('child_process');
const path = require('path');
const STOCKFISH_PATH = require.resolve('stockfish/src/stockfish-nnue-16-no-simd.js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

		const loginLink = process.env.FRONTEND_URL || 'http://localhost:5173';

		const mailOptions = {
			from: `"VJ AI Chess Academy" <${process.env.EMAIL_USER}>`,
			to: parentEmail,
			subject: `🎉 Welcome to VJ AI Chess Academy, ${studentName}!`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #1a365d;">♟️ VJ AI Chess Academy</h1>
					</div>
					
					<p>Dear <strong>${parentName}</strong>,</p>
					
					<p>Welcome to VJ AI Chess Academy! 🎉</p>
					
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
					
					<p>Best regards,<br><strong>VJ AI Chess Academy Team</strong></p>
					
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

		const loginLink = process.env.FRONTEND_URL || 'http://localhost:5173';

		const mailOptions = {
			from: `"VJ AI Chess Academy" <${process.env.EMAIL_USER}>`,
			to: personalEmail,
			subject: `🎓 Welcome to the Faculty - VJ AI Chess Academy`,
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="text-align: center; margin-bottom: 30px;">
						<h1 style="color: #1a365d;">♟️ VJ AI Chess Academy</h1>
					</div>
					
					<p>Dear <strong>${fullName}</strong>,</p>
					
					<p>We are delighted to welcome you to the VJ AI Chess Academy teaching faculty! 🎉</p>
					
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
					
					<p>Best regards,<br><strong>VJ AI Chess Academy Admin Team</strong></p>
					
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
			from: `"VJ AI Chess Academy" <${process.env.EMAIL_USER}>`,
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

// ==========================================
// SERVE STATIC ASSETS (PRODUCTION)
// ==========================================

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../dist/index.html'));
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
