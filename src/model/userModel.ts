
import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user";

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,

  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  articlePreferences: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
