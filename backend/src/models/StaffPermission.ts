import mongoose, { Document, Schema } from 'mongoose';

export interface IStaffPermission extends Document {
  staff: mongoose.Types.ObjectId;
  grantedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  grantedAt: Date;
  revokedAt?: Date;
}

const StaffPermissionSchema = new Schema<IStaffPermission>(
  {
    staff: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    grantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IStaffPermission>('StaffPermission', StaffPermissionSchema);