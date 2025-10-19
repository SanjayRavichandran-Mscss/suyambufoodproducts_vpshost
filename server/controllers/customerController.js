const puppeteer = require('puppeteer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const url = require('url');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const wkhtmltopdf = require('wkhtmltopdf');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const SESSIONS = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function getDecodedCustomerId(req) {
    const customerIdBase64 = req.query.customerId;
    if (!customerIdBase64) {
        return null;
    }
    try {
        try {
            const customerId = parseInt(Buffer.from(customerIdBase64, 'base64').toString('utf-8'), 10);
            if (!isNaN(customerId)) {
                return customerId;
            }
        } catch (base64Error) {
            console.log('Not a base64 encoded ID, trying raw value');
        }
        const customerId = parseInt(customerIdBase64, 10);
        return isNaN(customerId) ? null : customerId;
    } catch (error) {
        console.error('Error decoding customerId:', error);
        return null;
    }
}

async function checkCustomerExists(customerId) {
    try {
        const [rows] = await db.query('SELECT id FROM customers WHERE id = ?', [customerId]);
        return rows.length > 0;
    } catch (error) {
        console.error('Error checking customer existence:', error);
        return false;
    }
}

async function generateInvoiceData(orderId) {
    try {
        const orderQuery = `
          SELECT 
            o.id AS order_id, o.customer_id, o.order_date, o.total_amount, o.tracking_number, o.invoice_number,
            c.full_name as customer_name, c.email as customer_email, c.phone as customer_mobile,
            CONCAT(a.street, ', ', a.city, ', ', a.state, ' ', a.zip_code, ', ', a.country) as delivery_address,
            pm.method as payment_method, os.status as order_status, om.method as order_method
          FROM orders o
          JOIN customers c ON o.customer_id = c.id
          JOIN addresses a ON o.address_id = a.id
          JOIN payment_methods pm ON o.payment_method_id = pm.id
          JOIN order_status os ON o.order_status_id = os.id
          JOIN order_methods om ON o.order_method_id = om.id
          WHERE o.id = ?
        `;
        const [orderRows] = await db.execute(orderQuery, [orderId]);
        if (orderRows.length === 0) {
            throw new Error('Order not found');
        }
        const order = orderRows[0];

        const itemsQuery = `
          SELECT 
            oi.product_variant_id, oi.quantity, oi.price_at_purchase, oi.subtotal,
            p.name, p.thumbnail_url
          FROM order_items oi
          JOIN product_variants pv ON oi.product_variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          WHERE oi.order_id = ?
        `;
        const [itemRows] = await db.execute(itemsQuery, [orderId]);

        const subtotal = parseFloat(order.total_amount);
        const shipping = subtotal > 999 ? 0 : 100;
        const tax = (subtotal * 0.18);
        const totalAmount = subtotal + shipping + tax;

        const templateData = {
            baseUrl: process.env.BASE_URL || 'http://localhost:5000',
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerMobile: order.customer_mobile,
            deliveryAddress: order.delivery_address,
            orderId: order.order_id,
            invoiceDate: new Date().toLocaleDateString('en-IN'),
            orderDate: new Date(order.order_date).toLocaleDateString('en-IN'),
            paymentMethod: order.payment_method,
            orderStatus: order.order_status,
            orderMethod: order.order_method,
            invoiceNumber: order.invoice_number || `SFP${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${orderId}`,
            items: itemRows.map(item => ({
                ...item,
                unitPrice: parseFloat(item.price_at_purchase / item.quantity).toFixed(2),
                subtotal: parseFloat(item.subtotal).toFixed(2)
            })),
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            freeShipping: shipping === 0,
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            paymentStatus: 'Completed',
            trackingNumber: order.tracking_number || null,
            full_name: order.customer_name,
            phone: order.customer_mobile,
            email: order.customer_email,
            street: order.delivery_address.split(', ')[0],
            city: order.delivery_address.split(', ')[1],
            state: order.delivery_address.split(', ')[2],
            zip_code: order.delivery_address.split(', ')[3],
            country: order.delivery_address.split(', ')[4],
            transactionDate: new Date().toLocaleDateString('en-IN')
        };
        return { templateData, order };
    } catch (error) {
        console.error('Error generating invoice data:', error);
        throw error;
    }
}

