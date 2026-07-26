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
  tuitionFee: number;
  busFee: number;
  sportsFee: number;
  bookFee: number;
  examFee: number;
  dueFee: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: Date;
  lastPaymentDate?: Date;
  department: mongoose.Types.ObjectId;
  semester?: number;
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
    semester: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    tuitionFee: {
      type: Number,
      default: 0,
    },
    busFee: {
      type: Number,
      default: 0,
    },
    sportsFee: {
      type: Number,
      default: 0,
    },
    bookFee: {
      type: Number,
      default: 0,
    },
    examFee: {
      type: Number,
      default: 0,
    },
    dueFee: {
      type: Number,
      default: 0,
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
