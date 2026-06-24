import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for guest users
    },
    ipAddress: {
      type: String,
      required: true
    },
    operationType: {
      type: String,
      required: true,
      enum: ['convert', 'optimize', 'debug', 'explain']
    },
    sourceLanguage: {
      type: String,
      required: true
    },
    targetLanguage: {
      type: String,
      default: ''
    },
    inputCode: {
      type: String,
      required: true
    },
    outputCode: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for history searches and listing
historySchema.index({ user: 1, createdAt: -1 });
historySchema.index({ ipAddress: 1, createdAt: -1 });

const History = mongoose.model('History', historySchema);
export default History;
export { History };
