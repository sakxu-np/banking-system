import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Transaction, { TransactionType, TransactionStatus, ITransaction } from '../models/Transaction';
import Account from '../models/Account';
import { analyzeFraudRisk } from '../ai/fraudDetection';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountId, receiverAccountId, transactionType, amount, description } = req.body;

    // Check if account exists and belongs to the user
    const account = await Account.findOne({
      _id: accountId,
      userId: req.user?.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or access denied' });
    }

    // Create a reference number for the transaction
    const reference = generateReference();

    // Create transaction object
    const transaction = new Transaction({
      accountId,
      receiverAccountId,
      transactionType,
      amount,
      description,
      reference,
      status: TransactionStatus.PENDING
    });

    // Analyze for fraud
    const fraudResult = await analyzeFraudRisk(transaction);
    transaction.fraudScore = fraudResult.score;

    // Determine if we should block the transaction
    if (fraudResult.isFraudulent) {
      transaction.status = TransactionStatus.FLAGGED;
      await transaction.save();
      
      return res.status(400).json({
        message: 'Transaction flagged for review',
        transaction,
        fraudAnalysis: fraudResult
      });
    }

    // Process transaction based on type
    switch (transactionType) {
      case TransactionType.WITHDRAWAL:
        // Check sufficient balance
        if (account.balance < amount) {
          return res.status(400).json({ message: 'Insufficient funds' });
        }
        account.balance -= amount;
        break;
      
      case TransactionType.DEPOSIT:
        account.balance += amount;
        break;
      
      case TransactionType.TRANSFER:
        // Check if receiver account exists
        if (!receiverAccountId) {
          return res.status(400).json({ message: 'Receiver account ID is required for transfers' });
        }
        
        const receiverAccount = await Account.findById(receiverAccountId);
        if (!receiverAccount) {
          return res.status(404).json({ message: 'Receiver account not found' });
        }
        
        // Check sufficient balance
        if (account.balance < amount) {
          return res.status(400).json({ message: 'Insufficient funds' });
        }
        
        // Update balances
        account.balance -= amount;
        receiverAccount.balance += amount;
        await receiverAccount.save();
        break;
      
      default:
        break;
    }

    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED;
    
    // Save transaction and account
    await transaction.save();
    await account.save();

    res.status(201).json({
      message: 'Transaction completed successfully',
      transaction,
      fraudAnalysis: fraudResult
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Server error processing transaction' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    
    // Check if account exists and belongs to the user
    const account = await Account.findOne({
      _id: accountId,
      userId: req.user?.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or access denied' });
    }

    // Apply filters from query parameters
    const filters: any = { accountId };
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.type) {
      filters.transactionType = req.query.type;
    }
    
    // Apply date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      filters.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filters);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// Generate a unique reference number
const generateReference = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN${timestamp}${random}`;
};