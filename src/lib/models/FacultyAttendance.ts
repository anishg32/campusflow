import mongoose, { Document, Model, Schema } from 'mongoose';

export enum FacultyAttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

export interface IFacultyAttendance extends Document {
  faculty: mongoose.Types.ObjectId; // The faculty member whose attendance is being tracked
  recordedBy: mongoose.Types.ObjectId; // The admin who recorded it
  date: Date;
  status: FacultyAttendanceStatus;
}

const facultyAttendanceSchema = new Schema<IFacultyAttendance>(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordedBy: {
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
      enum: Object.values(FacultyAttendanceStatus),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one attendance record per faculty per day
facultyAttendanceSchema.index({ faculty: 1, date: 1 }, { unique: true });

const FacultyAttendance: Model<IFacultyAttendance> = mongoose.models.FacultyAttendance || mongoose.model<IFacultyAttendance>('FacultyAttendance', facultyAttendanceSchema);
export default FacultyAttendance;
