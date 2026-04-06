const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send SMS to a list of phone numbers
 * @param {string[]} phoneNumbers - Array of E.164 formatted numbers
 * @param {string} message - SMS body
 */
const sendSMS = async (phoneNumbers, message) => {
    const results = [];
    for (const number of phoneNumbers) {
        try {
            const msg = await client.messages.create({
                body: message,
                from: TWILIO_PHONE,
                to: number,
            });
            results.push({ number, sid: msg.sid, status: 'sent' });
        } catch (err) {
            console.error(`SMS failed for ${number}:`, err.message);
            results.push({ number, status: 'failed', error: err.message });
        }
    }
    return results;
};

/**
 * Send SOS alert with location
 */
const sendSOSAlert = async (contacts, userName, lat, lng) => {
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `🚨 SOS ALERT from ${userName}!\n\nShe may be in danger. Her current location:\n${mapsLink}\n\nThis alert was sent via SheSafe. Location updates every 60 seconds.`;
    return sendSMS(contacts, message);
};

/**
 * Send ride verification SMS
 */
const sendRideAlert = async (contacts, userName, rideData, lat, lng) => {
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `🚗 Ride Alert from ${userName}\n\nVehicle: ${rideData.vehicleNumber}\nType: ${rideData.vehicleType}\nDriver: ${rideData.driverName || 'Not provided'}\n\nBoarding location: ${mapsLink}\nTime: ${new Date().toLocaleString()}`;
    return sendSMS(contacts, message);
};

/**
 * Send trip start notification
 */
const sendTripStartAlert = async (contacts, userName, destination, trackingId) => {
    const trackingLink = `${FRONTEND_URL}/track/${trackingId}`;
    const message = `📍 ${userName} has started a trip to ${destination}.\n\nTrack her live here (no login needed):\n${trackingLink}\n\nShe will mark herself safe upon arrival.`;
    return sendSMS(contacts, message);
};

/**
 * Send trip overdue alert
 */
const sendTripOverdueAlert = async (contacts, userName, destination, lat, lng) => {
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `⚠️ ALERT: ${userName} has not marked herself safe after reaching ${destination}.\n\nLast known location: ${mapsLink}\n\nPlease check on her immediately.`;
    return sendSMS(contacts, message);
};

module.exports = {
    sendSMS,
    sendSOSAlert,
    sendRideAlert,
    sendTripStartAlert,
    sendTripOverdueAlert,
};