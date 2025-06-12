const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  }, // Auto-generated: A1, UM1, U1
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["SUPERADMIN", "ADMIN", "UNIT_MANAGER", "USER"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  group: {
    type: String, // Can be later used for AdminGroup1, UnitGroupAlpha etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Auto-generate userId on creation
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const prefix = this.role === "ADMIN"
      ? "A"
      : this.role === "UNIT_MANAGER"
      ? "UM"
      : this.role === "USER"
      ? "U"
      : "SA"; // For SUPERADMIN

    const count = await mongoose.model("User").countDocuments({ role: this.role });
    this.userId = `${prefix}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
