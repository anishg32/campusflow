import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  department: mongoose.Types.ObjectId;
  durationYears: number;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    durationYears: {
      type: Number,
      required: true,
      default: 4,
    },
  },
  {
    timestamps: true,
  }
);

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);
export default Course;
