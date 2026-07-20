import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQRSession extends Document {
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
}

const qrSessionSchema = new Schema<IQRSession>(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    radius: {
      type: Number,
      default: 50, // default 50 meters
    },
  },
  {
    timestamps: true,
  }
);

qrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const QRSession: Model<IQRSession> = mongoose.model<IQRSession>('QRSession', qrSessionSchema);
export default QRSession;
