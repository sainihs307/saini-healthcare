import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'doctor' | 'staff' | 'patient';
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['doctor', 'staff', 'patient'], required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);