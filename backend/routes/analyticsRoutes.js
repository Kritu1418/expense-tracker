const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getCategoryWise,
  getMonthlyTrend,
  getPaymentMethodStats,
  getTopExpenses,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/category", getCategoryWise);
router.get("/monthly", getMonthlyTrend);
router.get("/payment-methods", getPaymentMethodStats);
router.get("/top-expenses", getTopExpenses);

module.exports = router;