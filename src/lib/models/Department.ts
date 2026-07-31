import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  hod?: mongoose.Types.ObjectId;
  subjectsConfig?: Record<string, Record<number, string[]>>;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subjectsConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);
export default Department;
