import mongoose, { Schema } from "mongoose"
import { IArticle } from "../types/article"

const articleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  like:{
    type:[String],
  },
  dislike:{
    type:[String],
  },
  block:{
    type:[String],
  }
})

const Article = mongoose.model<IArticle>("Article", articleSchema)
export default Article
