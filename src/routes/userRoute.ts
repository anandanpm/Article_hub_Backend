const express = require('express');
const userroute = express.Router();
import userController from "../controller/userController";
import authMiddleware from '../middleware/Authmiddleware';

userroute.post('/register', userController.registerUser);
userroute.post('/login',userController.loginUser);
userroute.post('/logout',authMiddleware,userController.logoutUser);
userroute.post('/articles',authMiddleware,userController.createArticles);
userroute.put('/user/profiles',authMiddleware,userController.updateProfile);
userroute.get('/articles/user/:userId',authMiddleware,userController.getUserArticles);
userroute.post('/articles/recommendations',authMiddleware,userController.getArticlesByPreferences);
userroute.post('/articles/:articleId/like', authMiddleware, userController.likeArticle);
userroute.post('/articles/:articleId/dislike', authMiddleware, userController.dislikeArticle);
userroute.post('/articles/:articleId/block', authMiddleware, userController.blockArticle);
userroute.delete('/articles/delete/:articleId',authMiddleware,userController.deleteArticle);
userroute.patch('/articles/edit/:articleId',authMiddleware,userController.editArticle);
userroute.get('/user/profile/:userId',authMiddleware,userController.getProfile);
userroute.patch('/user/newpassword',authMiddleware,userController.changePassword);
userroute.post('/refresh-token',userController.refreshToken);


export default userroute