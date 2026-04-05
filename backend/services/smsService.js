const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SOS SMS to a list of phone numbers
 * @param {Array} contacts - [{ name, phone }]
 * @param {Number} lat 
 * @param {Number} lng 
 * @param {String} userName 
 */
const sendSOS_SMS = async (contacts, lat, lng, userName) => {
    const locationLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const message = `🚨 EMERGENCY! ${userName} is in danger!
📍 Live Location: ${locationLink}
Please check on them immediately!`;

    const results = await Promise.all(
        contacts.map(contact => {
            return client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.phone
            }).then(msg => ({ phone: contact.phone, status: "sent", sid: msg.sid }))
              .catch(err => ({ phone: contact.phone, status: "failed", error: err.message }));
        })
    );

    return results;
};

module.exports = { sendSOS_SMS };
