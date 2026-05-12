const sendEmailHelper = require('./sendEmail');

const templates = {
  orderConfirmed: (order, user) => ({
    subject: `Order Confirmed: #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Thank you for your order, ${user.name}!</h2>
        <p>Your order <strong>#${order._id}</strong> has been confirmed.</p>
        <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
        <p>We'll notify you when it's shipped.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">VideStore Fashion</p>
      </div>
    `
  }),

  welcomeEmail: (user) => ({
    subject: `Welcome to VideStore, ${user.name?.split(' ')[0]}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
          <div style="background: #111; padding: 24px; text-align: center;">
            <h1 style="color: #C9A84C; font-size: 20px; letter-spacing: 4px; margin: 0; font-weight: 300;">VIDESTORE</h1>
          </div>
          <div style="padding: 32px 40px; text-align: center;">
            <h2 style="color: #111; font-size: 22px; font-weight: 400; margin-bottom: 12px;">Welcome, ${user.name?.split(' ')[0]}!</h2>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Your account has been created successfully.<br />
              Discover curated fashion, exclusively at VideStore.
            </p>
            <a href="${process.env.FRONTEND_URL || 'https://videstore.com'}" 
               style="display: inline-block; background: #C9A84C; color: #111; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 1px;">
              SHOP NOW
            </a>
          </div>
          <div style="padding: 16px 40px; background: #f9f9f9; text-align: center;">
            <p style="font-size: 12px; color: #999; margin: 0;">© VideStore Fashion. Stay Trendy, Always.</p>
          </div>
        </div>
      </div>
    `
  })
};

const sendEmail = async (to, template) => {
  const result = await sendEmailHelper({
    to,
    subject: template.subject,
    html: template.html
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
};

module.exports = {
  sendOrderConfirmedEmail: (order, user) => sendEmail(user.email, templates.orderConfirmed(order, user)),
  sendWelcomeEmail: (user) => sendEmail(user.email, templates.welcomeEmail(user)),
  sendEmail
};