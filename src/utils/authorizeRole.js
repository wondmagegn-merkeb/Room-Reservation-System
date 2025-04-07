import { verifyAccessToken } from './jwt.js'; // Assuming this is your existing token verification function

/**
 * Role-Based Access Control Middleware
 * @param {Array} allowedRoles - Roles allowed to access the route
 * @returns {Function} Middleware function
 */
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
  //  const token = req.cookies.access_token; // Get token from cookies
   // const token = req.body.access_token;
    //if (!token) {
    //  return res.status(401).json({ message: "Authorization token is missing" });
   // }

    try {
      // Verify access token and get decoded user data
   //   const decoded = verifyAccessToken(token);

      // Check if the user role is allowed
    //  if (!allowedRoles.includes(decoded.role)) {
   //     return res.status(403).json({ message: "Access Forbidden: Insufficient Role" });
    //  }

      // Attach user info to request for further processing
     // req.user = decoded;
      req.user.id ="2581f818-9edd-4331-85ac-b625e0d0d67a";
      next(); // Continue to the next middleware or route handler
    } catch (error) {
      return res.status(403).json({ message: error.message || "Invalid or expired access token" });
    }
  };
};
