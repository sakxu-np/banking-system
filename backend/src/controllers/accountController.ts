import { Request, Response } from 'express';
import Account from '../models/Account';
import mongoose from 'mongoose';

// Get all accounts for the authenticated user
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.user is set by the auth middleware
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const accounts = await Account.find({ userId: new mongoose.Types.ObjectId(userId) });

        res.status(200).json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Server error while fetching accounts', error: (error as Error).message });
    }
};

// Get a single account by ID
export const getAccountById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const accountId = req.params.id;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(accountId)) {
            res.status(400).json({ message: 'Invalid account ID format' });
            return;
        }

        const account = await Account.findOne({
            _id: accountId,
            userId: new mongoose.Types.ObjectId(userId)
        });

        if (!account) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }

        res.status(200).json(account);
    } catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({ message: 'Server error while fetching account', error: (error as Error).message });
    }
};

// Create a new account
export const createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { accountType, currency, initialBalance = 0 } = req.body;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Generate a random account number
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const newAccount = new Account({
            userId: new mongoose.Types.ObjectId(userId),
            accountNumber,
            accountType,
            balance: initialBalance,
            currency: currency || 'USD'
        });

        await newAccount.save();

        res.status(201).json(newAccount);
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Server error while creating account', error: (error as Error).message });
    }
};
