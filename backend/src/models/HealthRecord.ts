import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthRecord extends Document {
  patient: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  diagnosis: string;
  prescription: string;
  isExternalRecord: boolean;
  externalClinicName?: string;
  documents: {
    url: string;
    publicId: string;
    type: 'xray' | 'report' | 'prescription' | 'other';
    name: string;
  }[];
  visitDate: Date;
  nextVisit?: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    prescription: { type: String, trim: true },
    isExternalRecord: { type: Boolean, default: false },
    externalClinicName: { type: String, trim: true },
    documents: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        type: { type: String, enum: ['xray', 'report', 'prescription', 'other'], default: 'other' },
        name: { type: String },
      },
    ],
    visitDate: { type: Date, required: true, default: Date.now },
    nextVisit: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
