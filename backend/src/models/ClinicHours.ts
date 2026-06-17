import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot {
  start: string;
  end: string;
}

export interface IClinicHours extends Document {
  setBy: mongoose.Types.ObjectId;
  slots: ITimeSlot[];
  slotDuration: number;
  updatedAt: Date;
}

const ClinicHoursSchema = new Schema<IClinicHours>(
  {
    setBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slots: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
    slotDuration: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model<IClinicHours>('ClinicHours', ClinicHoursSchema);
