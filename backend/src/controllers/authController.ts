import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { UserRole, IUser } from '../models/User';

// Type for the JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phoneNumber, dateOfBirth, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      address,
      role: UserRole.USER
    });

    await newUser.save();

    // Create token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Generate JWT token
const generateToken = (user: IUser): string => {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    // Use any to bypass type checking
    return (jwt as any).sign(
      payload,
      Buffer.from(secret),
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};
