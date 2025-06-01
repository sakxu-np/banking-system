import express from 'express';
import auth from '../middleware/auth';
import { getAccounts, getAccountById, createAccount } from '../controllers/accountController';

const router = express.Router();

// Get all accounts for the authenticated user
router.get('/', auth, getAccounts);

// Get a specific account by ID
router.get('/:id', auth, getAccountById);

// Create a new account
router.post('/', auth, createAccount);

export default router;
