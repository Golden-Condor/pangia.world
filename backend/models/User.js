const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'farmer'], required: true },
    farmName: { type: String }, // Only required if role === 'farmer'
    location: { type: String }  // Only required if role === 'farmer'
});

// Pre-save hook
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10); // Now uses bcryptjs
    next();
  });

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create Model
const User = mongoose.model('User', userSchema);

// Export Model
module.exports = User;