import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  course: mongoose.Types.ObjectId;
  semester: number;
  faculty: mongoose.Types.ObjectId;
}

const subjectSchema = new Schema<ISubject>(
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
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subject: Model<ISubject> = mongoose.model<ISubject>('Subject', subjectSchema);
export default Subject;
