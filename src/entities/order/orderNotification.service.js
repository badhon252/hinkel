import sendEmail from '../../lib/sendEmail.js';
import { adminMail } from '../../core/config/config.js';
import {
  getOrderCreatedUserTemplate,
  getOrderCreatedAdminTemplate,
  getPaymentConfirmedUserTemplate,
  getPaymentConfirmedAdminTemplate,
  getBookUploadedUserTemplate,
  getDeliveryStatusUpdateUserTemplate,
  getRefundUserTemplate,
  getRefundAdminTemplate
} from './orderEmail.templates.js';

/**
 * Notify user when order is created (pending payment)
 */
export const notifyUserOrderCreated = async (orderData, userData) => {
  return sendEmail({
    to: userData.email,
    subject: '🛒 Order Created - Pending Payment',
    html: getOrderCreatedUserTemplate(orderData, userData)
  });
};

/**
 * Notify admin when new order is created
 */
export const notifyAdminOrderCreated = async (orderData, userData) => {
  return sendEmail({
    to: adminMail,
    subject: '🆕 New Order Created',
    html: getOrderCreatedAdminTemplate(orderData, userData)
  });
};

/**
 * Notify user when payment is confirmed
 */
export const notifyUserPaymentConfirmed = async (orderData, userData) => {
  return sendEmail({
    to: userData.email,
    subject: '✅ Payment Confirmed - Order Processing',
    html: getPaymentConfirmedUserTemplate(orderData, userData)
  });
};

/**
 * Notify admin when payment is confirmed
 */
export const notifyAdminPaymentConfirmed = async (orderData, userData) => {
  return sendEmail({
    to: adminMail,
    subject: '💰 Payment Received for Order',
    html: getPaymentConfirmedAdminTemplate(orderData, userData)
  });
};

/**
 * Notify user when book is uploaded by admin
 */
export const notifyUserBookUploaded = async (orderData, userData) => {
  const { deliveryType, book, title } = orderData;
  let subject = '📚 Your Book is Ready!';
  let attachments = [];

  // Logic based on delivery type:
  // 1. PDF Only (digital): PDF file delivered via email
  // 2. Print (print): Email confirms the print order
  // 3. Both (print&digital): Confirmation email confirms print order AND attach digital/PDF file

  if (deliveryType === 'digital' || deliveryType === 'print&digital') {
    if (book) {
      attachments.push({
        filename: `${title || 'your-book'}.pdf`,
        path: book // Cloudinary URL
      });
    }
  }

  if (deliveryType === 'print' || deliveryType === 'print&digital') {
    subject = '📦 Print Order Confirmed - Your Book is Ready!';
  }

  return sendEmail({
    to: userData.email,
    subject,
    html: getBookUploadedUserTemplate(orderData, userData),
    attachments
  });
};

/**
 * Notify user when delivery status is updated
 */
export const notifyUserDeliveryStatusUpdate = async (
  orderData,
  userData,
  oldStatus,
  newStatus
) => {
  return sendEmail({
    to: userData.email,
    subject: `📦 Delivery Status Updated: ${newStatus}`,
    html: getDeliveryStatusUpdateUserTemplate(
      orderData,
      userData,
      oldStatus,
      newStatus
    )
  });
};

/**
 * Notify user when refund is processed
 */
export const notifyUserRefund = async (orderData, userData) => {
  return sendEmail({
    to: userData.email,
    subject: '💵 Refund Processed - Order Cancelled',
    html: getRefundUserTemplate(orderData, userData)
  });
};

/**
 * Notify admin when refund is processed
 */
export const notifyAdminRefund = async (orderData, userData) => {
  return sendEmail({
    to: adminMail,
    subject: '💵 Order Refunded and Cancelled',
    html: getRefundAdminTemplate(orderData, userData)
  });
};
