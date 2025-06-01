import { ITransaction } from '../models/Transaction';
import User from '../models/User';
import Account from '../models/Account';
import Transaction from '../models/Transaction';

// Fraud detection rules
const RULES = {
  LARGE_AMOUNT: {
    threshold: 5000,
    weight: 0.4,
    description: 'Transaction amount exceeds threshold'
  },
  UNUSUAL_LOCATION: {
    weight: 0.5,
    description: 'Transaction from unusual location'
  },
  FREQUENCY: {
    threshold: 5, // transactions per hour
    timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
    weight: 0.3,
    description: 'High transaction frequency'
  },
  UNUSUAL_TIME: {
    weight: 0.2,
    description: 'Transaction at unusual time'
  },
  PATTERN_CHANGE: {
    weight: 0.4,
    description: 'Unusual spending pattern'
  }
};

export interface FraudDetectionResult {
  score: number;
  isFraudulent: boolean;
  factors: string[];
  recommendation: string;
}

export async function analyzeFraudRisk(transaction: ITransaction): Promise<FraudDetectionResult> {
  const factors: string[] = [];
  let score = 0;

  // Check for large amount
  if (transaction.amount > RULES.LARGE_AMOUNT.threshold) {
    score += RULES.LARGE_AMOUNT.weight;
    factors.push(RULES.LARGE_AMOUNT.description);
  }

  // Check transaction frequency
  const recentTransactions = await Transaction.find({
    accountId: transaction.accountId,
    createdAt: { $gt: new Date(Date.now() - RULES.FREQUENCY.timeWindow) }
  }).countDocuments();

  if (recentTransactions > RULES.FREQUENCY.threshold) {
    score += RULES.FREQUENCY.weight;
    factors.push(RULES.FREQUENCY.description);
  }

  // Simulate pattern-based detection
  // In a real system, this would use ML models or more sophisticated analysis
  if (Math.random() < 0.1) {
    score += RULES.PATTERN_CHANGE.weight;
    factors.push(RULES.PATTERN_CHANGE.description);
  }

  // For simulation purposes, we'll randomly add the unusual time factor
  if (isUnusualTime()) {
    score += RULES.UNUSUAL_TIME.weight;
    factors.push(RULES.UNUSUAL_TIME.description);
  }

  // Determine if fraudulent
  const isFraudulent = score >= 0.6;
  let recommendation = 'Transaction is normal';

  if (score >= 0.8) {
    recommendation = 'Block transaction and contact customer';
  } else if (score >= 0.6) {
    recommendation = 'Flag for review and request additional verification';
  } else if (score >= 0.3) {
    recommendation = 'Monitor closely';
  }

  return {
    score,
    isFraudulent,
    factors,
    recommendation
  };
}

// Helper function to simulate unusual time detection
function isUnusualTime(): boolean {
  const hour = new Date().getHours();
  // Consider 1AM-5AM as unusual banking hours
  return hour >= 1 && hour <= 5 && Math.random() < 0.7;
}