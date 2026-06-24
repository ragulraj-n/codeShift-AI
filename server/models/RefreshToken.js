import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL Index: Document auto-expires after this date
    },
    fingerprint: {
      type: String,
      required: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RefreshToken',
      default: null
    },
    revoked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Method to verify if a token is active and valid
refreshTokenSchema.methods.isValid = function () {
  const isExpired = new Date() > this.expiresAt;
  return !this.isUsed && !this.revoked && !isExpired;
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
export { RefreshToken };
