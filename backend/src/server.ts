import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as path from 'path';
import tokenRoutes from './routes/tokens';
import stakingRoutes from './routes/staking';
import airdropRoutes from './routes/airdrops';
import gameRoutes from './routes/game';
import campaignsRouter from './routes/campaigns';
import dexRoutes from './routes/dex';
import liquidityRoutes from './routes/liquidity';
import referralRoutes from './routes/referrals';
import pointsRoutes from './routes/points';
import projectRoutes from './routes/projects';
import { errorHandler } from './middleware/errorHandler';
import { securityMiddleware, checkRateLimit } from './middleware/security';
import { initializeDefaultTasks } from './initTasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProduction ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:5000'),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(securityMiddleware);
app.use(checkRateLimit);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'StellForge API is running',
    network: process.env.STELLAR_NETWORK || 'mainnet',
    horizon: process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org',
    environment: isProduction ? 'production' : 'development'
  });
});

app.use('/api/tokens', tokenRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/airdrops', airdropRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/dex', dexRoutes);
app.use('/api/liquidity', liquidityRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api', campaignsRouter);

if (isProduction) {
  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  
  console.log(`Production mode: Will serve frontend from ${frontendDist}`);
}

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`StellForge API server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`Network: ${process.env.STELLAR_NETWORK || 'mainnet'}`);
  console.log(`Horizon URL: ${process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org'}`);
  console.log(`CORS Origin: ${isProduction ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:5000')}`);
  
  await initializeDefaultTasks();
  console.log('✓ Database initialized');
});

export default app;
