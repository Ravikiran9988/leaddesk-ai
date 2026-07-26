import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'fallback_jwt_secret_key_change_in_production',
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = async (user, ipAddress = '') => {
  const tokenString = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const refreshToken = await RefreshToken.create({
    user: user._id,
    token: tokenString,
    expiresAt,
    createdByIp: ipAddress,
  });

  return refreshToken.token;
};

export const verifyAndRotateRefreshToken = async (tokenString, ipAddress = '') => {
  const existingToken = await RefreshToken.findOne({
    token: tokenString,
    revokedAt: null,
  }).populate('user');

  if (!existingToken || existingToken.expiresAt < new Date() || !existingToken.user) {
    throw new Error('Invalid or expired refresh token');
  }

  existingToken.revokedAt = new Date();
  await existingToken.save();

  const newAccessToken = generateAccessToken(existingToken.user);
  const newRefreshToken = await generateRefreshToken(existingToken.user, ipAddress);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: existingToken.user,
  };
};

export const revokeRefreshToken = async (tokenString) => {
  if (!tokenString) return;
  await RefreshToken.updateOne({ token: tokenString }, { revokedAt: new Date() });
};
