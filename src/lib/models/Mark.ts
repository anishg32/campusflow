import mongoose, { Document, Model, Schema } from 'mongoose';

export enum ExamType {
  CLASS_TEST = 'Class Test',
  INTERNAL_EXAM = 'Internal Exam',
  SEMESTER_EXAM = 'Semester Exam',
}

export interface IMark extends Document {
  student: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  subjectName: string;
  examType: ExamType;
  marksObtained: number;
  maxMarks: number;
  date: Date;
}

const markSchema = new Schema<IMark>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      enum: Object.values(ExamType),
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate marks for the same student/subject/examType
markSchema.index({ student: 1, subjectName: 1, examType: 1 }, { unique: true });

const Mark: Model<IMark> = mongoose.models.Mark || mongoose.model<IMark>('Mark', markSchema);
export default Mark;
