const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOrderToAVL = async (order) => {
  if (!order) return console.error('❌ No order data provided to send to AVL');

  const {
    billing = {},
    guestEmail,
    items = [],
    totalPrice,
    createdAt,
    _id
  } = order;

  // Debug: inspect billing and items before sending email
  console.log('📦 ORDER BILLING DEBUG:', JSON.stringify(billing, null, 2));
  console.log('🛒 ORDER ITEMS DEBUG:', JSON.stringify(items, null, 2));

  // Use explicit billing fields from order.billing
  const fullName = order.billing?.fullName || 'N/A';
  const phoneNumber = order.billing?.phoneNumber || 'N/A';
  const address = order.billing?.address || 'N/A';
  const city = order.billing?.city || '';
  const postalCode = order.billing?.postalCode || '';
  const country = order.billing?.country || '';
  const email = order.billing?.email || guestEmail || 'N/A';

  const productLines = items.map(item => `
    <li>${item.quantity} × ${item.productName || item.name || item.productId || 'Unnamed Product'} — $${item.price}</li>
  `).join('');

  const emailBody = `
    <h2>New Pangia Order Received</h2>
    <p><strong>Order ID:</strong> ${_id}</p>
    <p><strong>Customer:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phoneNumber}</p>
    <p><strong>Address:</strong><br>
    ${address}<br>
    ${city}, ${postalCode}<br>
    ${country}</p>
    <p><strong>Items:</strong></p>
    <ul>${productLines}</ul>
    <p><strong>Total Paid:</strong> $${totalPrice}</p>
    <p><strong>Order Time:</strong> ${new Date(createdAt).toLocaleString()}</p>
    <p><em>Please prepare this order for delivery.</em></p>
  `;

  const msg = {
    to: 'pangia.test@gmail.com',
    from: process.env.FROM_EMAIL,
    subject: `New Pangia Order: ${_id}`,
    html: emailBody
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Order sent to AVL: ${_id}`);
  } catch (error) {
    console.error(`❌ Failed to send order to AVL:`, error.response?.body || error.message);
  }
};

module.exports = sendOrderToAVL;