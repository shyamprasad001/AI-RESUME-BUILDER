import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document automatically deletes after 10 minutes (600 seconds)
  }
});

// We can add an index on email to quickly query OTPs for a user
otpSchema.index({ email: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
