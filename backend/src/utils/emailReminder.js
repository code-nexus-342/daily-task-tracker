import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { User, Task } from '../models/index.js';
import { Op } from 'sequelize';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Function to check for missed submissions
export const checkMissedSubmissions = async () => {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Find users who haven't submitted tasks yesterday
    const users = await User.findAll({
      where: {
        role: 'core',
        '$Tasks.submissionDate$': {
          [Op.not]: {
            [Op.between]: [yesterday, new Date()]
          }
        }
      },
      include: [{
        model: Task,
        required: false,
        where: {
          submissionDate: {
            [Op.between]: [yesterday, new Date()]
          }
        }
      }]
    });

    // Send reminder emails
    for (const user of users) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: user.email,
          subject: 'Reminder: Daily Task Submission',
          html: `
            <h1>Daily Task Submission Reminder</h1>
            <p>Dear ${user.fullName},</p>
            <p>This is a reminder that you haven't submitted your daily task for yesterday (${yesterday.toLocaleDateString()}).</p>
            <p>Please submit your task as soon as possible.</p>
            <p>Best regards,<br>Daily Task System</p>
          `
        });

        logger.info(`Reminder email sent to ${user.email}`);
      } catch (error) {
        logger.error(`Failed to send reminder email to ${user.email}:`, error);
      }
    }

    logger.info('Email reminder check completed');
  } catch (error) {
    logger.error('Error checking missed submissions:', error);
  }
}; 