import sendEmail from '../../lib/sendEmail.js';
import { adminMail } from '../../core/config/config.js';
import { getContactMessageForAdminTemplate } from './adminContact.template.js';
import { getUserContactConfirmationTemplate } from './userContact.template.js';

export const notifyAdminContactMessage = async (payload) => {
  return sendEmail({
    to: adminMail,
    subject: '📩 New Contact Form Submission',
    html: getContactMessageForAdminTemplate(payload)
  });
};

export const notifyUserContactConfirmation = async (payload) => {
  return sendEmail({
    to: payload.email,
    subject: '📩 Contact Request Received - Hinkle Creek',
    html: getUserContactConfirmationTemplate(payload)
  });
};
