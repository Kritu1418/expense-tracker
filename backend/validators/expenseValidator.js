const { body } = require("express-validator");

const expenseValidator = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((val) => val > 0)
    .withMessage("Amount must be greater than 0"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Enter a valid date"),

  body("note")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Note cannot exceed 200 characters"),

  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "upi", "netbanking", "other"])
    .withMessage("Invalid payment method"),

  body("isRecurring")
    .optional()
    .isBoolean()
    .withMessage("isRecurring must be true or false"),

  body("recurringInterval")
    .optional()
    .isIn(["daily", "weekly", "monthly", "yearly", null])
    .withMessage("Invalid recurring interval"),
];

const budgetValidator = [
  body("monthlyBudget")
    .notEmpty()
    .withMessage("Budget is required")
    .isNumeric()
    .withMessage("Budget must be a number")
    .custom((val) => val >= 0)
    .withMessage("Budget cannot be negative"),
];

module.exports = { expenseValidator, budgetValidator };