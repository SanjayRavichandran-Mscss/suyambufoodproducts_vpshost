const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

console.log("📌 Loading adminRoutes...");

/* -------------------- AUTH -------------------- */
router.post("/login", (req, res, next) => {
  console.log("➡️ POST /api/admin/login hit");
  next();
}, adminController.login);

router.get("/verify", (req, res, next) => {
  console.log("➡️ GET /api/admin/verify hit");
  next();
}, adminController.verify);

/* -------------------- CATEGORY -------------------- */
router.post("/categories", adminController.addCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);
router.get("/categories", adminController.viewCategories);

/* -------------------- PRODUCTS -------------------- */
router.post("/products", adminController.addProduct);
router.patch("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);
router.get("/products", adminController.viewProducts);
router.get("/products/:id", adminController.getProductById);

/* -------------------- PRODUCT VARIANTS -------------------- */
router.post("/product-variants", adminController.addProductVariant);
router.patch("/product-variants/:id", adminController.updateProductVariant);
router.get("/product-variants", adminController.viewProductVariants);
// ✅ ADD THIS NEW ROUTE FOR DELETING VARIANTS
router.delete("/products/:productId/variants/:variantId", (req, res, next) => {
  console.log("➡️ DELETE /api/admin/products/:productId/variants/:variantId hit with params:", req.params);
  next();
}, adminController.deleteProductVariant);

/* -------------------- UOM -------------------- */
router.get("/uoms", (req, res, next) => {
  console.log("➡️ GET /api/admin/uoms hit");
  next();
}, adminController.getUoms);

router.post("/uoms", (req, res, next) => {
  console.log("➡️ POST /api/admin/uoms hit with body:", req.body);
  next();
}, adminController.addUom);

/* -------------------- STOCK STATUSES -------------------- */
router.get("/stock-statuses", (req, res, next) => {
  console.log("➡️ GET /api/admin/stock-statuses hit");
  next();
}, adminController.getStockStatuses);

/* -------------------- CUSTOMERS -------------------- */
router.get("/customers", adminController.viewCustomers);

/* -------------------- ADMIN PROFILE -------------------- */
router.get("/profile/:adminId", adminController.getProfile);


router.get("/orders", (req, res, next) => {
  console.log("➡️ GET /api/admin/orders hit");
  next();
}, adminController.getAllOrders);


router.put("/orders/:orderId/status", (req, res, next) => {
  console.log("➡️ PUT /api/admin/orders/:orderId/status hit");
  next();
}, adminController.updateOrderStatus);

/* -------------------- DASHBOARD -------------------- */
router.get("/dashboard", (req, res, next) => {
  console.log("➡️ GET /api/admin/dashboard hit");
  next();
}, adminController.getDashboardData);

console.log("✅ Admin routes loaded");


module.exports = router;
