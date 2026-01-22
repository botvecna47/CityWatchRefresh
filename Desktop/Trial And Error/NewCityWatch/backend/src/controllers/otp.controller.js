import prisma from '../config/database.js';
import crypto from 'crypto';
import { config } from '../config/env.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP (mock implementation - in production, use SMS gateway)
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number'
      });
    }

    // Check for rate limiting (max 5 OTPs per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await prisma.otpVerification.count({
      where: {
        phone,
        createdAt: { gte: oneHourAgo }
      }
    });

    if (recentOTPs >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again after an hour.'
      });
    }

    // Invalidate previous OTPs
    await prisma.otpVerification.updateMany({
      where: { phone, isUsed: false },
      data: { isUsed: true }
    });

    // Generate and store new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + (config.otp.expiryMinutes || 10) * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        phone,
        otp,
        expiresAt,
        purpose: 'PHONE_VERIFICATION'
      }
    });

    // In production, send SMS here
    // await smsGateway.send(phone, `Your CityWatch OTP is: ${otp}`);

    // For development, log OTP
    console.error(`\n📱 OTP for ${phone}: ${otp}\n`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include OTP in development
      ...(config.nodeEnv === 'development' && { otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required'
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone,
        otp,
        isUsed: false,
        expiresAt: { gte: new Date() }
      }
    });

    if (!otpRecord) {
      // Increment failed attempts
      await prisma.otpVerification.updateMany({
        where: { phone, isUsed: false },
        data: { attempts: { increment: 1 } }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true, verifiedAt: new Date() }
    });

    // Update user as verified
    const user = await prisma.user.update({
      where: { phone },
      data: { isPhoneVerified: true }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PHONE_VERIFIED',
        entityType: 'User',
        entityId: user.id,
        performedById: user.id,
        details: { phone }
      }
    });

    res.json({
      success: true,
      message: 'Phone verified successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  return sendOTP(req, res);
};
