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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importStar(require("../models/User"));
const Account_1 = __importStar(require("../models/Account"));
const Transaction_1 = __importStar(require("../models/Transaction"));
const Loan_1 = __importStar(require("../models/Loan"));
const Investment_1 = __importStar(require("../models/Investment"));
const Budget_1 = __importDefault(require("../models/Budget"));
// Load environment variables
dotenv_1.default.config();
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-banking';
// Seed data
function seedData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
            // Clear all existing data
            yield User_1.default.deleteMany({});
            yield Account_1.default.deleteMany({});
            yield Transaction_1.default.deleteMany({});
            yield Loan_1.default.deleteMany({});
            yield Investment_1.default.deleteMany({});
            yield Budget_1.default.deleteMany({});
            console.log('Database cleared');
            // Create users
            const users = yield User_1.default.insertMany([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    password: yield bcrypt_1.default.hash('password123', 10),
                    phoneNumber: '555-1234',
                    dateOfBirth: new Date('1985-05-15'),
                    address: {
                        street: '123 Main St',
                        city: 'New York',
                        state: 'NY',
                        postalCode: '10001',
                        country: 'USA'
                    },
                    role: User_1.UserRole.USER
                },
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane@example.com',
                    password: yield bcrypt_1.default.hash('password123', 10),
                    phoneNumber: '555-5678',
                    dateOfBirth: new Date('1990-10-20'),
                    address: {
                        street: '456 Park Ave',
                        city: 'Los Angeles',
                        state: 'CA',
                        postalCode: '90001',
                        country: 'USA'
                    },
                    role: User_1.UserRole.USER
                },
                {
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@example.com',
                    password: yield bcrypt_1.default.hash('admin123', 10),
                    phoneNumber: '555-9012',
                    dateOfBirth: new Date('1980-01-01'),
                    address: {
                        street: '789 Bank St',
                        city: 'Chicago',
                        state: 'IL',
                        postalCode: '60601',
                        country: 'USA'
                    },
                    role: User_1.UserRole.ADMIN
                }
            ]);
            console.log(`${users.length} users created`);
            // Create accounts
            const accounts = [];
            for (const user of users) {
                const checkingAccount = yield Account_1.default.create({
                    userId: user._id,
                    accountNumber: `C${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    accountType: Account_1.AccountType.CHECKING,
                    balance: 5000 + Math.random() * 10000,
                    currency: 'USD'
                });
                const savingsAccount = yield Account_1.default.create({
                    userId: user._id,
                    accountNumber: `S${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    accountType: Account_1.AccountType.SAVINGS,
                    balance: 10000 + Math.random() * 50000,
                    currency: 'USD'
                });
                accounts.push(checkingAccount, savingsAccount);
            }
            console.log(`${accounts.length} accounts created`);
            // Create transactions
            const transactions = [];
            const transactionTypes = Object.values(Transaction_1.TransactionType);
            for (const account of accounts) {
                const numTransactions = 5 + Math.floor(Math.random() * 10); // 5-15 transactions per account
                for (let i = 0; i < numTransactions; i++) {
                    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
                    const amount = 10 + Math.random() * 1000;
                    let receiverAccountId = undefined;
                    if (transactionType === Transaction_1.TransactionType.TRANSFER) {
                        // Pick a random account that's not the current one
                        const otherAccounts = accounts.filter(a => a._id.toString() !== account._id.toString());
                        receiverAccountId = otherAccounts[Math.floor(Math.random() * otherAccounts.length)]._id;
                    }
                    const transaction = yield Transaction_1.default.create({
                        accountId: account._id,
                        receiverAccountId,
                        transactionType,
                        amount,
                        currency: 'USD',
                        description: `${transactionType} transaction #${i + 1}`,
                        reference: `REF${Date.now()}${Math.floor(Math.random() * 10000)}`,
                        status: Transaction_1.TransactionStatus.COMPLETED,
                        metadata: {}
                    });
                    transactions.push(transaction);
                }
            }
            console.log(`${transactions.length} transactions created`);
            // Create loans
            const loans = [];
            const loanTypes = Object.values(Loan_1.LoanType);
            for (const user of users) {
                const userAccounts = accounts.filter(a => a.userId.toString() === user._id.toString());
                if (userAccounts.length > 0) {
                    const numLoans = Math.floor(Math.random() * 3); // 0-2 loans per user
                    for (let i = 0; i < numLoans; i++) {
                        const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
                        const amount = 5000 + Math.random() * 95000;
                        const term = 12 + Math.floor(Math.random() * 48); // 12-60 months
                        const interestRate = 3 + Math.random() * 12; // 3-15%
                        // Simple monthly payment calculation
                        const monthlyInterest = interestRate / 100 / 12;
                        const monthlyPayment = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, term)) /
                            (Math.pow(1 + monthlyInterest, term) - 1);
                        const loan = yield Loan_1.default.create({
                            userId: user._id,
                            accountId: userAccounts[0]._id,
                            loanType,
                            amount,
                            interestRate,
                            term,
                            monthlyPayment,
                            status: Loan_1.LoanStatus.ACTIVE,
                            purpose: `${loanType} financing`,
                            creditScore: 650 + Math.floor(Math.random() * 200), // 650-850
                            startDate: new Date(),
                            endDate: new Date(Date.now() + term * 30 * 24 * 60 * 60 * 1000) // term months in the future
                        });
                        loans.push(loan);
                    }
                }
            }
            console.log(`${loans.length} loans created`);
            // Create investments
            const investments = [];
            const investmentTypes = Object.values(Investment_1.InvestmentType);
            const stockTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB', 'TSLA', 'V', 'JPM', 'JNJ', 'WMT'];
            for (const user of users) {
                const userAccounts = accounts.filter(a => a.userId.toString() === user._id.toString());
                if (userAccounts.length > 0) {
                    const numInvestments = 2 + Math.floor(Math.random() * 4); // 2-5 investments per user
                    for (let i = 0; i < numInvestments; i++) {
                        const investmentType = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
                        const ticker = stockTickers[Math.floor(Math.random() * stockTickers.length)];
                        const quantity = 1 + Math.floor(Math.random() * 100);
                        const purchasePrice = 50 + Math.random() * 950;
                        const currentPrice = purchasePrice * (0.8 + Math.random() * 0.4); // -20% to +20% of purchase price
                        const investment = yield Investment_1.default.create({
                            userId: user._id,
                            accountId: userAccounts[0]._id,
                            investmentType,
                            assetName: `${ticker} ${investmentType}`,
                            ticker,
                            quantity,
                            purchasePrice,
                            currentPrice,
                            purchaseDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)) // Random date in the past year
                        });
                        investments.push(investment);
                    }
                }
            }
            console.log(`${investments.length} investments created`);
            // Create budgets
            const budgets = [];
            const categories = [
                { name: 'Housing', color: '#4CAF50', limit: 0, spent: 0 },
                { name: 'Transportation', color: '#2196F3', limit: 0, spent: 0 },
                { name: 'Food', color: '#FF9800', limit: 0, spent: 0 },
                { name: 'Utilities', color: '#9C27B0', limit: 0, spent: 0 },
                { name: 'Entertainment', color: '#F44336', limit: 0, spent: 0 },
                { name: 'Healthcare', color: '#00BCD4', limit: 0, spent: 0 },
                { name: 'Shopping', color: '#E91E63', limit: 0, spent: 0 },
                { name: 'Education', color: '#3F51B5', limit: 0, spent: 0 }
            ];
            for (const user of users) {
                // Create a budget with random categories
                const selectedCategories = [...categories]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4 + Math.floor(Math.random() * 5)); // 4-8 categories
                const totalBudget = 3000 + Math.random() * 7000;
                // Assign random limits to each category, ensuring they sum to totalBudget
                let remainingBudget = totalBudget;
                for (let i = 0; i < selectedCategories.length; i++) {
                    if (i === selectedCategories.length - 1) {
                        // Last category gets the remainder
                        selectedCategories[i].limit = remainingBudget;
                    }
                    else {
                        // Other categories get a random portion
                        const limit = remainingBudget * (0.1 + Math.random() * 0.3); // 10-40% of remaining
                        selectedCategories[i].limit = Math.round(limit);
                        remainingBudget -= selectedCategories[i].limit;
                    }
                    // Add some spent amount (0-100% of limit)
                    selectedCategories[i].spent = selectedCategories[i].limit * Math.random();
                }
                const budget = yield Budget_1.default.create({
                    userId: user._id,
                    name: 'Monthly Budget',
                    totalBudget,
                    startDate: new Date(new Date().setDate(1)), // First day of current month
                    endDate: new Date(new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0)), // Last day of current month
                    categories: selectedCategories,
                    isActive: true
                });
                budgets.push(budget);
            }
            console.log(`${budgets.length} budgets created`);
            console.log('Database seeded successfully!');
        }
        catch (error) {
            console.error('Error seeding database:', error);
        }
        finally {
            mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
seedData();