async function generatePDFfromHTMLTemplate(templateData) {
    try {
        const templatePath = path.join(__dirname, '../EmailTemplates/InvoicePDF.html');
        const templateSource = await fs.readFile(templatePath, 'utf-8');
        const logoPath = path.join(__dirname, '../public/Assets/Suyambu_Eng_logo.png');
        const logoAbsolutePath = `file://${logoPath.replace(/\\/g, '/')}`;
        const updatedTemplateData = { ...templateData, logoUrl: logoAbsolutePath };
        const modifiedTemplateSource = templateSource.replace('../public/Assets/Suyambu_Eng_logo.png', '{{logoUrl}}');
        const template = handlebars.compile(modifiedTemplateSource);
        const htmlContent = template(updatedTemplateData);
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], timeout: 60000 });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 60000 });
        const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }, printBackground: true, preferCSSPageSize: true });
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF from HTML:', { message: error.message, stack: error.stack });
        throw error;
    }
}

async function sendInvoiceEmail(order, templateData, pdfBuffer) {
    try {
        const emailTemplatePath = path.join(__dirname, '../EmailTemplates/InvoiceEmailTemplate.html');
        const emailTemplateSource = await fs.readFile(emailTemplatePath, 'utf-8');
        const emailTemplate = handlebars.compile(emailTemplateSource);
        const emailContent = emailTemplate({ customerName: templateData.customerName, orderId: templateData.orderId, orderDate: templateData.orderDate, totalAmount: templateData.totalAmount, baseUrl: templateData.baseUrl });
        const mailOptions = {
            from: { name: 'Suyambu Stores', address: process.env.EMAIL_USER },
            to: order.customer_email,
            subject: `Order Confirmation & Invoice - Order #${templateData.orderId} - Suyambu Stores`,
            html: emailContent,
            attachments: [{ filename: `Invoice-${templateData.orderId}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
            headers: { 'X-Priority': '3', 'X-Mailer': 'Suyambu Stores Mailer', 'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>` }
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Customer Email: ${order.customer_email}`);
        console.log(`Acknowledgment: Invoice email sent successfully for order ${templateData.orderId}`);
        console.log(`Email Message ID: ${info.messageId}`);
        console.log(`Email Response: ${info.response}`);
        return info;
    } catch (error) {
        console.error('Error sending invoice email:', { message: error.message, stack: error.stack, code: error.code, errno: error.errno, response: error.response || 'No response', responseCode: error.responseCode || 'No response code' });
        throw error;
    }
}

exports.register = async (req, res) => {
    const { username, email, password, full_name, phone } = req.body;
    if (!username || username.length > 50) return res.status(400).json({ message: 'Username is required and must be 50 characters or less' });
    if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Valid email is required and must be 100 characters or less' });
    if (!password || password.length > 255 || password.length < 6) return res.status(400).json({ message: 'Password is required, must be 6-255 characters' });
    if (!full_name || full_name.length > 100) return res.status(400).json({ message: 'Full name is required and must be 100 characters or less' });
    if (!phone || phone.length > 20 || !/^\+?[\d\s-]{7,20}$/.test(phone)) return res.status(400).json({ message: 'Valid phone number is required and must be 20 characters or less' });
    try {
        const [existingUser] = await db.query('SELECT * FROM customers WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) return res.status(400).json({ message: 'Email or username already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO customers (username, email, password, full_name, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', [username, email, hashedPassword, full_name, phone]);
        if (result.affectedRows === 0) return res.status(500).json({ message: 'Failed to register user' });
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email or username already exists' });
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.login = async (req, res) => {
    const { login, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM customers WHERE username = ? OR email = ?', [login, login]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid username or email' });
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' });
        if (SESSIONS.has(user.id)) SESSIONS.delete(user.id);
        const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
        SESSIONS.set(user.id, token);
        res.status(200).json({ message: 'Login successful', token, customerId: user.id });
    } catch (error) {
        console.error('Login error:', error.message, error.stack);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    const authHeader = req.headers.authorization;
    const customerId = req.query.customerId;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized: No token provided' });
    if (!customerId || isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        if (decoded.id !== parseInt(customerId)) return res.status(401).json({ message: 'Unauthorized: Token does not match customer ID' });
        const [users] = await db.query('SELECT full_name, email FROM customers WHERE id = ?', [customerId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ full_name: users[0].full_name, email: users[0].email });
    } catch (error) {
        console.error('Profile fetch error:', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.addToCart = async (req, res) => {
    const { customerId, variantId, quantity } = req.body;
    try {
        const [result] = await db.query("INSERT INTO cart_items (customer_id, product_variant_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)", [customerId, variantId, quantity]);
        res.status(200).json({ message: "Added to cart", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: "Failed to add to cart" });
    }
};

exports.getCart = async (req, res) => {
    const { customerId } = req.query;
    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({ error: "Valid customerId is required" });
    }
    try {
        const [rows] = await db.query(
            'SELECT ci.*, pv.id AS variant_id, pv.product_id, p.name AS product_name, p.thumbnail_url, um.uom_name AS uom_name, pv.variant_quantity, pv.price, ss.status AS stock_status FROM cart_items ci JOIN product_variants pv ON ci.product_variant_id = pv.id JOIN products p ON pv.product_id = p.id LEFT JOIN uom_master um ON pv.uom_id = um.id LEFT JOIN stock_statuses ss ON p.stock_status_id = ss.id WHERE ci.customer_id = ?',
            [customerId]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error("Failed to fetch cart:", err);
        res.status(500).json({ error: "Failed to fetch cart", details: err.message });
    }
};

exports.updateCartQuantity = async (req, res) => {
    const { customerId, variantId, quantity } = req.body;
    try {
        await db.query("UPDATE cart_items SET quantity = ? WHERE customer_id = ? AND product_variant_id = ?", [quantity, customerId, variantId]);
        res.status(200).json({ message: "Quantity updated" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update quantity" });
    }
};

exports.deleteFromCart = async (req, res) => {
    const { customerId, variantId } = req.query;
    if (!customerId || !variantId) return res.status(400).json({ error: 'customerId and variantId are required' });
    try {
        const [result] = await db.query('DELETE FROM cart_items WHERE customer_id = ? AND product_variant_id = ?', [customerId, variantId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found in cart' });
        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    const { customerId } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM wishlist WHERE customer_id = ?', [customerId]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
};

exports.toggleWishlist = async (req, res) => {
    const { customerId, productId } = req.body;
    if (!customerId || !productId) return res.status(400).json({ error: 'customerId and productId are required' });
    try {
        const [existing] = await db.query('SELECT * FROM wishlist WHERE customer_id = ? AND product_id = ?', [customerId, productId]);
        let is_liked;
        if (existing.length > 0) {
            is_liked = existing[0].is_liked === 1 ? 0 : 1;
            await db.query('UPDATE wishlist SET is_liked = ?, updated_at = NOW() WHERE customer_id = ? AND product_id = ?', [is_liked, customerId, productId]);
        } else {
            is_liked = 1;
            await db.query('INSERT INTO wishlist (customer_id, product_id, is_liked, added_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())', [customerId, productId, is_liked]);
        }
        res.status(200).json({ message: is_liked === 1 ? 'Added to wishlist' : 'Removed from wishlist', is_liked });
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAddresses = async (req, res) => {
    const customerId = getDecodedCustomerId(req);
    if (!customerId || isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID' });
    try {
        if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });
        const [rows] = await db.query('SELECT id, street, city, state, zip_code, country, is_default FROM addresses WHERE customer_id = ?', [customerId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.addAddress = async (req, res) => {
    const customerId = getDecodedCustomerId(req);
    if (!customerId) return res.status(400).json({ message: 'Customer ID is required' });
    const { street, city, state, zip_code, country, is_default } = req.body;
    // ... validation ...
    try {
        if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });
        if (is_default === 1 || is_default === true) await db.query('UPDATE addresses SET is_default = 0 WHERE customer_id = ?', [customerId]);
        const [result] = await db.query('INSERT INTO addresses (customer_id, street, city, state, zip_code, country, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [customerId, street, city, state, zip_code, country, is_default ? 1 : 0]);
        if (result.affectedRows === 0) return res.status(500).json({ message: 'Failed to add address' });
        res.status(201).json({ message: 'Address added successfully', id: result.insertId });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.updateAddress = async (req, res) => {
    const customerId = getDecodedCustomerId(req);
    if (!customerId) return res.status(400).json({ message: 'Customer ID is required' });
    const { id, street, city, state, zip_code, country, is_default } = req.body;
    // ... validation ...
    try {
        if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });
        const [existing] = await db.query('SELECT * FROM addresses WHERE id = ? AND customer_id = ?', [id, customerId]);
        if (existing.length === 0) return res.status(404).json({ message: 'Address not found' });
        if (is_default === 1 || is_default === true) await db.query('UPDATE addresses SET is_default = 0 WHERE customer_id = ? AND id != ?', [customerId, id]);
        const [result] = await db.query('UPDATE addresses SET street = ?, city = ?, state = ?, zip_code = ?, country = ?, is_default = ?, updated_at = NOW() WHERE id = ? AND customer_id = ?', [street, city, state, zip_code, country, is_default ? 1 : 0, id, customerId]);
        if (result.affectedRows === 0) return res.status(500).json({ message: 'Failed to update address' });
        res.status(200).json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    const customerId = getDecodedCustomerId(req);
    if (!customerId) return res.status(400).json({ message: 'Customer ID is required' });
    const parsedUrl = url.parse(req.url, true);
    const id = parseInt(parsedUrl.query.id, 10);
    if (!id || isNaN(id)) return res.status(400).json({ message: 'Address ID is required' });
    try {
        if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });
        const [result] = await db.query('DELETE FROM addresses WHERE id = ? AND customer_id = ?', [id, customerId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Address not found' });
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getCustomerDetails = async (req, res) => {
    const customerId = getDecodedCustomerId(req);
    if (!customerId || isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID' });
    try {
        const [rows] = await db.query('SELECT full_name, phone FROM customers WHERE id = ?', [customerId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.placeOrder = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized: No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const { customerId: customerIdStr, addressId, paymentMethodId, orderMethod, items, totalAmount, paymentDetails } = req.body;
        const customerId = parseInt(customerIdStr, 10);
        if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID' });
        if (decoded.id !== customerId) return res.status(401).json({ message: 'Unauthorized: Token does not match customer ID' });
        if (!addressId || !paymentMethodId || !orderMethod || !items || items.length === 0) return res.status(400).json({ message: 'Missing required fields' });
        const orderMethodId = orderMethod === 'buy_now' ? 1 : orderMethod === 'cart' ? 2 : null;
        if (!orderMethodId) return res.status(400).json({ message: 'Invalid order method' });
        let calculatedTotal = 0;
        let orderItemsValues = [];
        const variantIds = items.map(item => item.variantId);
        const [variantRows] = await db.query(`
            SELECT 
                pv.id, 
                pv.price, 
                pv.variant_quantity, 
                pv.uom_id, 
                pv.product_id, 
                p.name AS product_name, 
                p.description AS product_description, 
                p.thumbnail_url AS product_thumbnail_url, 
                p.additional_images AS product_additional_images, 
                p.category_id AS product_category_id,
                c.name AS product_category_name,
                c.description AS product_category_description
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE pv.id IN (?)
        `, [variantIds]);
        const variantMap = variantRows.reduce((map, row) => ({
            ...map, 
            [row.id]: {
                price: parseFloat(row.price),
                variant_quantity: parseFloat(row.variant_quantity),
                uom_id: row.uom_id,
                product_id: row.product_id,
                product_name: row.product_name,
                product_description: row.product_description,
                product_thumbnail_url: row.product_thumbnail_url,
                product_additional_images: row.product_additional_images,  // Could be string or array here
                product_category_id: row.product_category_id,
                product_category_name: row.product_category_name,
                product_category_description: row.product_category_description
            }
        }), {});
        for (const item of items) {
            if (!item.variantId || !item.quantity || isNaN(item.quantity)) return res.status(400).json({ message: 'Invalid item data' });
            const variantData = variantMap[item.variantId];
            if (!variantData) return res.status(400).json({ message: `Invalid variantId ${item.variantId}` });
            const qty = parseInt(item.quantity, 10);
            const price = variantData.price;
            if (qty <= 0 || !price) return res.status(400).json({ message: `Invalid variantId or quantity for item with variantId ${item.variantId}` });
            const subtotal = price * qty;
            calculatedTotal += subtotal;

            // Fix: Stringify product_additional_images if it's an array (or object); handle null/empty safely
            let additionalImagesStr = null;
            const images = variantData.product_additional_images;
            if (images) {
                if (Array.isArray(images)) {
                    additionalImagesStr = JSON.stringify(images);
                } else if (typeof images === 'object') {
                    additionalImagesStr = JSON.stringify(images);
                } else {
                    // Already a string (e.g., '[]' or '["path"]')
                    additionalImagesStr = images;
                }
            }

            orderItemsValues.push([
                null, // id (auto-increment)
                item.variantId, 
                qty, 
                price, 
                subtotal,
                variantData.product_id,
                variantData.product_name,
                variantData.product_description,
                variantData.product_thumbnail_url,
                additionalImagesStr,  // Now guaranteed as JSON string or null
                variantData.product_category_id,
                variantData.product_category_name,
                variantData.product_category_description,
                variantData.variant_quantity,
                variantData.uom_id,
                price // variant_price (same as price_at_purchase for snapshot consistency)
            ]);
        }
        const shipping = calculatedTotal > 999 ? 0 : 100;
        const finalTotal = calculatedTotal + shipping;
        // if (totalAmount && Math.abs(parseFloat(totalAmount) - finalTotal) > 0.01) return res.status(400).json({ message: 'Total amount mismatch' });
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const razorpayPaymentId = paymentDetails ? paymentDetails.razorpay_payment_id : null;
            const [orderResult] = await connection.query('INSERT INTO orders (customer_id, address_id, order_date, order_status_id, total_amount, payment_method_id, tracking_number, updated_at, order_method_id, invoice_number, razorpay_payment_id) VALUES (?, ?, NOW(), 1, ?, ?, NULL, NOW(), ?, NULL, ?)', [customerId, addressId, calculatedTotal.toFixed(2), paymentMethodId, orderMethodId, razorpayPaymentId]);
            const orderId = orderResult.insertId;
            const orderDate = new Date();
            const yy = orderDate.getFullYear().toString().slice(-2);
            const mm = (orderDate.getMonth() + 1).toString().padStart(2, '0');
            const dd = orderDate.getDate().toString().padStart(2, '0');
            const invoiceNumber = `SFP${yy}${mm}${dd}${orderId}`;
            await connection.query(`UPDATE orders SET invoice_number = ? WHERE id = ?`, [invoiceNumber, orderId]);
            orderItemsValues = orderItemsValues.map(row => [orderId, ...row.slice(1)]);
            if (orderItemsValues.length > 0) {
                await connection.query(`
                    INSERT INTO order_items (
                        order_id, product_variant_id, quantity, price_at_purchase, subtotal, 
                        product_id, product_name, product_description, product_thumbnail_url, 
                        product_additional_images, product_category_id, product_category_name,
                        product_category_description, variant_quantity, 
                        variant_uom_id, variant_price
                    ) VALUES ?
                `, [orderItemsValues]);
            }
            if (orderMethodId === 2) await connection.query('DELETE FROM cart_items WHERE customer_id = ?', [customerId]);
            await connection.commit();
            setImmediate(async () => {
                try {
                    const { templateData, order } = await generateInvoiceData(orderId);
                    const pdfBuffer = await generatePDFfromHTMLTemplate(templateData);
                    await sendInvoiceEmail(order, templateData, pdfBuffer);
                } catch (invoiceError) {
                    console.error(`Failed to send invoice for order ${orderId}:`, invoiceError);
                }
            });
            res.status(201).json({ message: 'Order placed successfully', orderId, invoiceNumber });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Place order error:', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getOrders = async (req, res) => {
    const customerId = req.query.customerId;
    if (!customerId || isNaN(customerId)) return res.status(400).json({ message: 'Invalid or missing customer ID' });
    const parsedCustomerId = parseInt(customerId, 10);
    try {
        const [customerExists] = await db.query('SELECT id, full_name, phone, email FROM customers WHERE id = ?', [parsedCustomerId]);
        if (customerExists.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customer = customerExists[0];
        const ordersQuery = 'SELECT o.id AS order_id, o.customer_id, o.address_id, o.order_date, o.order_status_id, o.total_amount, o.payment_method_id, o.tracking_number, o.updated_at, o.order_method_id, o.invoice_number, a.street, a.city, a.state, a.zip_code, a.country, os.status AS order_status, pm.method AS payment_method, om.method AS order_method FROM orders o JOIN addresses a ON o.address_id = a.id JOIN order_status os ON o.order_status_id = os.id JOIN payment_methods pm ON o.payment_method_id = pm.id JOIN order_methods om ON o.order_method_id = om.id WHERE o.customer_id = ? ORDER BY o.order_date DESC';
        const [orders] = await db.query(ordersQuery, [parsedCustomerId]);
        const itemsQuery = 'SELECT oi.order_id, oi.product_variant_id, oi.quantity, oi.price_at_purchase, oi.subtotal, oi.product_name AS name, oi.product_description AS description, oi.product_thumbnail_url AS thumbnail_url, oi.variant_quantity, oi.product_category_name AS category_name, um.uom_name FROM order_items oi LEFT JOIN uom_master um ON oi.variant_uom_id = um.id JOIN orders o ON oi.order_id = o.id WHERE o.customer_id = ?';
        const [itemsRows] = await db.query(itemsQuery, [parsedCustomerId]);
        const itemsMap = {};
        for (const row of itemsRows) {
            const orderId = row.order_id;
            if (!itemsMap[orderId]) itemsMap[orderId] = [];
            itemsMap[orderId].push(row);
        }
        for (let order of orders) {
            order.items = itemsMap[order.order_id] || [];
            order.address = { street: order.street, city: order.city, state: order.state, zip_code: order.zip_code, country: order.country };
            delete order.street;
            delete order.city;
            delete order.state;
            delete order.zip_code;
            delete order.country;
            order.customer = { full_name: customer.full_name, phone: customer.phone, email: customer.email };
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getInvoiceData = async (req, res) => {
    const { orderId } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized: No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const [orderCheck] = await db.query('SELECT customer_id FROM orders WHERE id = ?', [orderId]);
        if (orderCheck.length === 0) return res.status(404).json({ message: 'Order not found' });
        if (orderCheck[0].customer_id !== decoded.id) return res.status(403).json({ message: 'Access denied: Order does not belong to you' });
        const { templateData } = await generateInvoiceData(orderId);
        const pdfBuffer = await generatePDFfromHTMLTemplate(templateData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice-${orderId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Get invoice data error:', error);
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
        res.status(500).json({ message: 'Failed to get invoice data: ' + error.message });
    }
};

exports.createPaymentOrder = async (req, res) => {
    const { amount } = req.body;
    const options = {
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
    };
    try {
        const order = await razorpayInstance.orders.create(options);
        if (!order) return res.status(500).send('Error creating order');
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send(error.message || 'Something went wrong');
    }
};

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, message: 'Missing payment details.' });
    try {
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
        if (expectedSignature === razorpay_signature) {
            console.log(`Payment verified successfully for order: ${razorpay_order_id}`);
            res.status(200).json({ success: true, message: 'Payment verified successfully.' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed.' });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).send(error.message || 'Internal Server Error');
    }
};








// Send contact form email
exports.sendContactEmail = async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (message.length > 1000) {
        return res.status(400).json({ message: 'Message must be 1000 characters or less' });
    }

    try {
        const mailOptions = {
            from: `"${name}" <${email}>`, // Spoof from user's email (actual sender is EMAIL_USER)
            replyTo: email, // Allows server to reply to the user's email
            to: process.env.EMAIL_USER, // suyambufoodstores@gmail.com
            subject: `Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #B6895B;">${message}</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">This email was submitted via the Suyambu Stores contact form on ${new Date().toLocaleString('en-IN')}</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Contact email sent successfully: ${info.messageId}`);

        res.status(200).json({ message: 'Email sent successfully. Thank you for contacting us!' });
    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
};