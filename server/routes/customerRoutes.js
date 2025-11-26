const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');



router.post('/send-registration-otp', customerController.sendRegistrationOtp);
router.post('/verify-registration-otp', customerController.verifyRegistrationOtp);

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

// New routes for states and cities (public, no auth required)
router.get('/states', customerController.getStates);
router.get('/cities', customerController.getCities);
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


// Contact form email route
router.post('/contact', customerController.sendContactEmail);

router.post('/calculate-delivery', customerController.calculateDelivery);


router.get('/product/:id', customerController.getCustomerProduct);


// Add these to customerRoutes.js (append to the existing router definitions)

router.post('/forgot-password', customerController.forgotPassword);
router.post('/reset-password', customerController.resetPassword);

module.exports = router;