import mongoose, { Document, Model, Schema } from 'mongoose';

export enum FeeStatus {
  PENDING = 'Pending',
  PARTIAL = 'Partial',
  PAID = 'Paid',
}

export interface IFee extends Document {
  student: mongoose.Types.ObjectId;
  totalAmount: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: Date;
  lastPaymentDate?: Date;
  department: mongoose.Types.ObjectId;
}

const feeSchema = new Schema<IFee>(
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
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(FeeStatus),
      default: FeeStatus.PENDING,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lastPaymentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one active fee record per student per term/year if needed, 
// for now we'll just allow multiple, or compound index.
// feeSchema.index({ student: 1 }, { unique: true });

const Fee: Model<IFee> = mongoose.models.Fee || mongoose.model<IFee>('Fee', feeSchema);
export default Fee;
