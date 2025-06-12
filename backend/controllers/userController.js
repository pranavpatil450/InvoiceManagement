const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Static counter (in real app, replace with DB logic)
let counters = { A: 1, UM: 1, U: 1 };

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const createdBy = req.user?.userId || null;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    let creator = null;
    let normalizedRole = role.trim().toUpperCase().replace(/\s+/g, "_");

    if (createdBy) {
      creator = await User.findOne({ userId: createdBy });
      if (!creator) return res.status(400).json({ message: "Creator not found" });

      const creatorRole = creator.role.trim().toUpperCase();

      if (
        (creatorRole === "SUPERADMIN" && normalizedRole !== "ADMIN") ||
        (creatorRole === "ADMIN" && normalizedRole !== "UNIT_MANAGER") ||
        (creatorRole === "UNIT_MANAGER" && normalizedRole !== "USER") ||
        creatorRole === "USER"
      ) {
        return res.status(403).json({ message: "Not authorized to create this role" });
      }
    } else if (normalizedRole !== "ADMIN") {
      return res.status(403).json({ message: "Only SUPERADMIN can create ADMIN" });
    }

    let userId;
    if (normalizedRole === "ADMIN") userId = `A${counters.A++}`;
    else if (normalizedRole === "UNIT_MANAGER") userId = `UM${counters.UM++}`;
    else if (normalizedRole === "USER") userId = `U${counters.U++}`;
    else return res.status(400).json({ message: "Invalid role" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      createdBy: creator ? creator._id : null,
    });

    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query = {};
    if (role) {
      query.role = role.toUpperCase().replace(/\s+/g, "_");
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: new RegExp(search, "i") }
      ];
    }

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

    const total = await User.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const creator = req.user;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedRole = role.trim().toUpperCase().replace(/\s+/g, "_");
    const creatorRole = creator.role.trim().toUpperCase();

    console.log("Creator Role:", creatorRole);
    console.log("Target Role:", normalizedRole);

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (creatorRole === "SUPERADMIN" && normalizedRole !== "ADMIN") {
      return res.status(403).json({ message: "SuperAdmin can only create ADMIN users" });
    }

    if (creatorRole === "ADMIN" && normalizedRole !== "UNIT_MANAGER") {
      return res.status(403).json({ message: "Admin can only create UNIT_MANAGER users" });
    }

    if (creatorRole === "UNIT_MANAGER" && normalizedRole !== "USER") {
      return res.status(403).json({ message: "Unit Manager can only create USERs" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      role: normalizedRole,
      password: hashedPassword,
      createdBy: creator._id,
    });

    res.status(201).json({ message: "User created", userId: newUser.userId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    let { role } = req.body;
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUserRole = req.user.role.trim().toUpperCase();
    const targetRole = role.trim().toUpperCase().replace(/\s+/g, "_");

    if (currentUserRole === "SUPERADMIN" && targetRole !== "ADMIN") {
      return res.status(403).json({ message: "SUPERADMIN can only assign ADMIN role" });
    }

    if (currentUserRole === "ADMIN" && targetRole !== "UNIT_MANAGER") {
      return res.status(403).json({ message: "ADMIN can only assign UNIT_MANAGER role" });
    }

    if (currentUserRole === "UNIT_MANAGER" && targetRole !== "USER") {
      return res.status(403).json({ message: "UNIT_MANAGER can only assign USER role" });
    }

    userToUpdate.role = targetRole;
    await userToUpdate.save();

    res.json({ message: "User role updated successfully", user: userToUpdate });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
};
