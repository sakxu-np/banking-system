import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Loan, { LoanStatus, LoanType } from '../models/Loan';
import User from '../models/User';
import Account from '../models/Account';
import { evaluateLoanApplication } from '../ai/loanApproval';

export const applyForLoan = async (req: Request, res: Response) => {
  try {
    console.log('Loan application process started');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      accountId,
      loanType,
      amount,
      term,
      purpose,
      creditScore
    } = req.body;

    // Check if account exists and belongs to the user
    const account = await Account.findOne({
      _id: accountId,
      userId: req.user?.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or access denied' });
    }

    // Calculate monthly payment (simple formula)
    // In a real app, we would use a more sophisticated calculation
    const interestRate = 0.05; // 5% initial rate
    const monthlyInterest = interestRate / 12;
    const monthlyPayment = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, term)) /
      (Math.pow(1 + monthlyInterest, term) - 1);

    // Create loan application
    const loan = new Loan({
      userId: req.user?.userId,
      accountId,
      loanType,
      amount,
      interestRate,
      term,
      monthlyPayment,
      status: LoanStatus.PENDING,
      purpose,
      creditScore
    });

    // Evaluate loan application
    const approvalResult = await evaluateLoanApplication(loan);

    // Update loan with approval decision
    if (approvalResult.approved) {
      loan.status = LoanStatus.APPROVED;
      loan.approvalScore = approvalResult.score;
      loan.interestRate = approvalResult.suggestedInterestRate || loan.interestRate;

      // Recalculate monthly payment with approved interest rate
      const approvedMonthlyInterest = loan.interestRate / 12;
      loan.monthlyPayment = (amount * approvedMonthlyInterest * Math.pow(1 + approvedMonthlyInterest, term)) /
        (Math.pow(1 + approvedMonthlyInterest, term) - 1);
    } else {
      loan.status = LoanStatus.REJECTED;
      loan.approvalScore = approvalResult.score;
    }

    console.log('About to save loan to database:', loan);
    try {
      const savedLoan = await loan.save();
      console.log('Loan successfully saved to database:', savedLoan);

      res.status(201).json({
        message: 'Loan application processed',
        loan: savedLoan,
        approvalResult
      });
    } catch (dbError) {
      console.error('Error saving loan to database:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ message: 'Server error processing loan application' });
  }
};

export const getUserLoans = async (req: Request, res: Response) => {
  try {
    console.log('Getting loans for user ID:', req.user?.userId);

    const loans = await Loan.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 });

    console.log('Found loans:', loans);
    console.log('Number of loans found:', loans.length);

    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: 'Server error fetching loans' });
  }
};

export const getLoanById = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findOne({
      _id: loanId,
      userId: req.user?.userId
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found or access denied' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ message: 'Server error fetching loan details' });
  }
};