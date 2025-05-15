const express = require('express');
const userroute = express.Router();
import userController from "../controller/userController";

userroute.post('/register', userController.registerUser);
userroute.post('/login',userController.loginUser);
userroute.post('/articles',userController.createArticles);


export default userroute