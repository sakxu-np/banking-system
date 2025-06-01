import { ILoan, LoanStatus } from '../models/Loan';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';

// Loan approval factors and weights
const APPROVAL_FACTORS = {
  CREDIT_SCORE: {
    weight: 0.4,
    ranges: [
      { min: 800, max: 850, score: 1.0 },
      { min: 740, max: 799, score: 0.8 },
      { min: 670, max: 739, score: 0.6 },
      { min: 580, max: 669, score: 0.4 },
      { min: 300, max: 579, score: 0.2 }
    ]
  },
  LOAN_TO_INCOME: {
    weight: 0.3,
    // Value represents maximum loan-to-income ratio for each score
    ranges: [
      { value: 0.2, score: 1.0 },
      { value: 0.3, score: 0.8 },
      { value: 0.4, score: 0.6 },
      { value: 0.5, score: 0.4 },
      { value: 0.6, score: 0.2 }
    ]
  },
  ACCOUNT_HISTORY: {
    weight: 0.15,
    // Value represents minimum months of account activity
    ranges: [
      { value: 36, score: 1.0 },
      { value: 24, score: 0.8 },
      { value: 12, score: 0.6 },
      { value: 6, score: 0.4 },
      { value: 3, score: 0.2 }
    ]
  },
  EXISTING_LOANS: {
    weight: 0.15,
    // Value represents maximum number of existing active loans
    ranges: [
      { value: 0, score: 1.0 },
      { value: 1, score: 0.8 },
      { value: 2, score: 0.6 },
      { value: 3, score: 0.4 },
      { value: 4, score: 0.2 }
    ]
  }
};

export interface LoanApprovalResult {
  approved: boolean;
  score: number;
  reasons: string[];
  suggestedInterestRate?: number;
  maxApprovedAmount?: number;
}

export async function evaluateLoanApplication(loan: ILoan): Promise<LoanApprovalResult> {
  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Evaluate credit score
  const creditScorePoints = evaluateCreditScore(loan.creditScore);
  totalScore += creditScorePoints * APPROVAL_FACTORS.CREDIT_SCORE.weight;

  // 2. Calculate and evaluate loan-to-income ratio
  // In a real system, we would fetch actual income data
  // Here we'll simulate with random income between 30,000 and 120,000
  const annualIncome = 30000 + Math.random() * 90000;
  const loanAmount = loan.amount;
  const loanToIncomeRatio = loanAmount / annualIncome;
  const loanToIncomePoints = evaluateLoanToIncome(loanToIncomeRatio);
  totalScore += loanToIncomePoints * APPROVAL_FACTORS.LOAN_TO_INCOME.weight;
  
  if (loanToIncomePoints < 0.6) {
    reasons.push("Loan amount too high relative to income");
  }

  // 3. Evaluate account history
  // Simulate account age in months (3-60 months)
  const accountAgeMonths = Math.floor(3 + Math.random() * 57);
  const accountHistoryPoints = evaluateAccountHistory(accountAgeMonths);
  totalScore += accountHistoryPoints * APPROVAL_FACTORS.ACCOUNT_HISTORY.weight;
  
  if (accountHistoryPoints < 0.6) {
    reasons.push("Limited account history");
  }

  // 4. Evaluate existing loans
  // Simulate number of existing loans (0-5)
  const existingLoans = Math.floor(Math.random() * 6);
  const existingLoansPoints = evaluateExistingLoans(existingLoans);
  totalScore += existingLoansPoints * APPROVAL_FACTORS.EXISTING_LOANS.weight;
  
  if (existingLoansPoints < 0.6) {
    reasons.push("Too many existing active loans");
  }

  // Calculate suggested interest rate based on score
  // Base rate 5% + risk adjustment (up to 10% additional)
  const suggestedInterestRate = 5 + (10 * (1 - totalScore));
  
  // Calculate maximum approved amount based on score and income
  // Using debt-to-income ratio of 0.36 as a guideline
  const maxApprovedAmount = totalScore * 0.36 * annualIncome;

  // Determine if loan is approved (score >= 0.6)
  const approved = totalScore >= 0.6;

  if (!approved && creditScorePoints < 0.6) {
    reasons.push("Credit score too low");
  }

  return {
    approved,
    score: totalScore,
    reasons,
    suggestedInterestRate: parseFloat(suggestedInterestRate.toFixed(2)),
    maxApprovedAmount: Math.round(maxApprovedAmount)
  };
}

function evaluateCreditScore(creditScore: number): number {
  for (const range of APPROVAL_FACTORS.CREDIT_SCORE.ranges) {
    if (creditScore >= range.min && creditScore <= range.max) {
      return range.score;
    }
  }
  return 0;
}

function evaluateLoanToIncome(ratio: number): number {
  for (const range of APPROVAL_FACTORS.LOAN_TO_INCOME.ranges) {
    if (ratio <= range.value) {
      return range.score;
    }
  }
  return 0;
}

function evaluateAccountHistory(months: number): number {
  for (const range of APPROVAL_FACTORS.ACCOUNT_HISTORY.ranges) {
    if (months >= range.value) {
      return range.score;
    }
  }
  return 0;
}

function evaluateExistingLoans(count: number): number {
  for (const range of APPROVAL_FACTORS.EXISTING_LOANS.ranges) {
    if (count <= range.value) {
      return range.score;
    }
  }
  return 0;
}