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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token = req.cookies.accessToken;
        if (!token && ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer '))) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        try {
            const jwtSecret = process.env.JWT_ACCESS_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_ACCESS_SECRET is not defined in environment variables.');
            }
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            const user = yield userModel_1.default.findById(decoded.userId);
            if (!user) {
                res.status(401).json({ message: 'Invalid token. User not found.' });
                return;
            }
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ message: 'Token expired.' });
            }
            else {
                res.status(401).json({ message: 'Invalid token.' });
            }
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = authMiddleware;
