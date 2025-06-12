const express = require("express");
const router = express.Router();
const { register,getAllUsers,createUser,updateUserRole,deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware")

router.post("/", protect(),register);
router.get("/",  protect(),getAllUsers);
router.post("/create", protect(), createUser);
router.put("/:id", protect(), updateUserRole);
router.delete('/:id', protect(), deleteUser);


module.exports = router;
