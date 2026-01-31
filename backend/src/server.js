import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schedules', scheduleRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'PremixTrack API is running' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`PremixTrack API running at http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/v1/health`);
});
