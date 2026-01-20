const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

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
		ws.ping(() => {});
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
