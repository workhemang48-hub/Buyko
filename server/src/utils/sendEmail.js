import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  family: 4, // force IPv4 — Render's network can't route Gmail's IPv6 address
});

export const sendOrderConfirmationEmail = async (order, userEmail) => {
  const paymentLine =
    order.paymentStatus === 'cod' ? 'Cash on Delivery' : 'Paid online';

  const itemsTextList = order.items
    .map((item) => `- ${item.name} (Size: ${item.size}, Qty: ${item.quantity}) — Rs.${item.price}`)
    .join('\n');

  const itemsHtmlRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #e5e5e5; font-size: 14px;">
            ${item.name}<br/>
            <span style="color: #9a9a9a; font-size: 12px;">Size: ${item.size} &middot; Qty: ${item.quantity}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #e5e5e5; font-size: 14px; text-align: right;">
            &#8377;${item.price}
          </td>
        </tr>`
    )
    .join('');

  const textBody = `Thanks for your order!

Order ID: ${order._id}

Items:
${itemsTextList}

Total: Rs.${order.total.toFixed(2)}
Payment: ${paymentLine}

We'll notify you when your order ships.`;

  const htmlBody = `
  <div style="padding: 32px 16px; font-family: Poppins, Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">

      <div style="background: linear-gradient(90deg, #fb923c, #fb7185); padding: 24px 28px;">
        <span style="font-size: 22px; font-weight: 600; color: #ffffff; font-style: italic;">Buyko</span>
      </div>

      <div style="padding: 28px;">
        <h1 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Order confirmed</h1>
        <p style="color: #9a9a9a; font-size: 13px; margin: 0 0 24px;">Order ID: ${order._id}</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          ${itemsHtmlRows}
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <tr>
            <td style="padding: 6px 0; color: #9a9a9a; font-size: 13px;">Subtotal</td>
            <td style="padding: 6px 0; color: #9a9a9a; font-size: 13px; text-align: right;">&#8377;${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9a9a9a; font-size: 13px;">GST</td>
            <td style="padding: 6px 0; color: #9a9a9a; font-size: 13px; text-align: right;">&#8377;${order.gst.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9a9a9a; font-size: 13px;">Delivery</td>
            <td style="padding: 6px 0; color: #9a9a9a; font-size: 13px; text-align: right;">${order.deliveryCharge === 0 ? 'Free' : `&#8377;${order.deliveryCharge.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0 0; color: #ffffff; font-size: 15px; font-weight: 600; border-top: 1px solid #2a2a2a;">Total</td>
            <td style="padding: 10px 0 0; color: #ffffff; font-size: 15px; font-weight: 600; border-top: 1px solid #2a2a2a; text-align: right;">&#8377;${order.total.toFixed(2)}</td>
          </tr>
        </table>

        <p style="color: #fb923c; font-size: 13px; margin: 20px 0 0;">${paymentLine}</p>
      </div>

      <div style="padding: 20px 28px; border-top: 1px solid #262626;">
        <p style="color: #6b6b6b; font-size: 12px; margin: 0;">We'll notify you when your order ships.</p>
      </div>

    </div>
  </div>`;

  const mailOptions = {
    from: `"Buyko" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Confirmed — #${order._id}`,
    text: textBody,
    html: htmlBody,
  };

await transporter.sendMail(mailOptions);
};

export const sendOrderStatusEmail = async (order, userEmail, newStatus) => {
  const statusContent = {
    shipped: {
      subject: 'Your order has shipped',
      heading: 'Your order is on its way',
      message: "Good news — your order has shipped and is on its way to you.",
    },
    delivered: {
      subject: 'Your order has been delivered',
      heading: 'Order delivered',
      message: 'Your order has been marked as delivered. We hope you love it!',
    },
    cancelled: {
      subject: 'Your order has been cancelled',
      heading: 'Order cancelled',
      message:
        order.paymentStatus === 'refunded'
          ? `Your order has been cancelled and ₹${order.total.toFixed(2)} has been refunded to your original payment method.`
          : 'Your order has been cancelled as requested.',
    },
    refunded: {
      subject: 'Your refund has been processed',
      heading: 'Refund processed',
      message: `₹${order.total.toFixed(2)} has been refunded to your original payment method. It may take a few business days to reflect.`,
    },
  };

  const content = statusContent[newStatus];
  if (!content) return;

  const htmlBody = `
  <div style="padding: 32px 16px; font-family: Poppins, Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">

      <div style="background: linear-gradient(90deg, #fb923c, #fb7185); padding: 24px 28px;">
        <span style="font-size: 22px; font-weight: 600; color: #ffffff; font-style: italic;">Buyko</span>
      </div>

      <div style="padding: 28px;">
        <h1 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 8px;">${content.heading}</h1>
        <p style="color: #9a9a9a; font-size: 13px; margin: 0 0 20px;">Order ID: ${order._id}</p>
        <p style="color: #e5e5e5; font-size: 14px; margin: 0;">${content.message}</p>
      </div>

      <div style="padding: 20px 28px; border-top: 1px solid #262626;">
        <p style="color: #6b6b6b; font-size: 12px; margin: 0;">View your order anytime from your account's Order History.</p>
      </div>

    </div>
  </div>`;

  const mailOptions = {
    from: `"Buyko" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `${content.subject} — #${order._id}`,
    text: `${content.heading}\n\nOrder ID: ${order._id}\n\n${content.message}`,
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const htmlBody = `
  <div style="padding: 32px 16px; font-family: Poppins, Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">

      <div style="background: linear-gradient(90deg, #fb923c, #fb7185); padding: 24px 28px;">
        <span style="font-size: 22px; font-weight: 600; color: #ffffff; font-style: italic;">Buyko</span>
      </div>

      <div style="padding: 28px;">
        <h1 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 8px;">Reset your password</h1>
        <p style="color: #9a9a9a; font-size: 13px; margin: 0 0 24px;">Hi ${user.name}, we received a request to reset your password. This link expires in 1 hour.</p>

        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #fb923c, #fb7185); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
          Reset Password
        </a>

        <p style="color: #6b6b6b; font-size: 12px; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
      </div>

    </div>
  </div>`;

  const mailOptions = {
    from: `"Buyko" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Reset your Buyko password',
    text: `Hi ${user.name},\n\nWe received a request to reset your password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
};
