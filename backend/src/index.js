import 'dotenv/config';
import app from './app.js';
import { sequelize } from './config/database.js';
import { logger } from './utils/logger.js';
import cron from 'node-cron';
import { checkMissedSubmissions } from './utils/emailReminder.js';

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Schedule email reminder job (runs at 7 AM every day)
    cron.schedule('0 7 * * *', async () => {
      logger.info('Running scheduled email reminder check...');
      await checkMissedSubmissions();
    });

  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 