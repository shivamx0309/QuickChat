import mongoose from "mongoose";

// Function to connect to the mongodb database
export const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=> console.log('Database Connected'));
        let uri = process.env.MONGODB_URI;
        if (uri.endsWith('/')) {
            uri = uri.slice(0, -1);
        }
        await mongoose.connect(`${uri}/chat-app`); 
    } catch (error) {
        console.log(error);
    }
}