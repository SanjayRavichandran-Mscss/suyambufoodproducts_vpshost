const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

/* -------------------- AUTH -------------------- */
router.post('/login', adminController.login);
router.get('/verify', adminController.verify);

/* -------------------- CATEGORY -------------------- */
router.post('/categories', adminController.addCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.get('/categories', adminController.viewCategories);

/* -------------------- PRODUCTS -------------------- */
router.post('/products', adminController.addProduct);
router.patch('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/products', adminController.viewProducts);
router.get('/products/:id', adminController.getProductById);

/* -------------------- PRODUCT VARIANTS -------------------- */
router.post('/product-variants', adminController.addProductVariant);
router.patch('/product-variants/:id', adminController.updateProductVariant);
router.get('/product-variants', adminController.viewProductVariants);
router.delete('/products/:productId/variants/:variantId', adminController.deleteProductVariant);

/* -------------------- UOM -------------------- */
router.get('/uoms', adminController.getUoms);
router.post('/uoms', adminController.addUom);

/* -------------------- STOCK STATUSES -------------------- */
router.get('/stock-statuses', adminController.getStockStatuses);

/* -------------------- CUSTOMERS -------------------- */
router.get('/customers', adminController.viewCustomers);

/* -------------------- ADMIN PROFILE -------------------- */
router.get('/profile/:adminId', adminController.getProfile);

/* -------------------- ORDERS -------------------- */
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

/* -------------------- DASHBOARD -------------------- */
router.get('/dashboard', adminController.getDashboardData);

router.get('/banner-products', adminController.getBannerProducts);

/* -------------------- DELIVERY CHARGES -------------------- */
router.get('/delivery-charges', adminController.getDeliveryCharges);
router.post('/delivery-charges', adminController.addDeliveryCharge);
router.put('/delivery-charges/:id', adminController.updateDeliveryCharge);
router.delete('/delivery-charges/:id', adminController.deleteDeliveryCharge);

module.exports = router;