import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true 
    },
  targetUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  targetPostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    default: null 
  }, // opcional si el reporte es sobre un post concreto
  reason: { 
    type: String, 
    required: true, 
    maxlength: 120 
  },
  description: { 
    type: String, 
    maxlength: 1000 
  },
  status: { 
    type: String, 
    enum: ['open', 'reviewed'], 
    default: 'open' 
  },
  adminResponse: {
    message: { 
      type: String, 
      maxlength: 1000 
    },
    adminId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    respondedAt: { 
      type: Date 
    }
  }
}, { timestamps: true });

reportSchema.index({ reporterId: 1, targetUserId: 1, createdAt: 1 });

export default mongoose.model('Report', reportSchema);
