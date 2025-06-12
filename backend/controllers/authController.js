const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

const login = async (req, res) => {
  const { email, password, timezone } = req.body;

  try {
    console.log("🕓 Received timezone:", timezone);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // ✅ Timezone Validation: e.g., only allow IST
    const allowedTimezones = ["Asia/Kolkata", "Asia/Calcutta", "Etc/GMT-5:30"];
    if (!allowedTimezones.includes(timezone)) {
      return res.status(403).json({ message: "Unauthorized timezone login" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


module.exports = { login };
