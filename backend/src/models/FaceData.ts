import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFaceData extends Document {
  user: mongoose.Types.ObjectId;
  descriptor: number[]; // Array of numbers representing the face embedding
  imageUrl?: string;
}

const faceDataSchema = new Schema<IFaceData>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    descriptor: {
      type: [Number],
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const FaceData: Model<IFaceData> = mongoose.model<IFaceData>('FaceData', faceDataSchema);
export default FaceData;
