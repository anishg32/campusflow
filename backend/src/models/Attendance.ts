import mongoose, { Document, Model, Schema } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  method: 'manual' | 'qr' | 'face';
}

const attendanceSchema = new Schema<IAttendance>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    method: {
      type: String,
      enum: ['manual', 'qr', 'face'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', attendanceSchema);
export default Attendance;
