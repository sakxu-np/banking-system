import express from 'express';
import auth from '../middleware/auth';
import * as transactionController from '../controllers/transactionController';

const router = express.Router();

// Define your transaction routes here
router.get('/', auth, (req, res) => {
    res.status(200).json({ message: 'Transaction routes' });
});

// Route for creating a new transaction
router.post('/', auth, (req, res) => {
    console.log('Transaction creation received:', req.body);
    console.log('User from token:', req.user);
    transactionController.createTransaction(req, res);
});

// Route for getting transactions by account ID
router.get('/account/:accountId', auth, transactionController.getTransactions);

export default router;
