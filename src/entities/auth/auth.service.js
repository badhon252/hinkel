import User from './auth.model.js';
import jwt from 'jsonwebtoken';
import {
  refreshTokenSecrete,
  emailExpires,
  emailFrom
} from '../../core/config/config.js';
import sendEmail from '../../lib/sendEmail.js';
import verificationCodeTemplate from '../../lib/emailTemplates.js';

const OTP_PURPOSE = {
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset'
};

const RESEND_COOLDOWN_MS = 60 * 1000;

const getOtpExpiryMinutes = () => Math.max(1, Math.ceil(emailExpires / (60 * 1000)));

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const maskEmail = (email) => {
  const [localPart = '', domain = ''] = email.split('@');
  if (!localPart || !domain) return email;

  const visible = localPart.length <= 2
    ? `${localPart[0] || ''}*`
    : `${localPart.slice(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}`;

  return `${visible}@${domain}`;
};

const buildVerificationMeta = (email) => ({
  email,
  maskedEmail: maskEmail(email),
  expiresInMinutes: getOtpExpiryMinutes(),
  resendCooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000)
});

const assignOtp = (user, purpose) => {
  user.otp = generateOtp();
  user.otpExpires = new Date(Date.now() + emailExpires);
  user.otpPurpose = purpose;
  user.otpLastSentAt = new Date();

  if (purpose === OTP_PURPOSE.PASSWORD_RESET) {
    user.otpVerified = false;
    user.resetExpires = null;
  }
};

const isWithinResendCooldown = (user) =>
  Boolean(
    user.otpLastSentAt &&
      Date.now() - new Date(user.otpLastSentAt).getTime() < RESEND_COOLDOWN_MS
  );

const ensureResendCooldown = (user) => {
  if (isWithinResendCooldown(user)) {
    throw new Error('Please wait before requesting a new verification code');
  }
};

const sendOtpEmail = async ({ email, name, otp, purpose }) => {
  await sendEmail({
    to: email,
    subject:
      purpose === OTP_PURPOSE.EMAIL_VERIFICATION
        ? 'Verify your Hinkle account'
        : 'Your Hinkle password reset code',
    html: verificationCodeTemplate({
      code: otp,
      recipientName: name,
      brandName: 'Hinkle',
      supportEmail: emailFrom,
      expiresInMinutes: getOtpExpiryMinutes(),
      purpose
    })
  });
};

const ensureOtpMatches = (user, otp, expectedPurpose) => {
  if (!user.otp || !user.otpExpires || user.otpPurpose !== expectedPurpose) {
    throw new Error('Otp not found');
  }

  if (
    String(user.otp) !== String(otp).trim() ||
    Date.now() > user.otpExpires.getTime()
  ) {
    throw new Error('Invalid or expired otp');
  }
};

export const registerUserService = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser?.isVerified) {
    throw new Error('User already registered.');
  }

  if (existingUser && !existingUser.isVerified) {
    if (!isWithinResendCooldown(existingUser)) {
      assignOtp(existingUser, OTP_PURPOSE.EMAIL_VERIFICATION);
      await existingUser.save({ validateBeforeSave: false });
      await sendOtpEmail({
        email: existingUser.email,
        name: existingUser.name,
        otp: existingUser.otp,
        purpose: OTP_PURPOSE.EMAIL_VERIFICATION
      });
    }

    return {
      alreadyPendingVerification: true,
      ...buildVerificationMeta(existingUser.email)
    };
  }

  const newUser = new User({
    name,
    email: normalizedEmail,
    password,
    isVerified: false
  });

  assignOtp(newUser, OTP_PURPOSE.EMAIL_VERIFICATION);

  const user = await newUser.save();

  await sendOtpEmail({
    email: user.email,
    name: user.name,
    otp: user.otp,
    purpose: OTP_PURPOSE.EMAIL_VERIFICATION
  });

  return buildVerificationMeta(user.email);
};

export const verifyEmailService = async ({ email, otp }) => {
  if (!email || !otp) throw new Error('Email and otp are required');

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error('Invalid email');
  if (user.isVerified) throw new Error('Email already verified');

  ensureOtpMatches(user, otp, OTP_PURPOSE.EMAIL_VERIFICATION);

  user.otp = null;
  user.otpExpires = null;
  user.otpPurpose = null;
  user.otpLastSentAt = null;
  user.otpVerified = true;
  user.isVerified = true;
  user.resetExpires = null;

  await user.save({ validateBeforeSave: false });

  return {
    email: user.email,
    isVerified: true
  };
};

