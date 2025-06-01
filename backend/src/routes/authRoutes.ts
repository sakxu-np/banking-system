import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';

const router = express.Router();

// Register route with validation
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.postalCode').notEmpty().withMessage('Postal code is required'),
    body('address.country').notEmpty().withMessage('Country is required')
  ],
  authController.register
);

// Login route with validation
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

export default router;