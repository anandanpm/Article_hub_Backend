import { Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl:string;
  createdAt: Date;
}