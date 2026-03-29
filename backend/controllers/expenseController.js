const { validationResult } = require("express-validator");
const Expense = require("../models/Expense");
const User = require("../models/User");
const { errorResponse, successResponse } = require("../utils/errorResponse");

const addExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    const { amount, category, date, note, paymentMethod, isRecurring, recurringInterval } = req.body;

    let nextDueDate = null;
    if (isRecurring && recurringInterval) {
      const d = new Date(date);
      if (recurringInterval === "daily") d.setDate(d.getDate() + 1);
      else if (recurringInterval === "weekly") d.setDate(d.getDate() + 7);
      else if (recurringInterval === "monthly") d.setMonth(d.getMonth() + 1);
      else if (recurringInterval === "yearly") d.setFullYear(d.getFullYear() + 1);
      nextDueDate = d;
    }

    const expense = await Expense.create({
      userId: req.user._id,
      amount,
      category,
      date,
      note,
      paymentMethod,
      isRecurring,
      recurringInterval,
      nextDueDate,
    });

    return successResponse(res, 201, expense, "Expense added");
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      search,
      sortBy = "date",
      order = "desc",
    } = req.query;

    const filter = { userId: req.user._id };

    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.note = { $regex: search, $options: "i" };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortField = sortBy === "amount" ? "amount" : "date";

    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 200, {
      expenses,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return errorResponse(res, 404, "Expense not found");
    }

    return successResponse(res, 200, expense);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return errorResponse(res, 404, "Expense not found");
    }

    const { amount, category, date, note, paymentMethod, isRecurring, recurringInterval } = req.body;

    let nextDueDate = null;
    if (isRecurring && recurringInterval) {
      const d = new Date(date);
      if (recurringInterval === "daily") d.setDate(d.getDate() + 1);
      else if (recurringInterval === "weekly") d.setDate(d.getDate() + 7);
      else if (recurringInterval === "monthly") d.setMonth(d.getMonth() + 1);
      else if (recurringInterval === "yearly") d.setFullYear(d.getFullYear() + 1);
      nextDueDate = d;
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, date, note, paymentMethod, isRecurring, recurringInterval, nextDueDate },
      { new: true, runValidators: true }
    );

    return successResponse(res, 200, updated, "Expense updated");
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return errorResponse(res, 404, "Expense not found");
    }

    await expense.deleteOne();

    return successResponse(res, 200, null, "Expense deleted");
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const deleteMultipleExpenses = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 400, "No expense IDs provided");
    }

    await Expense.deleteMany({ _id: { $in: ids }, userId: req.user._id });

    return successResponse(res, 200, null, "Expenses deleted");
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  deleteMultipleExpenses,
};