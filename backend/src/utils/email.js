import nodemailer from 'nodemailer';

/**
 * Lazily configures and returns the Nodemailer transporter.
 * Falls back to null if SMTP envs are incomplete.
 */
const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for 587 or other
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Stabilize TLS handshakes by tolerating minor local cert authority validation gaps
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Standard utility to send an email. Gracefully handles missing SMTP credentials
 * by logging the email template to the terminal for local testing.
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || 'noreply@karigar.in';
  const fromName = process.env.FROM_NAME || 'Karigar Marketplace';

  if (!transporter) {
    console.log('\n--- ⚠️  [SMTP SMTP_NOT_CONFIGURED: Falling back to console log] ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: \n${html.replace(/<[^>]*>/g, '').substring(0, 300)}...`);
    console.log('--------------------------------------------------------------\n');
    return { success: true, message: 'Email logged to console (SMTP not configured)' };
  }

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}: ${error.message}`);
    // Do not crash the entire server process if a user registration or password email fails
    return { success: false, error: error.message };
  }
};

/**
 * Sends email verification token link.
 */
export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2d9db; background-color: #faf8f5; border-radius: 8px; color: #3d302c;">
      <h2 style="color: #8c5b3f; border-bottom: 2px solid #8c5b3f; padding-bottom: 10px; margin-top: 0; text-align: center;">Welcome to Karigar</h2>
      <p style="font-size: 16px; line-height: 1.6;">Namaste <strong>${user.name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">Thank you for registering on Karigar — India's premier digital marketplace connecting authentic rural artisans with direct buyers.</p>
      <p style="font-size: 15px; line-height: 1.6; text-align: center; margin: 25px 0;">
        <a href="${verificationUrl}" style="background-color: #8c5b3f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </p>
      <p style="font-size: 14px; line-height: 1.6;">If the button above does not work, please copy and paste the following link into your web browser:</p>
      <p style="font-size: 13px; word-break: break-all; color: #8c5b3f; background-color: #f3eae5; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
      <p style="font-size: 12px; color: #7d6b63; margin-top: 30px; border-top: 1px dashed #e2d9db; padding-top: 15px; text-align: center;">
        This verification link will expire in 24 hours.<br>
        If you did not create an account on Karigar, please ignore this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address - Karigar',
    html,
  });
};

/**
 * Sends password reset link.
 */
export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2d9db; background-color: #faf8f5; border-radius: 8px; color: #3d302c;">
      <h2 style="color: #8c5b3f; border-bottom: 2px solid #8c5b3f; padding-bottom: 10px; margin-top: 0; text-align: center;">Reset Your Password</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">We received a request to reset the password associated with your Karigar account. Click the button below to choose a new password:</p>
      <p style="font-size: 15px; line-height: 1.6; text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #8c5b3f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </p>
      <p style="font-size: 14px; line-height: 1.6;">If the button above does not work, please copy and paste the following link into your web browser:</p>
      <p style="font-size: 13px; word-break: break-all; color: #8c5b3f; background-color: #f3eae5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
      <p style="font-size: 12px; color: #7d6b63; margin-top: 30px; border-top: 1px dashed #e2d9db; padding-top: 15px; text-align: center;">
        This reset link will expire in 30 minutes.<br>
        If you did not request a password reset, please ignore this email; your credentials remain secure.
      </p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - Karigar',
    html,
  });
};

/**
 * Sends order confirmation details to buyers.
 */
export const sendOrderConfirmation = async (order, user) => {
  const orderUrl = `${process.env.FRONTEND_URL}/dashboard/orders/${order._id}`;
  
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2d9db; font-size: 14px;">
        <strong>${item.name}</strong><br>
        <span style="color: #7d6b63; font-size: 12px;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2d9db; text-align: right; font-size: 14px;">
        ₹${item.price.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2d9db; background-color: #faf8f5; border-radius: 8px; color: #3d302c;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #8c5b3f; margin: 0; padding-bottom: 5px;">Order Confirmed!</h2>
        <span style="color: #7d6b63; font-size: 14px;">Order Number: ${order.orderNumber}</span>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">Namaste <strong>${user.name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">Thank you for shopping at Karigar. Your payment was verified, and your order has been successfully placed. Our rural artisans are already preparing your handmade treasures.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3eae5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #8c5b3f; color: #8c5b3f;">Handicraft Items</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #8c5b3f; color: #8c5b3f;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
          <tr>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #e2d9db;">Subtotal:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #e2d9db;">₹${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: right; font-size: 13px;">Shipping Charge:</td>
            <td style="padding: 10px; text-align: right; font-size: 13px;">₹${order.shippingCharge.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; text-align: right; font-size: 13px;">Estimated GST (5%):</td>
            <td style="padding: 10px; text-align: right; font-size: 13px;">₹${order.tax.toFixed(2)}</td>
          </tr>
          <tr style="font-size: 18px; color: #8c5b3f;">
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 1px solid #8c5b3f;">Total Paid:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 1px solid #8c5b3f;">₹${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p style="font-size: 15px; line-height: 1.6; text-align: center; margin: 25px 0;">
        <a href="${orderUrl}" style="background-color: #8c5b3f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Track Your Order</a>
      </p>

      <p style="font-size: 12px; color: #7d6b63; margin-top: 30px; border-top: 1px dashed #e2d9db; padding-top: 15px; text-align: center;">
        Thank you for supporting traditional Indian heritage and supporting small artisan families.
      </p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Order Confirmed - ${order.orderNumber} - Karigar`,
    html,
  });
};
