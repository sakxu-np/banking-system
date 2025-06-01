import express from 'express';
import auth from '../middleware/auth';

const router = express.Router();

// Define your chatbot routes here
router.post('/message', auth, (req, res) => {
    res.status(200).json({ message: 'Chatbot response placeholder' });
});

export default router;
