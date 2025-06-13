import { Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl:string;
  userId:string;
  createdAt: Date;
  like:string[];
  dislike:string[];
  block:string[];
}


export interface ArticleDetails {
  id?: string;
  title?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  description?: string;
  createdAt?: string;
}