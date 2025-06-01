"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.createTransaction = void 0;
const express_validator_1 = require("express-validator");
const Transaction_1 = __importStar(require("../models/Transaction"));
const Account_1 = __importDefault(require("../models/Account"));
const fraudDetection_1 = require("../ai/fraudDetection");
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { accountId, receiverAccountId, transactionType, amount, description } = req.body;
        // Check if account exists and belongs to the user
        const account = yield Account_1.default.findOne({
            _id: accountId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found or access denied' });
        }
        // Create a reference number for the transaction
        const reference = generateReference();
        // Create transaction object
        const transaction = new Transaction_1.default({
            accountId,
            receiverAccountId,
            transactionType,
            amount,
            description,
            reference,
            status: Transaction_1.TransactionStatus.PENDING
        });
        // Analyze for fraud
        const fraudResult = yield (0, fraudDetection_1.analyzeFraudRisk)(transaction);
        transaction.fraudScore = fraudResult.score;
        // Determine if we should block the transaction
        if (fraudResult.isFraudulent) {
            transaction.status = Transaction_1.TransactionStatus.FLAGGED;
            yield transaction.save();
            return res.status(400).json({
                message: 'Transaction flagged for review',
                transaction,
                fraudAnalysis: fraudResult
            });
        }
        // Process transaction based on type
        switch (transactionType) {
            case Transaction_1.TransactionType.WITHDRAWAL:
                // Check sufficient balance
                if (account.balance < amount) {
                    return res.status(400).json({ message: 'Insufficient funds' });
                }
                account.balance -= amount;
                break;
            case Transaction_1.TransactionType.DEPOSIT:
                account.balance += amount;
                break;
            case Transaction_1.TransactionType.TRANSFER:
                // Check if receiver account exists
                if (!receiverAccountId) {
                    return res.status(400).json({ message: 'Receiver account ID is required for transfers' });
                }
                const receiverAccount = yield Account_1.default.findById(receiverAccountId);
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
                yield receiverAccount.save();
                break;
            default:
                break;
        }
        // Update transaction status
        transaction.status = Transaction_1.TransactionStatus.COMPLETED;
        // Save transaction and account
        yield transaction.save();
        yield account.save();
        res.status(201).json({
            message: 'Transaction completed successfully',
            transaction,
            fraudAnalysis: fraudResult
        });
    }
    catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ message: 'Server error processing transaction' });
    }
});
exports.createTransaction = createTransaction;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { accountId } = req.params;
        // Check if account exists and belongs to the user
        const account = yield Account_1.default.findOne({
            _id: accountId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found or access denied' });
        }
        // Apply filters from query parameters
        const filters = { accountId };
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.type) {
            filters.transactionType = req.query.type;
        }
        // Apply date range filter if provided
        if (req.query.startDate && req.query.endDate) {
            filters.createdAt = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const transactions = yield Transaction_1.default.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield Transaction_1.default.countDocuments(filters);
        res.json({
            transactions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error fetching transactions' });
    }
});
exports.getTransactions = getTransactions;
// Generate a unique reference number
const generateReference = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN${timestamp}${random}`;
};
