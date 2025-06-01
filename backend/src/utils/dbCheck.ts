import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/Loan';

// Load environment variables
dotenv.config();

// Script to check MongoDB connection and retrieve loan data
const checkDatabaseConnection = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-banking';
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);

        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB');

        // Check if Loan collection exists and retrieve data
        console.log('Checking Loan collection...');
        const loanCount = await Loan.countDocuments();
        console.log(`Total number of loans in the database: ${loanCount}`);

        if (loanCount > 0) {
            const loans = await Loan.find().limit(5);
            console.log('Sample loans:', JSON.stringify(loans, null, 2));
        } else {
            console.log('No loans found in the database');
        }

        // Check database collections
        const collections = await mongoose.connection.db.collections();
        console.log('Available collections:');
        collections.forEach(collection => {
            console.log(` - ${collection.collectionName}`);
        });

    } catch (error) {
        console.error('Database connection error:', error);
    } finally {
        // Close the connection
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    }
};

// Run the check
checkDatabaseConnection();
