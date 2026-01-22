import { Router } from 'express';
import { sendOTP, verifyOTP, resendOTP } from '../controllers/otp.controller.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = Router();

// Phone validation
const phoneValidation = [
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian phone number')
];

// OTP validation
const otpValidation = [
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
];

// Send OTP
router.post('/send', phoneValidation, validate, sendOTP);

// Verify OTP
router.post('/verify', [...phoneValidation, ...otpValidation], validate, verifyOTP);

// Resend OTP
router.post('/resend', phoneValidation, validate, resendOTP);

export default router;
