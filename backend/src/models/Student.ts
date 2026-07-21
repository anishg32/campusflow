import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  rollNumber: string;
  phoneNumber: string;
  email?: string;
  department: mongoose.Types.ObjectId;
  year: number;
  section: string;
  parentName?: string;
  parentPhoneNumber?: string;
}

const studentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    section: {
      type: String,
      required: true,
      default: 'A',
    },
    parentName: {
      type: String,
    },
    parentPhoneNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Student: Model<IStudent> = mongoose.model<IStudent>('Student', studentSchema);
export default Student;
