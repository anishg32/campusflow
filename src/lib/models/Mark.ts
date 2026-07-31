import mongoose, { Document, Model, Schema } from 'mongoose';

export enum ExamType {
  CLASS_TEST = 'Class Test',
  CLASS_TEST_1 = 'Class Test 1',
  CLASS_TEST_2 = 'Class Test 2',
  CLASS_TEST_3 = 'Class Test 3',
  CLASS_TEST_4 = 'Class Test 4',
  INTERNAL_EXAM = 'Internal Exam',
  INTERNAL_EXAM_1 = 'Internal Exam 1',
  INTERNAL_EXAM_2 = 'Internal Exam 2',
  INTERNAL_EXAM_3 = 'Internal Exam 3',
  INTERNAL_EXAM_4 = 'Internal Exam 4',
  REVISION_EXAM_1 = 'Revision Exam 1',
  REVISION_EXAM_2 = 'Revision Exam 2',
  REVISION_EXAM_3 = 'Revision Exam 3',
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
  assignmentMarks?: number;
  internalExamMarks?: number;
  semester: number;
  grade?: string;
  createdBy?: mongoose.Types.ObjectId;
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
      min: 0,
    },
    maxMarks: {
      type: Number,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assignmentMarks: {
      type: Number,
      min: 0,
      max: 40,
    },
    internalExamMarks: {
      type: Number,
      min: 0,
      max: 60,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1,
    },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'U'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate marks for the same student/subject/examType/semester
markSchema.index({ student: 1, subjectName: 1, examType: 1, semester: 1 }, { unique: true });

const Mark: Model<IMark> = mongoose.models.Mark || mongoose.model<IMark>('Mark', markSchema);
export default Mark;
