import mongoose, { Document, Model, Schema } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  department: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one attendance record per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;
