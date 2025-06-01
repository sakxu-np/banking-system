import express from 'express';
import auth from '../middleware/auth';
import * as loanController from '../controllers/loanController';

const router = express.Router();

// Define your loan routes here
router.get('/', auth, (req, res) => {
    // Forward to getUserLoans to actually get the user's loans instead of just a message
    console.log('Root loan route accessed, forwarding to getUserLoans');
    loanController.getUserLoans(req, res);
});

// Route for loan application
router.post('/apply', auth, (req, res) => {
    console.log('Loan application received:', req.body);
    console.log('User from token:', req.user);
    loanController.applyForLoan(req, res);
});

// Route to get all loans for the current user
router.get('/my-loans', auth, (req, res) => {
    console.log('Getting loans for user:', req.user);
    loanController.getUserLoans(req, res);
});

// Route to get a specific loan by ID
router.get('/:loanId', auth, loanController.getLoanById);

export default router;
