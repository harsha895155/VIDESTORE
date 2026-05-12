require('dotenv').config();
const { sendRawSMS } = require('./utils/smsService');

async function test() {
  console.log("Testing SMS with Fast2SMS...");
  // Using a valid-looking 10-digit dummy number
  const result = await sendRawSMS('9989100302', 'Test SMS from VideStore - your SMS notifications are working!');
  console.log("Result:", result);
}

test();
