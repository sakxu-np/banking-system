import express from 'express';
import auth from '../middleware/auth';

const router = express.Router();

// Define your investment routes here
router.get('/', auth, (req, res) => {
    res.status(200).json({ message: 'Investment routes' });
});

export default router;
