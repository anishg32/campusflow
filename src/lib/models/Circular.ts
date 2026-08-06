import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICircular extends Document {
  title: string;
  message: string;
  postedBy: mongoose.Types.ObjectId;
  targetAudience: 'all' | 'faculty' | 'student';
  department?: mongoose.Types.ObjectId;
}

const circularSchema = new Schema<ICircular>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'faculty', 'student'],
      default: 'all',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries: newest circulars first, optionally filtered by audience/department
circularSchema.index({ createdAt: -1 });
circularSchema.index({ targetAudience: 1, department: 1, createdAt: -1 });

const Circular: Model<ICircular> =
  mongoose.models.Circular || mongoose.model<ICircular>('Circular', circularSchema);
export default Circular;
