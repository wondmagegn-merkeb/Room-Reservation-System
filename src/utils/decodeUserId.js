import { verifyAccessToken } from "./jwt.js"; // Assuming this is your existing token verification function

/**
 * Decode and get the user ID from the access token
 * @param {string} token - The authorization token from cookies
 * @returns {string|null} The user ID or null if the token is invalid
 */
export const decodeUserId = (token) => {
  try {
    // Verify and decode the token
    const decoded = verifyAccessToken(token);
    return decoded.userId || null; // Assuming the decoded token contains userId field
  } catch (error) {
    return null; // Return null if the token is invalid or expired
  }
};

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.cookies.access_token; // Get token from cookies

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing" });
    }

    try {
      // Verify access token and get decoded user data
      const decoded = verifyAccessToken(token);

      // Check if the user role is allowed
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Access Forbidden: Insufficient Role" });
      }

      // Attach user info to request for further processing
      req.user = decoded;

      next(); // Continue to the next middleware or route handler
    } catch (error) {
      return res
        .status(403)
        .json({ message: error.message || "Invalid or expired access token" });
    }
  };
};
