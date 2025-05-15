import { Request, Response } from 'express';
import  User  from '../model/userModel'; 
import bcrypt from 'bcrypt';
import { IUser } from '../types/user';
import Article from '../model/articleModel';

const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, phone, email, dob, password, articlePreferences } = req.body;
        
        // Validate input
        if (!firstName || !lastName || !phone || !email || !dob || !password || !articlePreferences) {
            res.status(400).json({ message: 'All fields are required' });
            return; 
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return; 
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: IUser = new User({
            firstName,
            lastName,
            email,
            phone,
            dob,
            password: hashedPassword,
            articlePreferences
        });
        
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password } = req.body;
        
        if (!identifier || !password) {
            res.status(400).json({ message: 'Email/Phone and password are required' });
            return;
        }

       
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });
        
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        
    
        const isMatch = await bcrypt.compare(password, user.password);
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
            id:user._id
        };
        
        res.status(200).json({ 
            message: 'Login successful', 
            user: userData
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const createArticles = async (req: Request, res: Response): Promise<void> => {
    try {  
        console.log(req.body)
        const { title, description, category, tags,imageUrl } = req.body;
        
        // Validate input
        if (!title || !category || !description || !tags||!imageUrl) {
            res.status(400).json({ message: 'All fields are required' });
            return; 
        }

        // Create new article
        const newArticle = new Article({
            title,
            description,
            category,
            imageUrl,
            tags
        });
        
        await newArticle.save();
        res.status(201).json({ message: 'Article created successfully' });
     }
    catch (error) {
        console.error('Error creating articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default { registerUser, loginUser, createArticles };