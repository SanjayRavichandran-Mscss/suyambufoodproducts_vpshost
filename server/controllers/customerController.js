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

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });




const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
    }
});

// Global "from" so you don't repeat it everywhere
const DEFAULT_FROM = {
    name: 'Suyambu Stores',
    address: process.env.EMAIL_FROM || 'no-reply@suyambufoods.com'  // ← This is correct
};

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
        o.id AS order_id, o.customer_id, o.order_date, o.total_amount, o.tracking_number, o.invoice_number, o.delivery_fee,
        o.order_tax_amount, o.order_tax_rate,
        c.full_name as customer_name, c.email as customer_email, c.phone as customer_mobile,
        CONCAT(a.street, ', ', c.name, ', ', s.name, ' ', a.zip_code, ', ', a.country) as delivery_address,
        pm.method as payment_method, os.status as order_status, om.method as order_method
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN addresses a ON o.address_id = a.id
      JOIN cities c ON a.city_id = c.id
      JOIN states s ON a.state_id = s.id
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

    const delivery_fee = parseFloat(order.delivery_fee || 0);
    const tax = parseFloat(order.order_tax_amount || 0);
    const subtotal = parseFloat(order.total_amount) - delivery_fee - tax;
    const shipping = delivery_fee;
    const totalAmount = parseFloat(order.total_amount);

    const templateData = {
      baseUrl: process.env.BASE_URL || 'https://suyambuoils.com/api',
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
            // from: { name: 'Suyambu Stores', address: process.env.EMAIL_USER },
            from: DEFAULT_FROM,
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



exports.sendRegistrationOtp = async (req, res) => {
    const { email } = req.body;
    if (!email || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required and must be 100 characters or less' });
    }
    try {
        // Check if email already exists (to prevent dummy registrations on existing users)
        const [existingUser] = await db.query('SELECT id FROM customers WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already registered. Please login instead.' });
        }

        // Delete any existing unused OTPs for this email
        await db.query('DELETE FROM registration_email_verification_otp WHERE email = ? AND used = 0 AND expires_at > NOW()', [email]);

        // Generate 8-digit OTP
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();

        // Store OTP with 5-minute expiry
        const [result] = await db.query(
            'INSERT INTO registration_email_verification_otp (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
            [email, otp]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }

        // Send email
        const mailOptions = {
            from: { name: 'Suyambu Stores', address: process.env.EMAIL_USER },
            to: email,
            subject: 'Verify Your Email - Suyambu Stores Registration',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification for Registration</h2>
                    <p>Thank you for registering with Suyambu Stores!</p>
                    <p>Your verification code is: <strong style="font-size: 24px; color: #B6895B;">${otp}</strong></p>
                    <p>This code is valid for 5 minutes. Enter it to complete your registration.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">Suyambu Stores &bull; ${new Date().toLocaleString('en-IN')}</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Registration OTP sent to ${email}`);

        res.status(200).json({ message: 'OTP sent successfully. Please check your inbox (and spam folder).' });
    } catch (error) {
        console.error('Send registration OTP error:', error);
        if (error.code === 'EAUTH' || error.responseCode === 535 || error.message.includes('auth')) {
            return res.status(500).json({ message: 'Network issue: Failed to send email. Please check your connection and try again.' });
        }
        res.status(500).json({ message: 'Server error: Failed to send OTP. Please try again.' });
    }
};

