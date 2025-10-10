// const express = require('express');
// const router = express.Router();
// const customerController = require('../controllers/customerController');

// router.post('/register', customerController.register);
// router.post('/login', customerController.login);
// router.get('/profile', customerController.getProfile);

// // New cart routes
// router.post('/cart', customerController.addToCart);
// router.get('/cart', customerController.getCart);
// router.put('/cart', customerController.updateCartQuantity);
// router.delete('/cart', customerController.deleteFromCart);

// // Wishlist routes
// router.get('/wishlist', customerController.getWishlist);
// router.post('/wishlist', customerController.toggleWishlist);

// // Address routes
// router.get('/addresses', customerController.getAddresses);
// router.post('/addresses', customerController.addAddress);
// router.put('/addresses', customerController.updateAddress);
// router.delete('/addresses', customerController.deleteAddress);

// // Customer details route
// router.get('/customer-details', customerController.getCustomerDetails);

// // Order routes
// router.post('/orders', customerController.placeOrder);
// router.get('/orders', customerController.getOrders);

// // Invoice routes (now returns HTML for frontend PDF generation)
// router.get('/invoice/:orderId/data', customerController.getInvoiceData);

// module.exports = router;













const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.get('/profile', customerController.getProfile);

// New cart routes
router.post('/cart', customerController.addToCart);
router.get('/cart', customerController.getCart);
router.put('/cart', customerController.updateCartQuantity);
router.delete('/cart', customerController.deleteFromCart);

// Wishlist routes
router.get('/wishlist', customerController.getWishlist);
router.post('/wishlist', customerController.toggleWishlist);

// Address routes
router.get('/addresses', customerController.getAddresses);
router.post('/addresses', customerController.addAddress);
router.put('/addresses', customerController.updateAddress);
router.delete('/addresses', customerController.deleteAddress);

// Customer details route
router.get('/customer-details', customerController.getCustomerDetails);

// Order routes
router.post('/orders', customerController.placeOrder);
router.get('/orders', customerController.getOrders);

// --- RAZORPAY PAYMENT ROUTES ---
// This route creates the Razorpay order on the server
router.post('/payment/create-order', customerController.createPaymentOrder);

// This route verifies the payment signature after the user pays
router.post('/payment/verify', customerController.verifyPayment);
// ---------------------------------

// Invoice routes (now returns HTML for frontend PDF generation)
router.get('/invoice/:orderId/data', customerController.getInvoiceData);

module.exports = router;