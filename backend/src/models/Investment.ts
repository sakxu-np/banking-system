import mongoose, { Document, Schema } from 'mongoose';

export enum InvestmentType {
  STOCK = 'stock',
  BOND = 'bond',
  MUTUAL_FUND = 'mutual_fund',
  ETF = 'etf',
  CRYPTOCURRENCY = 'cryptocurrency'
}

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  investmentType: InvestmentType;
  assetName: string;
  ticker: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    investmentType: {
      type: String,
      enum: Object.values(InvestmentType),
      required: true
    },
    assetName: {
      type: String,
      required: true
    },
    ticker: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    purchasePrice: {
      type: Number,
      required: true
    },
    currentPrice: {
      type: Number,
      required: true
    },
    purchaseDate: {
      type: Date,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IInvestment>('Investment', investmentSchema);