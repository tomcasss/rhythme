import mongoose from "mongoose";


export const dbConnect = () => {
    try {
        mongoose.connect(process.env.DB_URL);
        console.log("Connected to the database successfully");
    } catch (error) {
        console.log(`Error connecting to the database: ${error.message}`);
        
    }
}