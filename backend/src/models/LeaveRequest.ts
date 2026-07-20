import mongoose, { Document, Model, Schema } from 'mongoose';

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ILeaveRequest extends Document {
  student: mongoose.Types.ObjectId;
  reason: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  documentUrl?: string;
  approvedBy?: mongoose.Types.ObjectId;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
    },
    documentUrl: {
      type: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest: Model<ILeaveRequest> = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
