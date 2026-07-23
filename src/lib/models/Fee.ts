import mongoose, { Document, Model, Schema } from 'mongoose';

export enum FeeStatus {
  PENDING = 'Pending',
  PARTIAL = 'Partial',
  PAID = 'Paid',
}

export interface IPayment {
  amount: number;
  date: Date;
  method: string;
  reference?: string;
}

export interface IFee extends Document {
  title: string;
  student: mongoose.Types.ObjectId;
  totalAmount: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: Date;
  lastPaymentDate?: Date;
  department: mongoose.Types.ObjectId;
  payments: IPayment[];
}

const feeSchema = new Schema<IFee>(
  {
    title: {
      type: String,
      required: true,
      default: 'General Fee'
    },
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
    payments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        method: { type: String, required: true },
        reference: { type: String },
      }
    ],
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
