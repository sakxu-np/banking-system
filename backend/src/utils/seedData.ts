import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User, { UserRole } from '../models/User';
import Account, { AccountType } from '../models/Account';
import Transaction, { TransactionType, TransactionStatus } from '../models/Transaction';
import Loan, { LoanStatus, LoanType } from '../models/Loan';
import Investment, { InvestmentType } from '../models/Investment';
import Budget from '../models/Budget';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-banking';

// Seed data
async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Loan.deleteMany({});
    await Investment.deleteMany({});
    await Budget.deleteMany({});
    console.log('Database cleared');

    // Create users
    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '555-1234',
        dateOfBirth: new Date('1985-05-15'),
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        role: UserRole.USER
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        phoneNumber: '555-5678',
        dateOfBirth: new Date('1990-10-20'),
        address: {
          street: '456 Park Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        role: UserRole.USER
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        phoneNumber: '555-9012',
        dateOfBirth: new Date('1980-01-01'),
        address: {
          street: '789 Bank St',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          country: 'USA'
        },
        role: UserRole.ADMIN
      }
    ]);
    console.log(`${users.length} users created`);

    // Create accounts
    const accounts: any[] = [];
    for (const user of users) {
      const checkingAccount = await Account.create({
        userId: user._id,
        accountNumber: `C${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        accountType: AccountType.CHECKING,
        balance: 5000 + Math.random() * 10000,
        currency: 'USD'
      });

      const savingsAccount = await Account.create({
        userId: user._id,
        accountNumber: `S${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        accountType: AccountType.SAVINGS,
        balance: 10000 + Math.random() * 50000,
        currency: 'USD'
      });

      accounts.push(checkingAccount, savingsAccount);
    }
    console.log(`${accounts.length} accounts created`);

    // Create transactions
    const transactions: any[] = [];
    const transactionTypes = Object.values(TransactionType);

    for (const account of accounts) {
      const numTransactions = 5 + Math.floor(Math.random() * 10); // 5-15 transactions per account

      for (let i = 0; i < numTransactions; i++) {
        const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = 10 + Math.random() * 1000;

        let receiverAccountId = undefined;
        if (transactionType === TransactionType.TRANSFER) {
          // Pick a random account that's not the current one
          const otherAccounts = accounts.filter(a => a._id.toString() !== account._id.toString());
          receiverAccountId = otherAccounts[Math.floor(Math.random() * otherAccounts.length)]._id;
        }

        const transaction = await Transaction.create({
          accountId: account._id,
          receiverAccountId,
          transactionType,
          amount,
          currency: 'USD',
          description: `${transactionType} transaction #${i + 1}`,
          reference: `REF${Date.now()}${Math.floor(Math.random() * 10000)}`,
          status: TransactionStatus.COMPLETED,
          metadata: {}
        });

        transactions.push(transaction);
      }
    }
    console.log(`${transactions.length} transactions created`);

    // Create loans
    const loans: any[] = [];
    const loanTypes = Object.values(LoanType);

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

          const loan = await Loan.create({
            userId: user._id,
            accountId: userAccounts[0]._id,
            loanType,
            amount,
            interestRate,
            term,
            monthlyPayment,
            status: LoanStatus.ACTIVE,
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
    const investments: any[] = [];
    const investmentTypes = Object.values(InvestmentType);
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

          const investment = await Investment.create({
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
    const budgets: any[] = [];
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
        } else {
          // Other categories get a random portion
          const limit = remainingBudget * (0.1 + Math.random() * 0.3); // 10-40% of remaining
          selectedCategories[i].limit = Math.round(limit);
          remainingBudget -= selectedCategories[i].limit;
        }

        // Add some spent amount (0-100% of limit)
        selectedCategories[i].spent = selectedCategories[i].limit * Math.random();
      }

      const budget = await Budget.create({
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
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedData();