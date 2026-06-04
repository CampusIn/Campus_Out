import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGO_URI){
    try {
        throw new Error('MONGO_URI is not defined in environment variables');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}

if(!process.env.JWT_SECRET){
    try {
        throw new Error('JWT_SECRET is not defined in environment variables');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
if(!process.env.CLIENT_ID){
    try {
        throw new Error('CLIENT_ID is not defined in environment variables');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
if(!process.env.CLIENT_SECRET){
    try {
        throw new Error('CLIENT_SECRET is not defined in environment variables');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
if(!process.env.GOOGLE_REFRESH_TOKEN){
    try {
        throw new Error('GOOGLE_REFRESH_TOKEN is not defined in environment variables');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
if(!process.env.GOOGLE_USER){
    try {
        throw new Error('GOOGLE_USER is not defined in environment variables');
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER
}

export default config;