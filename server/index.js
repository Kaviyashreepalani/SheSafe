import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Twilio Client Setup (Values from .env or placeholder for dev)
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(accountSid, authToken);
}

// SOS Endpoint
app.post('/api/sos', async (req, res) => {
  const { contacts, location, message } = req.body;
  const timestamp = new Date().toISOString();

  console.log(`[SOS TRIGGERED] at ${timestamp}`, { location, contacts });

  const results = [];

  for (const contact of contacts) {
    const smsBody = `${message}\nMy Location: https://www.google.com/maps?q=${location.lat},${location.lng}\nSent at: ${timestamp}`;
    
    try {
      if (client) {
        await client.messages.create({
          body: smsBody,
          from: twilioNumber,
          to: contact.phone
        });
        results.push({ phone: contact.phone, status: 'sent' });
      } else {
        console.log(`[SIMULATED SMS] to ${contact.phone}: ${smsBody}`);
        results.push({ phone: contact.phone, status: 'simulated' });
      }
    } catch (error) {
      console.error(`Error sending SMS to ${contact.phone}:`, error);
      results.push({ phone: contact.phone, status: 'failed', error: error.message });
    }
  }

  res.json({ success: true, results, timestamp });
});

app.get('/health', (req, res) => res.send('SheSafe Backend Running'));

app.listen(PORT, () => {
  console.log(`SheSafe Backend active on port ${PORT}`);
});
