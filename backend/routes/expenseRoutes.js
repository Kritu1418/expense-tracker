const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  deleteMultipleExpenses,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/auth");
const { expenseValidator } = require("../validators/expenseValidator");

router.use(protect);

router.route("/").get(getExpenses).post(expenseValidator, addExpense);
router.delete("/bulk", deleteMultipleExpenses);
router
  .route("/:id")
  .get(getExpenseById)
  .put(expenseValidator, updateExpense)
  .delete(deleteExpense);

module.exports = router;