import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  register,
  login,
  logout,
  refreshToken,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
} from "../controllers/authController";
import { getGoogleAuthUrl, googleCallback, verifyGoogleToken } from "../controllers/googleAuthController";
import { verifyCaptcha, accountLockout } from "../middleware/security";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @security CAPTCHA required to prevent spam signups
 */
router.post("/register", verifyCaptcha, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 * @security Account lockout after 5 failed attempts
 */
router.post("/login", accountLockout, login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post("/logout", authenticate, logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post("/refresh-token", authenticate, refreshToken);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Get Google OAuth URL
 * @access  Public
 */
router.get("/google", getGoogleAuthUrl);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get("/google/callback", googleCallback);

/**
 * @route   POST /api/v1/auth/google/verify
 * @desc    Verify Google ID token (for frontend Sign-In button)
 * @access  Public
 */
router.post("/google/verify", verifyGoogleToken);

/**
 * @route   POST /api/v1/auth/send-verification
 * @desc    Send email verification link
 * @access  Private
 */
router.post("/send-verification", authenticate, sendVerificationEmail);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post("/verify-email", verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @security CAPTCHA required to prevent abuse
 */
router.post("/forgot-password", verifyCaptcha, forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password", resetPassword);

export default router;
