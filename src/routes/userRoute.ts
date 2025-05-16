const express = require('express');
const userroute = express.Router();
import userController from "../controller/userController";
import authMiddleware from '../middleware/Authmiddleware';

userroute.post('/register', userController.registerUser);
userroute.post('/login',userController.loginUser);
userroute.post('/logout',authMiddleware,userController.logoutUser);
userroute.post('/articles',authMiddleware,userController.createArticles);
userroute.post('/articles/recommendations',authMiddleware,userController.getArticlesByPreferences);
userroute.post('/articles/:articleId/like', authMiddleware, userController.likeArticle);
userroute.post('/articles/:articleId/dislike', authMiddleware, userController.dislikeArticle);
userroute.post('/refresh-token',userController.refreshToken);


export default userroute