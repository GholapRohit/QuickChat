import jwt from "jsonwebtoken"; // Library for creating and verifying JWTs

// Generates a JWT for a given user.
export const generateToken = (userID) => {
  return jwt.sign(
    { id: userID }, // Payload: store user ID in the token
    process.env.JWT_SECRET, // Secret key for signing (kept in environment variable)
    { expiresIn: "7d" } // Token expiry time (7 days)
  );
};
