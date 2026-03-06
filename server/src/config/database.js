// used to create  and connect database 
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from '../models/user.js';

dotenv.config();
const MONGODB_URL = process.env.DATABASE_URL 

// connecting to mongodb 
export const connectDB = async()=>{
    try{
        
        await mongoose.connect(MONGODB_URL);

    console.log('✓ MongoDB connected successfully');
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
    //listening to errors obtained from the connect methods 
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
    //listening to failue thet may occur causing a disconnections 
    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
    });
    //listening to a close operation an example a ctrl+c event 
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });

    } catch(error){
        console.error(error.message)
        process.exit(1);
    }
};
// disconnecting the mongoose connection gracefullt 
export const  disconnectDB = async ()=>{
    try{
        await mongoose.connection.close();
        console.log("mongodb disconnected ")
    }catch(error){
        console.log(`error: ${error.message}`)
    }  
}
//creating an initial admin 
export const createAdmin = async ()=>{
    try{
        const ExistingAdmin = await User.findOne({role:'admin'});
        if(!ExistingAdmin){
            const Admin = new User({
                role:'admin',
                username:process.env.ADMIN_USERNAME,
                password:process.env.ADMIN_PASSWORD
            });

            await Admin.save()
            console.log("admin created successfully ")

        }else{
            console.log("admin user already exists")

        }
    }catch(error){
        console.log("error creating admin ")
    }
};

