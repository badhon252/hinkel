import { Contact } from './contact.model.js';
import { AppError } from '../../utility/AppError.js';
import {
  notifyAdminContactMessage,
  notifyUserContactConfirmation
} from './contactNotification.service.js';

const createContactMessageIntoDb = async (payload) => {
  const { firstName, lastName, email, phone, message } = payload;

  const exactEmail = await Contact.findOne({ email });
  if (exactEmail) {
    throw new AppError('Email already exists', 409);
  }

  if (!firstName || !lastName || !email || !message) {
    throw new AppError('First name, last name, email, and message are required', 400);
  }

  const contact = await Contact.create(payload);

  // 🔔 Side effect (non-blocking)
  notifyAdminContactMessage(payload).catch((err) => {
    console.error('Admin contact email failed:', err);
  });

  notifyUserContactConfirmation(payload).catch((err) => {
    console.error('User contact confirmation email failed:', err);
  });

  return contact;
};

export const contactService = {
  createContactMessageIntoDb
};
