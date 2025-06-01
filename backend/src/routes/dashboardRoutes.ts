import express from 'express';
import auth from '../middleware/auth';
import * as dashboardController from '../controllers/dashboardController';

const router = express.Router();

// Dashboard data endpoints
router.get('/data', auth, dashboardController.getDashboardData);
router.get('/balance-history', auth, dashboardController.getBalanceHistory);
router.get('/income-expenses', auth, dashboardController.getIncomeVsExpenses);
router.get('/spending-categories', auth, dashboardController.getSpendingByCategory);

export default router;
