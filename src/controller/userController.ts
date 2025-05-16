import { Request, Response } from 'express';
import  User  from '../model/userModel'; 
import bcrypt from 'bcrypt';
import { IUser } from '../types/user';
import jwt from 'jsonwebtoken';
import Article from '../model/articleModel';
import dotenv from 'dotenv';

dotenv.config();

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

        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT secrets are not defined in environment variables');
        }

        
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: '15m' } 
        );
        
      
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' } 
        );
        
        
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
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {   
        res.clearCookie('refreshToken', {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.clearCookie('accessToken', {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    } catch (error) {
        console.error('Error logging out user:', error);}
        res.status(500).json({ message: 'Internal server error' });
    }

const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: 'Refresh token not found' });
            return;
        }

        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err, decoded) => {
            if (err) {
                res.status(403).json({ message: 'Invalid refresh token' });
                return;
            }
            
            const accessToken = jwt.sign(
                { userId: (decoded as any).userId },
                process.env.JWT_ACCESS_SECRET as string,
                { expiresIn: '15m' } 
            );
            
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000,
                sameSite: 'strict'
            });
            
            res.status(200).json({ message: 'Access token refreshed successfully' });
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createArticles = async (req: Request, res: Response): Promise<void> => {
    try {  
        console.log(req.body)
        const { title, description, category, tags,imageUrl,userId } = req.body;
        
        // Validate input
        if (!title || !category || !description || !tags||!imageUrl||!userId) {
            res.status(400).json({ message: 'All fields are required' });
            return; 
        }

        // Create new article
        const newArticle = new Article({
            title,
            description,
            category,
            imageUrl,
            tags,
            userId
        });
        
        await newArticle.save();
        res.status(201).json({ message: 'Article created successfully' });
     }
    catch (error) {
        console.error('Error creating articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//  const getArticlesByPreferences = async (req: Request, res: Response) => {
//   try {
//     const { preferences } = req.body;
    
//     console.log("Received preferences:", preferences);
    
//     if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
//       return res.status(400).json({ message: "Valid preferences are required" });
//     }

//     // Find articles matching user preferences (category or tags)
//     const articles = await Article.find({
//       $or: [
//         { category: { $in: preferences } },
//         { tags: { $in: preferences } }
//       ]
//     }).sort({ createdAt: -1 }); // Sort by newest first
    
//     console.log("Found articles:", JSON.stringify(articles, null, 2));
//     console.log(`Total articles found: ${articles.length}`);

//     // Get unique user IDs from articles
//     const userIds = [...new Set(articles.map(article => article.userId))];
//     console.log("Unique user IDs:", userIds);
    
//     // Find all users who authored these articles
//     const authors = await User.find({
//       _id: { $in: userIds }
//     }, { _id: 1, firstName: 1, lastName: 1 });
    
//     console.log("Found authors:", JSON.stringify(authors, null, 2));

//     // Create a map of user IDs to author names
//     const authorMap = authors.reduce((map, user: any) => {
//       map[user._id.toString()] = `${user.firstName} ${user.lastName}`;
//       return map;
//     }, {} as Record<string, string>);
    
//     console.log("Author map:", authorMap);

//     // Combine article data with author information
//     const articlesWithAuthors = articles.map(article => {
//       const articleObj = article.toObject();
//       const authorName = authorMap[articleObj.userId] || 'Unknown Author';
      
//       const result = {
//         id: articleObj._id,
//         title: articleObj.title,
//         excerpt: articleObj.description.substring(0, 150) + (articleObj.description.length > 150 ? '...' : ''),
//         description: articleObj.description,
//         category: articleObj.category,
//         tags: articleObj.tags,
//         image: articleObj.imageUrl,
//         author: authorName,
//         authorId: articleObj.userId,
//         date: new Date(articleObj.createdAt).toLocaleDateString(),
//         createdAt: articleObj.createdAt
//       };
      
//       return result;
//     });
    
//     console.log("Final articles with authors:", JSON.stringify(articlesWithAuthors, null, 2));
//     console.log(`Total combined articles: ${articlesWithAuthors.length}`);

//     return res.status(200).json(articlesWithAuthors);
//   } catch (error) {
//     console.error("Error fetching articles with authors:", error);
//     return res.status(500).json({ message: "Server error while fetching articles" });
//   }
// };


const getArticlesByPreferences = async (req, res) => {
  try {
    const { preferences, userId } = req.body

    console.log("Received preferences:", preferences)
    console.log("User ID:", userId)

    if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
      return res.status(400).json({ message: "Valid preferences are required" })
    }

    if (!userId) {
      console.log("Warning: userId not provided, user interaction status will be false")
    }

    const articles = await Article.find({ category: { $in: preferences } })
      .sort({ createdAt: -1 })
      .limit(20)

    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: "No articles found for the given preferences" })
    }

    
    const userIds = articles.map((article) => article.userId)
    const users = await User.find({ _id: { $in: userIds } })

    
    const authorMap = users.reduce((acc, user: any) => {
      acc[user._id.toString()] = `${user.firstName} ${user.lastName}`
      return acc
    }, {})

    
    const articlesWithAuthors = articles.map((article) => {
      const articleObj = article.toObject()
      const authorName = authorMap[articleObj.userId] || "Unknown Author"

   
      const isLiked = articleObj.like && articleObj.like.includes(req.body.userId)
      const isDisliked = articleObj.dislike && articleObj.dislike.includes(req.body.userId)
      const isBlocked = articleObj.block && articleObj.block.includes(req.body.userId)

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
      }

      return result
    })

    res.status(200).json(articlesWithAuthors)
  } catch (error) {
    console.error("Error fetching articles:", error)
    res.status(500).json({ message: "Failed to fetch articles" })
  }
}

 const likeArticle = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const {userId} = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized, user not authenticated" });
    }

    
    const article = await Article.findById(articleId);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

  
    if (!article.like) article.like = [];
    if (!article.dislike) article.dislike = [];

  
    const alreadyLiked = article.like.includes(userId);
    
    if (alreadyLiked) {
   
      article.like = article.like.filter(id => id !== userId);
      await article.save();
      return res.status(200).json({ message: "Article like removed", liked: false });
    }
    
 
    const previouslyDisliked = article.dislike.includes(userId);
    
    if (previouslyDisliked) {
      
      article.dislike = article.dislike.filter(id => id !== userId);
    }
    
   
    article.like.push(userId);
    
  
    await article.save();
    
    return res.status(200).json({ 
      message: previouslyDisliked ? "Dislike changed to like" : "Article liked successfully", 
      liked: true
    });
  } catch (error) {
    console.error("Error liking article:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const dislikeArticle = async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params;
    const {userId }= req.body;
    console.log(userId,'the userid is comming ')

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized, user not authenticated" });
    }

    // Find the article by ID
    const article = await Article.findById(articleId);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Initialize arrays if they don't exist
    if (!article.like) article.like = [];
    if (!article.dislike) article.dislike = [];

    // Check if user already disliked the article
    const alreadyDisliked = article.dislike.includes(userId);
    
    if (alreadyDisliked) {
      // If already disliked, remove the dislike (toggle off)
      article.dislike = article.dislike.filter(id => id !== userId);
      await article.save();
      return res.status(200).json({ message: "Article dislike removed", disliked: false });
    }
    
    // Check if user previously liked the article
    const previouslyLiked = article.like.includes(userId);
    
    if (previouslyLiked) {
      // Remove from like array
      article.like = article.like.filter(id => id !== userId);
    }
    
    // Add to dislike array
    article.dislike.push(userId);
    
    // Save the updated article
    await article.save();
    
    return res.status(200).json({ 
      message: previouslyLiked ? "Like changed to dislike" : "Article disliked successfully", 
      disliked: true
    });
  } catch (error) {
    console.error("Error disliking article:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

//  const blockArticle = async (req: Request, res: Response) => {
//   try {
//     const { articleId } = req.params;
//     const userId = req.user?.id; // Assuming you have authentication middleware

//     // Here you would typically add to user's blocked articles collection
    
//     return res.status(200).json({ message: "Article blocked successfully" });
//   } catch (error) {
//     console.error("Error blocking article:", error);
//     return res.status(500).json({ message: "Server error" });
//   }


export default { registerUser, loginUser, createArticles, refreshToken,logoutUser, getArticlesByPreferences,likeArticle,dislikeArticle };