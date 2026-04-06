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
    for (let number of phoneNumbers) {
        // Ensure E.164 format (must start with +)
        if (!number.startsWith('+')) {
            number = `+${number.trim()}`;
        }
        
        try {
            console.log(`📤 Sending SMS to: ${number}...`);
            const msg = await client.messages.create({
                body: message,
                from: TWILIO_PHONE,
                to: number,
            });
            console.log(`✅ SMS Sent! SID: ${msg.sid}`);
            results.push({ number, sid: msg.sid, status: 'sent' });
        } catch (err) {
            console.error(`❌ SMS failed for ${number}:`, err.message);
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
    const message = `SOS ALERT FROM ${userName.toUpperCase()}: She may be in danger. Her location: ${mapsLink}. Please check on her now. Sent via SheSafe.`;
    return sendSMS(contacts, message);
};

/**
 * Send ride verification SMS
 */
const sendRideAlert = async (contacts, userName, rideData, lat, lng) => {
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `RIDE ALERT FROM ${userName.toUpperCase()}: Boarding ${rideData.vehicleType} ${rideData.vehicleNumber}. Driver: ${rideData.driverName || 'Not provided'}. Location: ${mapsLink}.`;
    return sendSMS(contacts, message);
};

/**
 * Send trip start notification
 */
const sendTripStartAlert = async (contacts, userName, destination, trackingId) => {
    const trackingLink = `${FRONTEND_URL}/track/${trackingId}`;
    const message = `TRIP START FROM ${userName.toUpperCase()}: Heading to ${destination}. Track live: ${trackingLink}. Will notify you upon safe arrival.`;
    return sendSMS(contacts, message);
};

/**
 * Send trip overdue alert
 */
const sendTripOverdueAlert = async (contacts, userName, destination, lat, lng) => {
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `ALERT FROM ${userName.toUpperCase()}: She has not reached ${destination} on time. Last known location: ${mapsLink}. Please check on her immediately.`;
    return sendSMS(contacts, message);
};

module.exports = {
    sendSMS,
    sendSOSAlert,
    sendRideAlert,
    sendTripStartAlert,
    sendTripOverdueAlert,
};