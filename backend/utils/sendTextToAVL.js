require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTextToAVL(order) {
    const { fullName, phoneNumber, address, city, postalCode, country, email } = order.billing;
    const items = order.items
      .map(item => `    ${item.quantity} × ${item.productName} — $${item.price}`)
      .join("\n");

    const messageBody = `
New Pangia Order Received

Order ID: ${order._id}

Customer: ${fullName}
Email: ${email}
Phone: ${phoneNumber}

Address:
${address}
${city}, ${postalCode}
${country}

Items:
${items}

Total Paid: $${order.totalPrice}
Order Time: ${new Date(order.createdAt).toLocaleString()}

Please prepare this order for delivery.
`;

    await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.AVL_PHONE_NUMBER
    });

    console.log("✅ Text sent to AVL");
}

module.exports = sendTextToAVL;