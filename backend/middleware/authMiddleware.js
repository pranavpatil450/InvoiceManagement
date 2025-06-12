const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = () => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user based on custom userId
    const user = await User.findOne({ userId: decoded.userId }).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach required fields explicitly to req.user
    req.user = {
      _id: user._id,           // MongoDB ObjectId (for ObjectId-based fields)
      userId: user.userId,     // Your custom ID like "SA1"
      role: user.role,
      group: user.group,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { protect };
