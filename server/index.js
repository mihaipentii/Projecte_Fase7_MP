const express = require('express');
const cors    = require('cors');
const session = require('express-session');
const fs      = require('fs');
const path    = require('path');

const app     = express();
const PORT    = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware 
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: 'energywise-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 }
}));

//  DB helpers 
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(arr) {
  if (arr.length === 0) return '1';
  const maxId = Math.max(...arr.map(l => parseInt(l.id) || 0));
  return String(maxId + 1);
}

//  Auth middleware 
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized — please log in' });
  }
  next();
}

// POST /api/auth/login 
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  console.log('[LOGIN] attempt:', username);

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const db   = readDB();
  console.log('[LOGIN] users in db:', db.users.map(u => u.username));

  const user = db.users.find(
    u => u.username === username.trim() && u.password === password.trim()
  );

  if (!user) {
    console.log('[LOGIN] no match found for:', username);
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  req.session.userId   = user.id;
  req.session.username = user.username;
  req.session.name     = user.name;
  req.session.role     = user.role;

  res.json({
    success: true,
    message: 'Login successful',
    user: { id: user.id, username: user.username, name: user.name, role: user.role }
  });
});

//  POST /api/auth/logout 
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

//  GET /api/auth/me 
app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  res.json({
    success: true,
    user: {
      id:       req.session.userId,
      username: req.session.username,
      name:     req.session.name,
      role:     req.session.role
    }
  });
});

//  GET /api/users (admin only) 
app.get('/api/users', requireAuth, (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admins only' });
  }
  const db = readDB();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json({ success: true, data: safeUsers });
});

//  GET /api/logs 
app.get('/api/logs', requireAuth, (req, res) => {
  const db = readDB();
  let logs = db.logs;

  if (req.session.role !== 'admin') {
    logs = logs.filter(l => l.userId === req.session.userId);
  }

  const { category, source, from, to } = req.query;
  if (category) logs = logs.filter(l => l.category.toLowerCase() === category.toLowerCase());
  if (source)   logs = logs.filter(l => l.source.toLowerCase().includes(source.toLowerCase()));
  if (from)     logs = logs.filter(l => l.date >= from);
  if (to)       logs = logs.filter(l => l.date <= to);

  res.json({ success: true, count: logs.length, data: logs });
});

//  GET /api/logs/:id 
app.get('/api/logs/:id', requireAuth, (req, res) => {
  const db  = readDB();
  const log = db.logs.find(l => l.id === req.params.id);

  if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

  if (log.userId !== req.session.userId && req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  res.json({ success: true, data: log });
});

//  POST /api/logs 
app.post('/api/logs', requireAuth, (req, res) => {
  const { date, category, source, kwh, co2kg, location, notes } = req.body;

  if (!date || !category || !source || kwh === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields: date, category, source, kwh' });
  }
  if (isNaN(kwh) || kwh < 0) {
    return res.status(400).json({ success: false, message: 'kwh must be a non-negative number' });
  }

  const db     = readDB();
  const newLog = {
    id:        generateId(db.logs),
    userId:    req.session.userId,
    date,
    category,
    source,
    kwh:       parseFloat(kwh),
    co2kg:     parseFloat(co2kg) || 0,
    location:  location || '',
    notes:     notes || '',
    createdAt: new Date().toISOString()
  };

  db.logs.push(newLog);
  writeDB(db);
  res.status(201).json({ success: true, message: 'Log created', data: newLog });
});

//  PUT /api/logs/:id 
app.put('/api/logs/:id', requireAuth, (req, res) => {
  const db    = readDB();
  const index = db.logs.findIndex(l => l.id === req.params.id);

  if (index === -1) return res.status(404).json({ success: false, message: 'Log not found' });

  const log = db.logs[index];
  if (log.userId !== req.session.userId && req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { date, category, source, kwh, co2kg, location, notes } = req.body;
  if (kwh !== undefined && (isNaN(kwh) || kwh < 0)) {
    return res.status(400).json({ success: false, message: 'kwh must be a non-negative number' });
  }

  db.logs[index] = {
    ...log,
    date:      date      || log.date,
    category:  category  || log.category,
    source:    source    || log.source,
    kwh:       kwh       !== undefined ? parseFloat(kwh)   : log.kwh,
    co2kg:     co2kg     !== undefined ? parseFloat(co2kg) : log.co2kg,
    location:  location  !== undefined ? location          : log.location,
    notes:     notes     !== undefined ? notes             : log.notes,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);
  res.json({ success: true, message: 'Log updated', data: db.logs[index] });
});

//  DELETE /api/logs/:id 
app.delete('/api/logs/:id', requireAuth, (req, res) => {
  const db    = readDB();
  const index = db.logs.findIndex(l => l.id === req.params.id);

  if (index === -1) return res.status(404).json({ success: false, message: 'Log not found' });

  const log = db.logs[index];
  if (log.userId !== req.session.userId && req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const deleted = db.logs.splice(index, 1)[0];
  writeDB(db);
  res.json({ success: true, message: 'Log deleted', data: deleted });
});

//  GET /api/stats 
app.get('/api/stats', requireAuth, (req, res) => {
  const db   = readDB();
  let   logs = db.logs;

  if (req.session.role !== 'admin') {
    logs = logs.filter(l => l.userId === req.session.userId);
  }

  const totalKwh = logs.reduce((sum, l) => sum + l.kwh, 0);
  const totalCo2 = logs.reduce((sum, l) => sum + l.co2kg, 0);

  const byCategory = {};
  const bySource   = {};

  logs.forEach(l => {
    if (!byCategory[l.category]) byCategory[l.category] = { kwh: 0, co2kg: 0, count: 0 };
    byCategory[l.category].kwh   += l.kwh;
    byCategory[l.category].co2kg += l.co2kg;
    byCategory[l.category].count += 1;

    if (!bySource[l.source]) bySource[l.source] = { kwh: 0, co2kg: 0, count: 0 };
    bySource[l.source].kwh   += l.kwh;
    bySource[l.source].co2kg += l.co2kg;
    bySource[l.source].count += 1;
  });

  res.json({
    success: true,
    data: {
      totalLogs: logs.length,
      totalKwh:  Math.round(totalKwh * 100) / 100,
      totalCo2:  Math.round(totalCo2 * 100) / 100,
      byCategory,
      bySource
    }
  });
});

// Fallback SPA — must be last 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EnergyWise server running at http://localhost:${PORT}`);
});