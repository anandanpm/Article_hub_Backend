import { Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  password: string; 
  articlePreferences: string[];
  createdAt: Date;
}