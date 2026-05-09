import express from 'express';
import {
  calculatePrice,
  confirmPayment,
  getAllOrdersPopulated,
  getOrdersByUserId,
  getOrderStats,
  updateDeliveryStatus,
  uploadBook,
  refundOrder,
  checkPaymentStatus,
  deleteOrder,
  exportOrders,
  archiveOrder
} from './order.controller.js';
import { viewBookPdf } from './order.pdfProxy.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  adminMiddleware,
  verifyToken
} from '../../core/middlewares/authMiddleware.js';

const router = express.Router();

// Route for calculating the price (user sees this before paying)
router.post('/calculate-price', calculatePrice);

// Route for updating delivery status (admin)
router.patch(
  '/update-delivery-status',
  verifyToken,
  adminMiddleware,
  updateDeliveryStatus
);

// Route for confirming payment and getting the Stripe URL
router.post('/confirm-payment', verifyToken, confirmPayment);

// Route for checking payment status
router.post('/check-payment-status', verifyToken, checkPaymentStatus);

// Route for refunding an order
router.post('/refund', verifyToken, adminMiddleware, refundOrder);

// Get orders by user ID
router.get('/user/:userId', verifyToken, getOrdersByUserId);

// Secure PDF viewer proxy (auth required)
router.get('/:orderId/view-pdf', verifyToken, viewBookPdf);

// Admin routes
router.get('/admin/all-orders', verifyToken, adminMiddleware, getAllOrdersPopulated);
router.get('/admin/export-orders', verifyToken, adminMiddleware, exportOrders);
router.put('/upload-book', verifyToken, multerUpload([{ name: 'image' }]), uploadBook);
router.get('/admin/dashboard-stats', verifyToken, adminMiddleware, getOrderStats);
router.delete('/admin/:orderId', verifyToken, adminMiddleware, deleteOrder);
router.patch('/admin/archive/:orderId', verifyToken, adminMiddleware, archiveOrder);

export default router;
