const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        emergencyContacts: [
            {
                name: { type: String, required: true },
                phone: { type: String, required: true }
            }
        ],

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },
    {
        timestamps: true // ✅ better than manual createdAt
    }
);


// COMPARE PASSWORD (LOGIN)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// ✅ FIX FOR OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);