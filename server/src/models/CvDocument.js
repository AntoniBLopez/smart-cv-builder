import mongoose from 'mongoose';

const cvDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Full CV payload from the Angular app (theme, sections, content, etc.)
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Mi CV',
    },
  },
  { timestamps: true }
);

cvDocumentSchema.index({ userId: 1, updatedAt: -1 });

export const CvDocument = mongoose.model('CvDocument', cvDocumentSchema);
