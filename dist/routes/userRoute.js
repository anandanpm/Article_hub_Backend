"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const userroute = express.Router();
const userController_1 = __importDefault(require("../controller/userController"));
userroute.post('/register', userController_1.default.registerUser);
userroute.post('/login', userController_1.default.loginUser);
userroute.post('/articles', userController_1.default.createArticles);
exports.default = userroute;
