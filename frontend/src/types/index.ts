export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Account {
  _id: string;
  userId: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  accountId: string;
  receiverAccountId?: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'loan_disbursement' | 'loan_payment' | 'investment';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'flagged';
  fraudScore?: number;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface BudgetCategory {
  name: string;
  limit: number;
  spent: number;
  color: string;
}

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  _id: string;
  userId: string;
  accountId: string;
  loanType: 'personal' | 'home' | 'auto' | 'education' | 'business';
  amount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  creditScore: number;
  approvalScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanApplication {
  accountId: string;
  loanType: 'personal' | 'home' | 'auto' | 'education' | 'business';
  amount: number;
  term: number;
  purpose: string;
  creditScore: number;
}

export interface LoanApprovalResult {
  approved: boolean;
  score: number;
  reasons: string[];
  suggestedInterestRate?: number;
  maxApprovedAmount?: number;
}

export interface Investment {
  _id: string;
  userId: string;
  accountId: string;
  investmentType: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'cryptocurrency';
  assetName: string;
  ticker: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface FraudDetectionResult {
  score: number;
  isFraudulent: boolean;
  factors: string[];
  recommendation: string;
}

export interface TransactionFormData {
  accountId: string;
  receiverAccountId?: string;
  transactionType: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  currency?: string;
}