import mongoose, { Document, Schema } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: 'general' | 'appointment' | 'records' | 'treatment' | 'other';
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['general', 'appointment', 'records', 'treatment', 'other'],
      default: 'general',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFAQ>('FAQ', FAQSchema);