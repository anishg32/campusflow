import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  type: 'attendance' | 'announcement' | 'leave' | 'system';
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['attendance', 'announcement', 'leave', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