// Verify Registration OTP
exports.verifyRegistrationOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!otp || otp.length !== 8 || !/^\d{8}$/.test(otp)) {
        return res.status(400).json({ message: 'Valid 8-digit OTP is required' });
    }
    try {
        // Find and verify OTP
        const [otpRows] = await db.query(
            'SELECT id FROM registration_email_verification_otp WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW()',
            [email, otp]
        );

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
        }

        const otpId = otpRows[0].id;

        // Mark as used
        await db.query('UPDATE registration_email_verification_otp SET used = 1 WHERE id = ?', [otpId]);

        // Generate short-lived verification token (10 min expiry)
        const verificationToken = jwt.sign(
            { email: email, verified: true },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '10m' }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully. You can now complete registration.', 
            verificationToken 
        });
    } catch (error) {
        console.error('Verify registration OTP error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};



exports.register = async (req, res) => {
  const { username, password, full_name, phone, email, verificationToken } = req.body;

  // === Basic validation ===
  if (!username || username.length > 50)
    return res.status(400).json({ message: "Username is required (max 50 chars)" });

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: "Valid email is required" });

  if (!password || password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  if (!full_name || full_name.length > 100)
    return res.status(400).json({ message: "Full name is required (max 100 chars)" });

  if (!phone || !/^\+?[\d\s-]{7,20}$/.test(phone))
    return res.status(400).json({ message: "Valid phone number is required" });

  if (!verificationToken)
    return res.status(400).json({ message: "Email verification required. Please complete OTP step." });

  try {
    // === Verify JWT token from OTP step ===
    let decoded;
    try {
      decoded = jwt.verify(verificationToken, process.env.JWT_SECRET || "your_jwt_secret");
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired verification token. Please start again." });
    }

    // Token must contain email and be marked as verified
    if (!decoded.email || decoded.email.toLowerCase() !== email.toLowerCase() || !decoded.verified) {
      return res.status(401).json({ message: "Email not verified. Please verify OTP first." });
    }

    // === Check duplicate email or username ===
    const [existing] = await db.query(
      "SELECT id FROM customers WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email or username already taken" });
    }

    // === Hash password & register user ===
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO customers 
       (username, email, password, full_name, phone, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [username, email, hashedPassword, full_name, phone]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to create account. Try again." });
    }

    // Optional: Clean old OTPs
    await db.query("DELETE FROM registration_email_verification_otp WHERE email = ?", [email]);

    return res.status(201).json({
      message: "Account created successfully! Welcome to Suyambu Stores!",
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
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
        const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
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
            'SELECT ci.*, pv.id AS variant_id, pv.product_id, p.name AS product_name, p.thumbnail_url, um.uom_name AS uom_name, pv.variant_quantity, pv.price, ss.status AS stock_status, p.tax_percentage FROM cart_items ci JOIN product_variants pv ON ci.product_variant_id = pv.id JOIN products p ON pv.product_id = p.id LEFT JOIN uom_master um ON pv.uom_id = um.id LEFT JOIN stock_statuses ss ON p.stock_status_id = ss.id WHERE ci.customer_id = ?',
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
        // Fetch the total count of wished products
        const [countRows] = await db.query(
            'SELECT COUNT(*) as totalWished FROM wishlist WHERE customer_id = ?',
            [customerId]
        );
        const totalWished = countRows[0].totalWished;

        // Fetch the wishlist data
        const [rows] = await db.query(`
            SELECT 
                w.id, 
                w.customer_id, 
                w.product_id, 
                w.is_liked, 
                w.added_at, 
                w.updated_at,
                p.name, 
                p.description, 
                p.thumbnail_url,
                c.name AS category_name,
                s.status AS stock_status_name
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            JOIN stock_statuses s ON p.stock_status_id = s.id
            WHERE w.customer_id = ?
        `, [customerId]);

        // Response with total count first, followed by data
        res.status(200).json({
            totalWished,
            wishlist: rows
        });
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



exports.getStates = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, code FROM states ORDER BY name');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.getCities = async (req, res) => {
  const { stateId } = req.query;
  if (!stateId || isNaN(stateId)) {
    return res.status(400).json({ message: 'stateId parameter is required and must be a number' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, name FROM cities WHERE state_id = ? ORDER BY name',
      [parseInt(stateId)]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.getAddresses = async (req, res) => {
  const customerId = getDecodedCustomerId(req);
  if (!customerId || isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID' });
  try {
    if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });
    const [rows] = await db.query(`
      SELECT a.id, a.street, a.zip_code, a.country, a.is_default, a.created_at, a.updated_at,
             c.name as city, s.name as state
      FROM addresses a
      JOIN states s ON a.state_id = s.id
      JOIN cities c ON a.city_id = c.id
      WHERE a.customer_id = ?
      ORDER BY a.is_default DESC, a.created_at DESC
    `, [customerId]);
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

  // Validation
  if (!street || street.length > 255) return res.status(400).json({ message: 'Street is required and must be 255 characters or less' });
  if (!city || city.length > 100) return res.status(400).json({ message: 'City is required and must be 100 characters or less' });
  if (!state || state.length > 100) return res.status(400).json({ message: 'State is required and must be 100 characters or less' });
  if (!zip_code || zip_code.length > 20) return res.status(400).json({ message: 'Zip code is required and must be 20 characters or less' });
  if (!country || country.length > 100) return res.status(400).json({ message: 'Country is required and must be 100 characters or less' });

  try {
    if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });

    // Resolve state_id and city_id
    const [stateRows] = await db.query('SELECT id FROM states WHERE name = ? AND name LIKE ?', [state, `${state}%`]); // Fuzzy match if needed, but exact for now
    if (stateRows.length === 0) return res.status(404).json({ message: `State '${state}' not found` });
    const stateId = stateRows[0].id;

    const [cityRows] = await db.query('SELECT id FROM cities WHERE name = ? AND state_id = ? AND name LIKE ?', [city, stateId, `${city}%`]);
    if (cityRows.length === 0) return res.status(404).json({ message: `City '${city}' not found in state '${state}'` });
    const cityId = cityRows[0].id;

    if (is_default === 1 || is_default === true) {
      await db.query('UPDATE addresses SET is_default = 0 WHERE customer_id = ?', [customerId]);
    }

    const [result] = await db.query(
      'INSERT INTO addresses (customer_id, street, city_id, state_id, zip_code, country, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [customerId, street, cityId, stateId, zip_code, country, is_default ? 1 : 0]
    );

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

  // Validation
  if (!street || street.length > 255) return res.status(400).json({ message: 'Street is required and must be 255 characters or less' });
  if (!city || city.length > 100) return res.status(400).json({ message: 'City is required and must be 100 characters or less' });
  if (!state || state.length > 100) return res.status(400).json({ message: 'State is required and must be 100 characters or less' });
  if (!zip_code || zip_code.length > 20) return res.status(400).json({ message: 'Zip code is required and must be 20 characters or less' });
  if (!country || country.length > 100) return res.status(400).json({ message: 'Country is required and must be 100 characters or less' });

  try {
    if (!(await checkCustomerExists(customerId))) return res.status(404).json({ message: 'Customer not found' });

    const [existing] = await db.query('SELECT * FROM addresses WHERE id = ? AND customer_id = ?', [id, customerId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Address not found' });

    // Resolve state_id and city_id (only if changed; but for simplicity, always resolve)
    const [stateRows] = await db.query('SELECT id FROM states WHERE name = ? AND name LIKE ?', [state, `${state}%`]);
    if (stateRows.length === 0) return res.status(404).json({ message: `State '${state}' not found` });
    const stateId = stateRows[0].id;

    const [cityRows] = await db.query('SELECT id FROM cities WHERE name = ? AND state_id = ? AND name LIKE ?', [city, stateId, `${city}%`]);
    if (cityRows.length === 0) return res.status(404).json({ message: `City '${city}' not found in state '${state}'` });
    const cityId = cityRows[0].id;

    if (is_default === 1 || is_default === true) {
      await db.query('UPDATE addresses SET is_default = 0 WHERE customer_id = ? AND id != ?', [customerId, id]);
    }

    const [result] = await db.query(
      'UPDATE addresses SET street = ?, city_id = ?, state_id = ?, zip_code = ?, country = ?, is_default = ?, updated_at = NOW() WHERE id = ? AND customer_id = ?',
      [street, cityId, stateId, zip_code, country, is_default ? 1 : 0, id, customerId]
    );

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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { customerId: customerIdStr, addressId, paymentMethodId, orderMethod, items, totalAmount, paymentDetails } = req.body;
    const customerId = parseInt(customerIdStr, 10);
    if (isNaN(customerId)) return res.status(400).json({ message: 'Invalid customer ID' });
    if (decoded.id !== customerId) return res.status(401).json({ message: 'Unauthorized: Token does not match customer ID' });
    if (!addressId || !paymentMethodId || !orderMethod || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const orderMethodId = orderMethod === 'buy_now' ? 1 : orderMethod === 'cart' ? 2 : null;
    if (!orderMethodId) return res.status(400).json({ message: 'Invalid order method' });

    // Compute subtotal, tax, and validate items
    let calculatedSubtotal = 0;
    let totalTax = 0;
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
        c.description AS product_category_description,
        p.tax_percentage
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
        product_additional_images: row.product_additional_images,
        product_category_id: row.product_category_id,
        product_category_name: row.product_category_name,
        product_category_description: row.product_category_description,
        tax_percentage: parseFloat(row.tax_percentage || 0)
      }
    }), {});
    for (const item of items) {
      if (!item.variantId || !item.quantity || isNaN(item.quantity)) {
        return res.status(400).json({ message: 'Invalid item data' });
      }
      const variantData = variantMap[item.variantId];
      if (!variantData) return res.status(400).json({ message: `Invalid variantId ${item.variantId}` });
      const qty = parseInt(item.quantity, 10);
      const price = variantData.price;
      if (qty <= 0 || !price) {
        return res.status(400).json({ message: `Invalid variantId or quantity for item with variantId ${item.variantId}` });
      }
      const subtotal = price * qty;
      const taxPerc = variantData.tax_percentage;
      const itemTax = subtotal * (taxPerc / 100);
      calculatedSubtotal += subtotal;
      totalTax += itemTax;

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

    // NEW: Compute delivery_fee and shipment_details (same logic as calculateDelivery)
    const calcItems = items.map(item => ({
      variantId: parseInt(item.variantId),
      quantity: parseInt(item.quantity)
    }));
    const variantIdsForDelivery = calcItems.map(item => item.variantId);
    const [variantRowsForDelivery] = await db.query(
      'SELECT id, variant_quantity, uom_id FROM product_variants WHERE id IN (?)',
      [variantIdsForDelivery]
    );
    const variantMapForDelivery = variantRowsForDelivery.reduce((map, row) => {
      map[row.id] = {
        variant_quantity: parseFloat(row.variant_quantity),
        uom_id: parseInt(row.uom_id)
      };
      return map;
    }, {});

    const uomQuantities = {};
    let totalQuantity = 0;
    for (const item of calcItems) {
      const variantData = variantMapForDelivery[item.variantId];
      if (!variantData) continue;
      const rawQty = variantData.variant_quantity * item.quantity;
      const uomId = variantData.uom_id;

      if (!uomQuantities[uomId]) uomQuantities[uomId] = 0;
      uomQuantities[uomId] += rawQty;

      let kgQty = rawQty;
      if (uomId === 2) { // Gram to KG
        kgQty = rawQty / 1000;
      }
      totalQuantity += kgQty;
    }
    totalQuantity = parseFloat(totalQuantity.toFixed(2));

    const [addressRows] = await db.query(
      'SELECT state_id FROM addresses WHERE id = ? AND customer_id = ?',
      [addressId, customerId]
    );
    if (addressRows.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    const stateId = addressRows[0].state_id;

    const [chargeRows] = await db.query(
      'SELECT delivery_charge FROM delivery_charge_master WHERE state_id = ? AND ? BETWEEN min_quantity AND max_quantity',
      [stateId, totalQuantity]
    );
    const delivery_fee = chargeRows.length > 0 ? parseFloat(chargeRows[0].delivery_charge) : 0;

    const shipment_details = {
      uom_quantities: uomQuantities,
      total_quantity: totalQuantity
    };

    // Calculate overall effective tax rate (weighted average)
    const overall_tax_rate = calculatedSubtotal > 0 ? (totalTax / calculatedSubtotal * 100) : 0;

    // Use backend-calculated total for security
    const calculatedTotal = calculatedSubtotal + totalTax + delivery_fee;

    // Validate against frontend total (allow minor float diff)
    if (Math.abs(parseFloat(totalAmount) - calculatedTotal) > 0.01) {
      return res.status(400).json({ message: 'Total amount mismatch. Please refresh and try again.' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const razorpayPaymentId = paymentDetails ? paymentDetails.razorpay_payment_id : null;
      const [orderResult] = await connection.query(
        'INSERT INTO orders (customer_id, address_id, order_date, order_status_id, total_amount, payment_method_id, tracking_number, updated_at, order_method_id, invoice_number, razorpay_payment_id, delivery_fee, order_tax_rate, order_tax_amount, shipment_details) VALUES (?, ?, NOW(), 1, ?, ?, NULL, NOW(), ?, NULL, ?, ?, ?, ?, ?)',
        [customerId, addressId, calculatedTotal, paymentMethodId, orderMethodId, razorpayPaymentId, delivery_fee, overall_tax_rate, totalTax, JSON.stringify(shipment_details)]
      );
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
        const ordersQuery = `SELECT o.id AS order_id, o.customer_id, o.address_id, o.order_date, o.order_status_id, o.total_amount, o.payment_method_id, o.tracking_number, o.updated_at, o.order_method_id, o.invoice_number, o.order_tax_rate, o.order_tax_amount, a.street, c.name AS city, s.name AS state, a.zip_code, a.country, os.status AS order_status, pm.method AS payment_method, om.method AS order_method FROM orders o JOIN addresses a ON o.address_id = a.id JOIN cities c ON a.city_id = c.id JOIN states s ON a.state_id = s.id JOIN order_status os ON o.order_status_id = os.id JOIN payment_methods pm ON o.payment_method_id = pm.id JOIN order_methods om ON o.order_method_id = om.id WHERE o.customer_id = ? ORDER BY o.order_date DESC`;
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
            // Ensure tax fields are floats for frontend
            order.order_tax_rate = parseFloat(order.order_tax_rate || 0);
            order.order_tax_amount = parseFloat(order.order_tax_amount || 0);
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








// Send contact form email - Updated with WhatsApp Number
exports.sendContactEmail = async (req, res) => {
    const { name, email, whatsapp, message } = req.body;

    // Validation
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
            // from: `"${name}" <${email}>`,

            from: DEFAULT_FROM,
replyTo: email,
            replyTo: email,
            to: process.env.EMAIL_USER, // Your email: suyambufoodstores@gmail.com
            subject: `Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #3 | D2F23; border-bottom: 2px solid #B6895B; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <p><strong style="color: #333;">Name:</strong> <span style="color: #555;">${name}</span></p>
                        <p><strong style="color: #333;">Email:</strong> <span style="color: #555;">${email}</span></p>
                        
                        ${whatsapp ? `
                        <p><strong style="color: #333;">WhatsApp Number:</strong> 
                            <span style="color: #25D366; font-weight: bold; background: #ECF7E8; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-top: 5px;">
                                ${whatsapp}
                            </span>
                        </p>` : ''}
                        
                        <p><strong style="color: #333; margin-top: 20px;">Message:</strong></p>
                        <div style="background: #f5f5f5; padding: 18px; border-left: 5px solid #B6895B; border-radius: 6px; margin-top: 10px; font-size: 15px; line-height: 1.6;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
                    
                    <p style="color: #888; font-size: 12px; text-align: center;">
                        Submitted on ${new Date().toLocaleString('en-IN', { 
                            dateStyle: 'medium', 
                            timeStyle: 'medium' 
                        })}
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Contact email sent successfully: ${info.messageId}`);

        res.status(200).json({ 
            message: 'Thank you! Your message has been sent successfully. We will contact you soon.' 
        });
    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
};


exports.calculateDelivery = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { customerId: customerIdStr, addressId, items } = req.body;
    const customerId = parseInt(customerIdStr, 10);
    if (isNaN(customerId) || decoded.id !== customerId) {
      return res.status(401).json({ message: 'Unauthorized: Invalid customer ID or token mismatch' });
    }
    if (!addressId || isNaN(addressId)) {
      return res.status(400).json({ message: 'Valid addressId is required' });
    }

    let calcItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      // Use provided items (for buy_now)
      calcItems = items.map(item => ({
        variantId: parseInt(item.variantId),
        quantity: parseInt(item.quantity)
      })).filter(item => !isNaN(item.variantId) && !isNaN(item.quantity) && item.quantity > 0);
      if (calcItems.length === 0) {
        return res.json({ delivery_fee: 0, shipment_details: { uom_quantities: {}, total_quantity: 0 } });
      }
    } else {
      // Fetch cart items (for cart flow)
      const [cartRows] = await db.query(
        'SELECT product_variant_id AS variantId, quantity FROM cart_items WHERE customer_id = ?',
        [customerId]
      );
      calcItems = cartRows.map(row => ({
        variantId: row.variantId,
        quantity: row.quantity
      })).filter(item => item.quantity > 0);
      if (calcItems.length === 0) {
        return res.json({ delivery_fee: 0, shipment_details: { uom_quantities: {}, total_quantity: 0 } });
      }
    }

    // Fetch variant details
    const variantIds = calcItems.map(item => item.variantId);
    const [variantRows] = await db.query(
      'SELECT id, variant_quantity, uom_id FROM product_variants WHERE id IN (?)',
      [variantIds]
    );
    const variantMap = variantRows.reduce((map, row) => {
      map[row.id] = {
        variant_quantity: parseFloat(row.variant_quantity),
        uom_id: parseInt(row.uom_id)
      };
      return map;
    }, {});

    // Compute uom_quantities (raw totals per uom) and total_quantity (in KG equivalent)
    const uomQuantities = {};
    let totalQuantity = 0;
    for (const item of calcItems) {
      const variantData = variantMap[item.variantId];
      if (!variantData) continue;
      const rawQty = variantData.variant_quantity * item.quantity;
      const uomId = variantData.uom_id;

      // Accumulate raw quantity per uom
      if (!uomQuantities[uomId]) uomQuantities[uomId] = 0;
      uomQuantities[uomId] += rawQty;

      // Convert to KG equivalent for total
      let kgQty = rawQty;
      if (uomId === 2) { // Gram to KG
        kgQty = rawQty / 1000;
      }
      // For uom_id 1 (KG) and 3 (Litre), treat as KG equivalent
      totalQuantity += kgQty;
    }
    totalQuantity = parseFloat(totalQuantity.toFixed(2));

    // Fetch state_id from address
    const [addressRows] = await db.query(
      'SELECT state_id FROM addresses WHERE id = ? AND customer_id = ?',
      [addressId, customerId]
    );
    if (addressRows.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    const stateId = addressRows[0].state_id;

    // Lookup delivery charge
    const [chargeRows] = await db.query(
      'SELECT delivery_charge FROM delivery_charge_master WHERE state_id = ? AND ? BETWEEN min_quantity AND max_quantity',
      [stateId, totalQuantity]
    );
    const delivery_fee = chargeRows.length > 0 ? parseFloat(chargeRows[0].delivery_charge) : 0;

    const shipment_details = {
      uom_quantities: uomQuantities,
      total_quantity: totalQuantity
    };

    res.status(200).json({
      delivery_fee: parseFloat(delivery_fee.toFixed(2)),
      shipment_details
    });
  } catch (error) {
    console.error('Calculate delivery error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};












exports.getCustomerProduct = async (req, res) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
  try {
    // Get product details including tax_percentage
    const [productRows] = await db.query(`
      SELECT 
        p.*,
        c.name as category_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [idNum]);

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const data = productRows[0];

    // Get variants
    const [variantRows] = await db.query(`
      SELECT 
        pv.*,
        um.uom_name
      FROM product_variants pv 
      LEFT JOIN uom_master um ON pv.uom_id = um.id
      WHERE pv.product_id = ?
    `, [idNum]);

    const variants = variantRows.map((v) => ({
      ...v,
      id: v.id,
      uom_id: v.uom_id != null ? String(v.uom_id) : undefined,
      price: v.price != null ? Number(v.price) : undefined,
      variant_quantity: v.quantity != null ? v.quantity : v.variant_quantity || "",
      uom_name: v.uom_name || v.uom_name,
    }));

    const normalized = {
      ...data,
      price: data?.price != null ? Number(data.price) : (variants[0]?.price ?? 0),
      thumbnail_url: data.thumbnail_url,
      additional_images: Array.isArray(data.additional_images)
        ? data.additional_images
        : data.additional_images ? JSON.parse(data.additional_images || '[]') : [],
      variants,
      tax_percentage: parseFloat(data.tax_percentage || 0),
    };

    res.json(normalized);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};






// Updated exports for customerController.js (replace the existing forgotPassword and resetPassword functions)

// Forgot Password - Send reset code
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    try {
        // Check if email exists
        const [existing] = await db.query('SELECT id, full_name FROM customers WHERE email = ?', [email]);
        if (existing.length === 0) {
            return res.status(400).json({ message: 'Email not found.' }); // Reveal email not found for user feedback
        }

        // Generate 8-digit passkey
        const passkey = Math.floor(10000000 + Math.random() * 90000000).toString();

        // Delete any existing unused codes for this email
        await db.query('DELETE FROM password_reset_codes WHERE email = ? AND used = 0 AND expires_at > NOW()', [email]);

        // Insert new code
        const [result] = await db.query(
            'INSERT INTO password_reset_codes (email, passkey, created_at, expires_at, used) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)',
            [email, passkey]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to generate reset code' });
        }

        // Send email
        const customerName = existing[0].full_name;
        const mailOptions = {
            // from: { name: 'Suyambu Stores', address: process.env.EMAIL_USER },

            from: DEFAULT_FROM,
            to: email,
            subject: 'Password Reset Code - Suyambu Stores',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${customerName},</p>
                    <p>Your password reset code is: <strong style="font-size: 24px; color: #B6895B;">${passkey}</strong></p>
                    <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
                    <hr />
                    <p style="color: #666; font-size: 12px;">Suyambu Stores &bull; ${new Date().toLocaleString('en-IN')}</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reset code sent to ${email}`);

        res.status(200).json({ message: 'Reset code sent to your email. Please check your inbox.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, passkey, newPassword, confirmPassword } = req.body;

    // Validation for email and passkey (always required)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!passkey || passkey.length !== 8 || !/^\d{8}$/.test(passkey)) {
        return res.status(400).json({ message: 'Valid 8-digit code is required' });
    }

    // If newPassword is provided, validate it (for full reset)
    if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
        if (newPassword.length < 6 || newPassword.length > 255) {
            return res.status(400).json({ message: 'New password must be 6-255 characters' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Verify code: match on email, passkey, used=0, expires_at > NOW() (covers created_at implicitly via expiration)
        const [codeRows] = await connection.query(
            'SELECT id FROM password_reset_codes WHERE email = ? AND passkey = ? AND used = 0 AND expires_at > NOW()',
            [email, passkey]
        );

        if (codeRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Invalid or expired code. Please request a new one.' });
        }

        const codeId = codeRows[0].id;

        // If no newPassword (verification only), just confirm
        if (newPassword === undefined || newPassword === null || newPassword === '') {
            await connection.commit();
            return res.status(200).json({ message: 'Code verified successfully. Please enter your new password.' });
        }

        // Full reset: hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [updateResult] = await connection.query(
            'UPDATE customers SET password = ?, updated_at = NOW() WHERE email = ?',
            [hashedPassword, email]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({ message: 'Failed to update password' });
        }

        // Mark code as used
        await connection.query('UPDATE password_reset_codes SET used = 1 WHERE id = ?', [codeId]);

        await connection.commit();

        res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        await connection.rollback();
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    } finally {
        connection.release();
    }
};