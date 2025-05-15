import express,{Request,Response} from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './services/db';
import { corsOptions } from "./config/corsOption";
import userRoute from './routes/userRoute';

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
dotenv.config();

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

app.use('/api',userRoute)

app.listen(process.env.PORT, () => {
  connectDB().then(() => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
});