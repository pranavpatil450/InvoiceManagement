const Invoice = require("../models/Invoice");
const getFinancialYear = require("../utils/getFinancialYear");

const createInvoice = async (req, res) => {
  try {
    const { invoiceDate, invoiceAmount, financialYear } = req.body; // ✅ include from body
    const userId = req.user._id;

    if (!invoiceDate || !invoiceAmount || !financialYear) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Use the user-supplied financial year directly
    const lastInvoice = await Invoice.findOne({ financialYear, createdBy: userId }).sort({ invoiceNumber: -1 });
    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    const previous = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNumber - 1,
    });

    const next = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNumber + 1,
    });

    const inputDate = new Date(invoiceDate);

    if (previous && inputDate < previous.invoiceDate) {
      return res.status(400).json({ message: `Invoice date must be after invoice #${previous.invoiceNumber}` });
    }

    if (next && inputDate > next.invoiceDate) {
      return res.status(400).json({ message: `Invoice date must be before invoice #${next.invoiceNumber}` });
    }

    const invoice = new Invoice({
      invoiceNumber,
      invoiceDate,
      invoiceAmount,
      financialYear, // ✅ use as provided
      createdBy: req.user._id,
    });

    await invoice.save();

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { invoiceNumber, financialYear } = req.params;
    const { invoiceDate, invoiceAmount, newFinancialYear } = req.body; // 👈 Add newFinancialYear

    const invoiceNum = Number(invoiceNumber);
    const invoice = await Invoice.findOne({ invoiceNumber: invoiceNum, financialYear });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const previous = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNum - 1,
    });

    const next = await Invoice.findOne({
      financialYear,
      invoiceNumber: invoiceNum + 1,
    });

    if (invoiceDate) {
      const inputDate = new Date(invoiceDate);

      if (previous && inputDate < previous.invoiceDate) {
        return res.status(400).json({
          message: `Invoice date must be after invoice #${previous.invoiceNumber}`,
        });
      }

      if (next && inputDate > next.invoiceDate) {
        return res.status(400).json({
          message: `Invoice date must be before invoice #${next.invoiceNumber}`,
        });
      }

      invoice.invoiceDate = inputDate;
    }

    if (invoiceAmount !== undefined) {
      invoice.invoiceAmount = invoiceAmount;
    }

    // ✅ Update financial year if provided and different
    if (newFinancialYear && newFinancialYear !== invoice.financialYear) {
      invoice.financialYear = newFinancialYear;
    }

    await invoice.save();

    res.status(200).json({ message: "Invoice updated successfully", invoice });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteInvoice = async (req, res) => {
  try {
    const { invoiceNumber, financialYear } = req.params;

    const deleted = await Invoice.findOneAndDelete({ invoiceNumber, financialYear });

    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};


const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      financialYear,
      invoiceNumber,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // Basic filters
    if (financialYear) {
      query.financialYear = financialYear;
    }

    if (invoiceNumber) {
      query.invoiceNumber = Number(invoiceNumber);
    }

    if (startDate && endDate) {
      query.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Role-based filtering
    const user = req.user;

    if (user.role === "ADMIN") {
      // Get UMs and Users created by this admin or by other admins in the same group
      const sameGroupAdmins = await User.find({ group: user.group, role: "ADMIN" });
      const adminIds = sameGroupAdmins.map(a => a.userId).concat(user.userId);

      const unitManagers = await User.find({ createdBy: { $in: adminIds }, role: "UNIT_MANAGER" });
      const unitManagerIds = unitManagers.map(um => um.userId);

      const users = await User.find({ createdBy: { $in: unitManagerIds }, role: "USER" });
      const userIds = users.map(u => u.userId);

      query.createdBy = { $in: [...adminIds, ...unitManagerIds, ...userIds] };

    } else if (user.role === "UNIT_MANAGER") {
      // See their invoices + their users (including group members)
      const groupUMs = await User.find({ group: user.group, role: "UNIT_MANAGER" });
      const umIds = groupUMs.map(u => u.userId).concat(user.userId);

      const users = await User.find({ createdBy: { $in: umIds }, role: "USER" });
      const userIds = users.map(u => u.userId);

      query.createdBy = { $in: [...umIds, ...userIds] };

    } else if (user.role === "USER") {
      query.createdBy = user.userId;
    }

    // SUPERADMIN case - skip filtering if needed

    const invoices = await Invoice.find(query)
      .sort({ invoiceNumber: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      invoices,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("Get invoices error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { createInvoice,
                   updateInvoice,
                   deleteInvoice,
                   getInvoices,
 };
