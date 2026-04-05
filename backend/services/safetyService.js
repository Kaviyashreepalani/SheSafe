const Alert = require("../models/Alert");

/**
 * Calculates a Safety Score (0-100) for a given location or route.
 * @param {Number} lat 
 * @param {Number} lng 
 * @returns {Number} - Safety Score
 */
const calculateSafetyScore = async (lat, lng) => {
    let score = 100;
    const radiusInKm = 0.5; // 500 meters

    // Find alerts within radius (Simplified distance calc for Demo)
    const alerts = await Alert.find({
        expiry: { $gt: new Date() }
    });

    alerts.forEach(alert => {
        const distance = Math.sqrt(
            Math.pow(alert.location.latitude - lat, 2) +
            Math.pow(alert.location.longitude - lng, 2)
        );

        // Very rough conversion to KM (approx 111km per degree)
        const distanceKm = distance * 111;

        if (distanceKm <= radiusInKm) {
            if (alert.type === "Harassment" || alert.type === "Suspicious Activity") {
                score -= 15;
            } else if (alert.type === "Safety Concern") {
                score -= 10;
            } else {
                score -= 5;
            }
        }
    });

    return Math.max(0, score);
};

module.exports = { calculateSafetyScore };
