import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface LeaderboardRecord {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  rankTitle: string;
  completedAt: string;
}

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADERBOARD_FILE)) {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLeaderboard(): LeaderboardRecord[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(records: LeaderboardRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

function sortLeaderboard(records: LeaderboardRecord[]): LeaderboardRecord[] {
  return [...records].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeSpentSeconds !== b.timeSpentSeconds) {
      return a.timeSpentSeconds - b.timeSpentSeconds;
    }
    return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/leaderboard', (_req, res) => {
    const records = sortLeaderboard(readLeaderboard()).slice(0, 50);
    res.json({ entries: records });
  });

  app.post('/api/leaderboard', (req, res) => {
    const body = req.body as Partial<LeaderboardRecord>;
    const studentName = typeof body.studentName === 'string' ? body.studentName.trim().slice(0, 60) : '';
    const score = typeof body.score === 'number' && Number.isFinite(body.score) ? Math.max(0, Math.min(100, Math.floor(body.score))) : 0;
    const totalQuestions = typeof body.totalQuestions === 'number' && Number.isFinite(body.totalQuestions) ? Math.max(1, Math.min(100, Math.floor(body.totalQuestions))) : 20;
    const timeSpentSeconds = typeof body.timeSpentSeconds === 'number' && Number.isFinite(body.timeSpentSeconds) ? Math.max(1, Math.min(3600, Math.floor(body.timeSpentSeconds))) : 600;
    const rankTitle = typeof body.rankTitle === 'string' ? body.rankTitle.trim().slice(0, 40) : 'Sĩ tử';

    if (!studentName) {
      res.status(400).json({ error: 'Vui lòng nhập tên học sinh.' });
      return;
    }

    const newEntry: LeaderboardRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      studentName,
      score,
      totalQuestions,
      timeSpentSeconds,
      rankTitle,
      completedAt: new Date().toISOString(),
    };

    const existing = readLeaderboard();
    existing.push(newEntry);
    const sorted = sortLeaderboard(existing).slice(0, 100);
    writeLeaderboard(sorted);

    res.status(201).json({ entry: newEntry, entries: sorted.slice(0, 50) });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
