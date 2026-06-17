import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  reason: string;
  isFlexible: boolean;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  cancellationReason?: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    isFlexible: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
    notes: { type: String, trim: true },
    cancellationReason: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
