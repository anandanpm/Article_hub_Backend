"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../model/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const articleModel_1 = __importDefault(require("../model/articleModel"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, phone, email, dob, password, articlePreferences } = req.body;
        // Validate input
        if (!firstName || !lastName || !phone || !email || !dob || !password || !articlePreferences) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // Check if user already exists
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }
        // Create new user
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            firstName,
            lastName,
            email,
            phone,
            dob,
            password: hashedPassword,
            articlePreferences
        });
        yield newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            res.status(400).json({ message: 'Email/Phone and password are required' });
            return;
        }
        const user = yield userModel_1.default.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            articlePreferences: user.articlePreferences,
            id: user._id
        };
        res.status(200).json({
            message: 'Login successful',
            user: userData
        });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const createArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { title, description, category, tags, imageUrl } = req.body;
        // Validate input
        if (!title || !category || !description || !tags || !imageUrl) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // Create new article
        const newArticle = new articleModel_1.default({
            title,
            description,
            category,
            imageUrl,
            tags
        });
        yield newArticle.save();
        res.status(201).json({ message: 'Article created successfully' });
    }
    catch (error) {
        console.error('Error creating articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = { registerUser, loginUser, createArticles };
