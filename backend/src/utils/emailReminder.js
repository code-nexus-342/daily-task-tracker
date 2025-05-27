import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import db from '../models/index.js';
import { Op } from 'sequelize';

const { User, Task } = db;

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Check for missed submissions and send reminders
export const checkMissedSubmissions = async () => {
  try {
    // Get all users who haven't submitted a task in the last 24 hours
    const users = await User.findAll({
      include: [{
        model: Task,
        where: {
          submissionDate: {
            [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        required: false
      }]
    });

    // Send reminder emails
    for (const user of users) {
      if (user.Tasks.length === 0) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: 'Reminder: Daily Task Submission',
          text: `Hi ${user.fullName},\n\nThis is a reminder that you haven't submitted your daily task yet. Please submit it as soon as possible.\n\nBest regards,\nYour App Team`
        });

        logger.info(`Reminder email sent to ${user.email}`);
      }
    }
  } catch (error) {
    logger.error('Error sending reminder emails:', error);
  }
}; 