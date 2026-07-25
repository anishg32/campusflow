import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

const SettingsSchema: Schema = new Schema(
  {
    twilioAccountSid: {
      type: String,
      default: '',
    },
    twilioAuthToken: {
      type: String,
      default: '',
    },
    twilioPhoneNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
