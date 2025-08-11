import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, maxlength: 120 },
  description: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['open', 'reviewed'], default: 'open' },
}, { timestamps: true });

reportSchema.index({ reporterId: 1, targetUserId: 1, createdAt: 1 });

export default mongoose.model('Report', reportSchema);
