import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // We assume the payload from login/signup was { user: { id: '...' } }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Set req.user to the payload { id: '...' }
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};