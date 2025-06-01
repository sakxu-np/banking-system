import express from 'express';
import auth from '../middleware/auth';

const router = express.Router();

// Define your budget routes here
router.get('/', auth, (req, res) => {
    res.status(200).json({ message: 'Budget routes' });
});

export default router;
