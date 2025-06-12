const express = require("express");
const router = express.Router();
const { createInvoice,updateInvoice,deleteInvoice,getInvoices } = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect(), createInvoice);
router.put("/:invoiceNumber/:financialYear", protect(), updateInvoice);
router.delete("/:invoiceNumber/:financialYear", protect(), deleteInvoice);
router.get("/", protect(), getInvoices);

module.exports = router;
