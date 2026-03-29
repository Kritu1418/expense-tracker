const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const connectDB = require("./config/db");
const Expense = require("./models/Expense");

dotenv.config();

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.stack);
});

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringExpenses = await Expense.find({
      isRecurring: true,
      nextDueDate: { $lte: today },
    });

    for (const expense of recurringExpenses) {
      const newExpense = new Expense({
        userId: expense.userId,
        amount: expense.amount,
        category: expense.category,
        note: expense.note,
        paymentMethod: expense.paymentMethod,
        isRecurring: true,
        recurringInterval: expense.recurringInterval,
        date: today,
      });

      const next = new Date(today);
      if (expense.recurringInterval === "daily") next.setDate(next.getDate() + 1);
      else if (expense.recurringInterval === "weekly") next.setDate(next.getDate() + 7);
      else if (expense.recurringInterval === "monthly") next.setMonth(next.getMonth() + 1);
      else if (expense.recurringInterval === "yearly") next.setFullYear(next.getFullYear() + 1);

      newExpense.nextDueDate = next;
      await newExpense.save();

      expense.nextDueDate = next;
      await expense.save();
    }

    console.log(`Recurring expenses processed: ${recurringExpenses.length}`);
  } catch (err) {
    console.error("Cron job error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});