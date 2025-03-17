import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get secret keys from environment variables
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET in environment variables");
}

/**
 * Generate Access Token (expires in 15 minutes)
 * @param {Object} user - User object containing id, email, and role
 * @returns {string} JWT Access Token
 */
export const generateAccessToken = (user) => {
  if (!user || !user.id || !user.email) {
    throw new Error("User data is invalid");
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "24h" } // Token now lasts for 24 hours
  );
};

/**
 * Generate Refresh Token (expires in 7 days)
 * @param {Object} user - User object containing id and email
 * @returns {string} JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verify Access Token
 * @param {string} token - JWT Access Token
 * @returns {Object} Decoded user data
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT Refresh Token
 * @returns {Object} Decoded user data
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
