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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const articleModel_1 = __importDefault(require("../model/articleModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
        const existingUserByPhone = yield userModel_1.default.findOne({ phone });
        if (existingUserByPhone) {
            res.status(409).json({ message: 'User with this phone number already exists' });
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
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT secrets are not defined in environment variables');
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            articlePreferences: user.articlePreferences,
            id: user._id
        };
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
            sameSite: 'strict'
        });
        res.status(200).json({
            message: 'Login successful',
            user: userData,
        });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('refreshToken', {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.clearCookie('accessToken', {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'logout successfully' });
    }
    catch (error) {
        console.error('Error logging out user:', error);
    }
    res.status(500).json({ message: 'Internal server error' });
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token not found' });
            return;
        }
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }
        jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({ message: 'Invalid refresh token' });
                return;
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000,
                sameSite: 'strict'
            });
            res.status(200).json({ message: 'Access token refreshed successfully' });
        });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const createArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { title, description, category, tags, imageUrl, userId } = req.body;
        // Validate input
        if (!title || !category || !description || !tags || !imageUrl || !userId) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // Create new article
        const newArticle = new articleModel_1.default({
            title,
            description,
            category,
            imageUrl,
            tags,
            userId
        });
        yield newArticle.save();
        res.status(201).json({ message: 'Article created successfully' });
    }
    catch (error) {
        console.error('Error creating articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const getArticlesByPreferences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { preferences, userId } = req.body;
        console.log("Received preferences:", preferences);
        console.log("User ID:", userId);
        if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ message: "Valid preferences are required" });
        }
        if (!userId) {
            console.log("Warning: userId not provided, user interaction status will be false");
        }
        const articles = yield articleModel_1.default.find({ category: { $in: preferences } })
            .sort({ createdAt: -1 })
            .limit(20);
        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: "No articles found for the given preferences" });
        }
        const userIds = articles.map((article) => article.userId);
        const users = yield userModel_1.default.find({ _id: { $in: userIds } });
        const authorMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = `${user.firstName} ${user.lastName}`;
            return acc;
        }, {});
        const articlesWithAuthors = articles.map((article) => {
            const articleObj = article.toObject();
            const authorName = authorMap[articleObj.userId] || "Unknown Author";
            const isLiked = articleObj.like && articleObj.like.includes(req.body.userId);
            const isDisliked = articleObj.dislike && articleObj.dislike.includes(req.body.userId);
            const isBlocked = articleObj.block && articleObj.block.includes(req.body.userId);
            const result = {
                id: articleObj._id,
                title: articleObj.title,
                excerpt: articleObj.description.substring(0, 150) + (articleObj.description.length > 150 ? "..." : ""),
                description: articleObj.description,
                category: articleObj.category,
                tags: articleObj.tags,
                image: articleObj.imageUrl,
                author: authorName,
                authorId: articleObj.userId,
                date: new Date(articleObj.createdAt).toLocaleDateString(),
                createdAt: articleObj.createdAt,
                userInteraction: {
                    isLiked,
                    isDisliked,
                    isBlocked,
                },
            };
            return result;
        });
        res.status(200).json(articlesWithAuthors);
    }
    catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Failed to fetch articles" });
    }
});
const likeArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }
        const article = yield articleModel_1.default.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        if (!article.like)
            article.like = [];
        if (!article.dislike)
            article.dislike = [];
        const alreadyLiked = article.like.includes(userId);
        if (alreadyLiked) {
            article.like = article.like.filter(id => id !== userId);
            yield article.save();
            return res.status(200).json({ message: "Article like removed", liked: false });
        }
        const previouslyDisliked = article.dislike.includes(userId);
        if (previouslyDisliked) {
            article.dislike = article.dislike.filter(id => id !== userId);
        }
        article.like.push(userId);
        yield article.save();
        return res.status(200).json({
            message: previouslyDisliked ? "Dislike changed to like" : "Article liked successfully",
            liked: true
        });
    }
    catch (error) {
        console.error("Error liking article:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
const dislikeArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        const { userId } = req.body;
        console.log(userId, 'the userid is comming ');
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }
        // Find the article by ID
        const article = yield articleModel_1.default.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        // Initialize arrays if they don't exist
        if (!article.like)
            article.like = [];
        if (!article.dislike)
            article.dislike = [];
        // Check if user already disliked the article
        const alreadyDisliked = article.dislike.includes(userId);
        if (alreadyDisliked) {
            // If already disliked, remove the dislike (toggle off)
            article.dislike = article.dislike.filter(id => id !== userId);
            yield article.save();
            return res.status(200).json({ message: "Article dislike removed", disliked: false });
        }
        // Check if user previously liked the article
        const previouslyLiked = article.like.includes(userId);
        if (previouslyLiked) {
            article.like = article.like.filter(id => id !== userId);
        }
        article.dislike.push(userId);
        yield article.save();
        return res.status(200).json({
            message: previouslyLiked ? "Like changed to dislike" : "Article disliked successfully",
            disliked: true
        });
    }
    catch (error) {
        console.error("Error disliking article:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
const blockArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        const { userId } = req.body;
        console.log(userId, 'the userid is coming');
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, user not authenticated" });
        }
        const article = yield articleModel_1.default.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        if (!article.block.includes(userId)) {
            article.block.push(userId);
            yield article.save();
        }
        return res.status(200).json({ message: "Article blocked successfully" });
    }
    catch (error) {
        console.error("Error blocking article:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
const getUserArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const rawArticles = yield articleModel_1.default.find({ userId })
            .sort({ createdAt: -1 });
        const articles = rawArticles.map((article) => {
            var _a, _b, _c;
            const likesCount = ((_a = article.like) === null || _a === void 0 ? void 0 : _a.length) || 0;
            const dislikesCount = ((_b = article.dislike) === null || _b === void 0 ? void 0 : _b.length) || 0;
            const blocksCount = ((_c = article.block) === null || _c === void 0 ? void 0 : _c.length) || 0;
            const totalReaders = likesCount + dislikesCount + blocksCount;
            return {
                id: article._id.toString(),
                title: article.title,
                imageUrl: article.imageUrl,
                category: article.category,
                tags: article.tags,
                description: article.description,
                createdAt: article.createdAt,
                likes: likesCount,
                dislikes: dislikesCount,
                blocks: blocksCount,
                totalReaders: totalReaders
            };
        });
        return res.status(200).json({
            articles,
            count: articles.length,
            message: "Successfully retrieved all user articles"
        });
    }
    catch (error) {
        console.error("Error fetching user articles:", error);
        return res.status(500).json({ message: "Failed to fetch articles" });
    }
});
const deleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        const article = yield articleModel_1.default.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        yield articleModel_1.default.findByIdAndDelete(articleId);
        return res.status(200).json({ message: "Article deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting article:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
const editArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { articleId } = req.params;
        console.log(req.body, 'is the details are coming or not');
        // Extract the article data, handling both direct data and nested editingArticle structure
        let articleData;
        if (req.body.editingArticle) {
            // If data is wrapped in editingArticle object
            articleData = req.body.editingArticle;
        }
        else {
            // If data is directly in the request body
            articleData = req.body;
        }
        const { id, title, imageUrl, category, tags, description } = articleData;
        // Check if the article exists
        const article = yield articleModel_1.default.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        console.log(article, 'the article is getting from the database');
        // Build the update object with only fields that are provided
        const updatedData = {};
        if (id)
            updatedData.id = id;
        if (title)
            updatedData.title = title;
        if (imageUrl)
            updatedData.imageUrl = imageUrl;
        if (category)
            updatedData.category = category;
        if (tags)
            updatedData.tags = tags;
        if (description)
            updatedData.description = description;
        console.log(updatedData, 'data prepared for update');
        // Update the article
        const updatedArticle = yield articleModel_1.default.findByIdAndUpdate(articleId, updatedData, { new: true, runValidators: true });
        console.log(updatedArticle, 'the updated article is coming');
        return res.status(200).json({
            message: "Article updated successfully",
            article: updatedArticle,
        });
    }
    catch (error) {
        console.error("Error updating article:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        console.log(userId);
        let response = yield userModel_1.default.findById(userId);
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error updating article:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body.details, 'the result is coming');
        const { _id, firstName, lastName, email, phone, dob, articlePreferences } = req.body.details;
        console.log('Incoming _id:', req.body.details._id, 'Type:', typeof req.body.details._id);
        // Find and update the user in the database
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(_id, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            dob: dob,
            articlePreferences: articlePreferences
        }, { new: true });
        console.log(updatedUser, 'the updated user is comming ');
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Return the updated user
        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword, userid } = req.body;
        const user = yield userModel_1.default.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        const saltRounds = 10;
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;
        yield user.save();
        return res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = { registerUser, loginUser, createArticles, refreshToken, logoutUser, getArticlesByPreferences, likeArticle, dislikeArticle, blockArticle, getUserArticles, deleteArticle, editArticle, getProfile, updateProfile, changePassword };
