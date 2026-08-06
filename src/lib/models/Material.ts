import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMaterial extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  year?: number;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    year: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ department: 1, year: 1 });
materialSchema.index({ createdAt: -1 });

const Material: Model<IMaterial> = mongoose.models.Material || mongoose.model<IMaterial>('Material', materialSchema);
export default Material;
