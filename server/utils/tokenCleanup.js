import cron from 'node-cron';
import RefreshToken from '../models/RefreshToken.js';
import logger from './logger.js';

/**
 * Manually clean up expired, revoked, or used refresh tokens from the database.
 */
export const cleanStaleTokens = async () => {
  try {
    const now = new Date();
    // Delete expired, revoked, or already-used tokens
    const result = await RefreshToken.deleteMany({
      $or: [
        { expiresAt: { $lt: now } },
        { revoked: true },
        { isUsed: true, updatedAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } // Keep used tokens for 24h for audit purposes, then delete
      ]
    });
    
    logger.info(`🧹 Stale tokens cleanup run complete. Deleted ${result.deletedCount} token records.`);
    return result.deletedCount;
  } catch (error) {
    logger.error('❌ Error during stale token database cleanup:', error);
    throw error;
  }
};

/**
 * Initialize background cron job to run stale token cleanups.
 * Runs every day at midnight (00:00).
 */
export const initTokenCleanupCron = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('⏰ Running scheduled background token cleanup cron job...');
    await cleanStaleTokens();
  });
  logger.info('⏰ Background token cleanup cron job scheduled successfully (runs daily at midnight).');
};

export default {
  cleanStaleTokens,
  initTokenCleanupCron
};
