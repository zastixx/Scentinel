import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import dogRoutes from './routes/dogs.routes';
import reportRoutes from './routes/reports.routes';
import matchRoutes from './routes/matches.routes';
import chainRoutes from './routes/chain.routes';

const app = express();
const port = env.PORT || 4000;

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Main API Router Mount
app.use('/api/dogs', dogRoutes);
app.use('/api', reportRoutes); // For /alerts/:id and /dogs/:id/lost
app.use('/api', matchRoutes);  // For /sightings and /matches/:id/confirm
app.use('/api/chain', chainRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`[SERVER] Scentinel Backend running on http://localhost:${port}`);
});
