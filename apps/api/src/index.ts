import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { authRoutes } from './routes/auth';
import { vehicleRoutes } from './routes/vehicles';
import { problemsRoutes } from './routes/problems';
import { partsRoutes } from './routes/parts';
import { tiresRoutes } from './routes/tires';
import { modificationsRoutes } from './routes/modifications';
import { maintenanceRoutes } from './routes/maintenance';
import { valuationRoutes } from './routes/valuation';
import { nhtsaRoutes } from './routes/nhtsa';
import { affiliateRoutes } from './routes/affiliates';
import { subscriptionRoutes } from './routes/subscriptions';
import { priceAlertRoutes } from './routes/priceAlerts';
import { userGuideRoutes } from './routes/userGuides';
import { adminRoutes } from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Import cron jobs
import { startPriceAlertCron } from './jobs/priceAlertCron';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/nhtsa', nhtsaRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/tires', tiresRoutes);
app.use('/api/modifications', modificationsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/valuation', valuationRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/guides', userGuideRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚗 Car Hub API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Initialize background jobs
  if (process.env.FEATURE_PRICE_ALERTS === 'true') {
    startPriceAlertCron();
  }

  console.log('✅ Server initialized successfully');
});

export default app;
