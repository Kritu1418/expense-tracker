const Expense = require("../models/Expense");
const User = require("../models/User");
const { errorResponse, successResponse } = require("../utils/errorResponse");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalExpenses = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentTransactions = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    const user = await User.findById(req.user._id);
    const monthlyTotal = monthlyExpenses[0]?.total || 0;
    const budgetLeft = user.monthlyBudget - monthlyTotal;
    const budgetExceeded = user.monthlyBudget > 0 && monthlyTotal > user.monthlyBudget;

    return successResponse(res, 200, {
      totalExpenses: totalExpenses[0]?.total || 0,
      monthlyTotal,
      monthlyBudget: user.monthlyBudget,
      budgetLeft,
      budgetExceeded,
      recentTransactions,
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getCategoryWise = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { userId: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const data = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return successResponse(res, 200, data);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getMonthlyTrend = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const data = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(`${selectedYear}-01-01`),
            $lte: new Date(`${selectedYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = months.map((month, index) => {
      const found = data.find((d) => d._id.month === index + 1);
      return {
        month,
        total: found ? found.total : 0,
        count: found ? found.count : 0,
      };
    });

    return successResponse(res, 200, formatted);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getPaymentMethodStats = async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return successResponse(res, 200, data);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getTopExpenses = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const data = await Expense.find({ userId: req.user._id })
      .sort({ amount: -1 })
      .limit(Number(limit));

    return successResponse(res, 200, data);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

module.exports = {
  getDashboardStats,
  getCategoryWise,
  getMonthlyTrend,
  getPaymentMethodStats,
  getTopExpenses,
};