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

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
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
});

export default app;