export const resendVerificationEmailService = async (email) => {
  if (!email) throw new Error('Email is required');

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error('Invalid email');
  if (user.isVerified) throw new Error('Email already verified');

  ensureResendCooldown(user);
  assignOtp(user, OTP_PURPOSE.EMAIL_VERIFICATION);
  await user.save({ validateBeforeSave: false });

  await sendOtpEmail({
    email: user.email,
    name: user.name,
    otp: user.otp,
    purpose: OTP_PURPOSE.EMAIL_VERIFICATION
  });

  return buildVerificationMeta(user.email);
};

export const loginUserService = async ({ email, password }) => {
  if (!email || !password) throw new Error('Email and password are required');

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select(
    '_id name lastName email role profileImage refreshToken isVerified otpLastSentAt'
  );

  if (!user) throw new Error('User not found');

  const isMatch = await user.comparePassword(user._id, password);
  if (!isMatch) throw new Error('Invalid password');

  if (!user.isVerified) {
    if (!isWithinResendCooldown(user)) {
      assignOtp(user, OTP_PURPOSE.EMAIL_VERIFICATION);
      await user.save({ validateBeforeSave: false });

      await sendOtpEmail({
        email: user.email,
        name: user.name,
        otp: user.otp,
        purpose: OTP_PURPOSE.EMAIL_VERIFICATION
      });
    }

    return {
      verificationRequired: true,
      ...buildVerificationMeta(user.email)
    };
  }

  const payload = { _id: user._id, role: user.role };

  user.refreshToken = user.generateRefreshToken(payload);
  await user.save({ validateBeforeSave: false });

  return {
    user,
    accessToken: user.generateAccessToken(payload),
    refreshToken: user.refreshToken
  };
};

export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error('No refresh token provided');

  const user = await User.findOne({ refreshToken });

  if (!user) throw new Error('Invalid refresh token');

  const decoded = jwt.verify(refreshToken, refreshTokenSecrete);

  if (!decoded || decoded._id !== user._id.toString()) {
    throw new Error('Invalid refresh token');
  }

  const payload = { _id: user._id, role: user.role };

  const accessToken = user.generateAccessToken(payload);
  const newRefreshToken = user.generateRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken: newRefreshToken
  };
};

export const forgetPasswordService = async (email) => {
  if (!email) throw new Error('Email is required');

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error('Invalid email');

  assignOtp(user, OTP_PURPOSE.PASSWORD_RESET);

  await user.save({ validateBeforeSave: false });

  await sendOtpEmail({
    email: user.email,
    name: user.name,
    otp: user.otp,
    purpose: OTP_PURPOSE.PASSWORD_RESET
  });

  return {
    email: user.email,
    expiresInMinutes: getOtpExpiryMinutes()
  };
};

export const verifyCodeService = async ({ email, otp }) => {
  if (!email || !otp) throw new Error('Email and otp are required');

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error('Invalid email');

  ensureOtpMatches(user, otp, OTP_PURPOSE.PASSWORD_RESET);

  user.otp = null;
  user.otpExpires = null;
  user.otpPurpose = null;
  user.otpLastSentAt = null;
  user.otpVerified = true;
  user.resetExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({ validateBeforeSave: false });
};

export const resetPasswordService = async ({ email, newPassword }) => {
  if (!email || !newPassword) {
    throw new Error('Email and new password are required');
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) throw new Error('Invalid email');

  if (!user.otpVerified || !user.resetExpires) {
    throw new Error('otp not cleared');
  }

  if (Date.now() > user.resetExpires.getTime()) {
    throw new Error('Reset session expired');
  }

  user.password = newPassword;
  user.otpVerified = false;
  user.resetExpires = null;
  user.otp = null;
  user.otpExpires = null;
  user.otpPurpose = null;
  user.otpLastSentAt = null;

  await user.save();
};

export const changePasswordService = async ({ userId, oldPassword, newPassword }) => {
  if (!userId || !oldPassword || !newPassword) {
    throw new Error('User id, old password and new password are required');
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const isMatch = await user.comparePassword(userId, oldPassword);
  if (!isMatch) throw new Error('Invalid old password');

  user.password = newPassword;
  await user.save();
};
