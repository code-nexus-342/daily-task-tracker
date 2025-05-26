import { sequelize } from '../config/database.js';
import { addFirebaseUid } from './20240326_add_firebase_uid.js';

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Run migrations
    await addFirebaseUid.up(sequelize.getQueryInterface());
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations(); 