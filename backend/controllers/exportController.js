const Expense = require("../models/Expense");
const { errorResponse } = require("../utils/errorResponse");

const exportCSV = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    if (expenses.length === 0) {
      return errorResponse(res, 404, "No expenses found to export");
    }

    const headers = ["Date", "Amount", "Category", "Payment Method", "Note", "Recurring"];

    const rows = expenses.map((e) => [
      new Date(e.date).toLocaleDateString("en-IN"),
      e.amount,
      e.category,
      e.paymentMethod,
      e.note ? `"${e.note.replace(/"/g, '""')}"` : "",
      e.isRecurring ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=expenses_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const exportPDF = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    if (expenses.length === 0) {
      return errorResponse(res, 404, "No expenses found to export");
    }

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    let tableRows = "";
    expenses.forEach((e, i) => {
      const bg = i % 2 === 0 ? "#f9f9f9" : "#ffffff";
      tableRows += `
        <tr style="background:${bg}">
          <td>${new Date(e.date).toLocaleDateString("en-IN")}</td>
          <td>₹${e.amount.toLocaleString("en-IN")}</td>
          <td>${e.category}</td>
          <td>${e.paymentMethod}</td>
          <td>${e.note || "-"}</td>
          <td>${e.isRecurring ? "Yes" : "No"}</td>
        </tr>`;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
          h1 { color: #4f46e5; margin-bottom: 4px; }
          p { margin: 2px 0; font-size: 13px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #4f46e5; color: white; padding: 10px; text-align: left; }
          td { padding: 9px 10px; border-bottom: 1px solid #eee; }
          .total { margin-top: 16px; font-size: 15px; font-weight: bold; text-align: right; color: #4f46e5; }
        </style>
      </head>
      <body>
        <h1>Expense Report</h1>
        <p>Generated: ${new Date().toLocaleDateString("en-IN")}</p>
        <p>Total Records: ${expenses.length}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Payment</th>
              <th>Note</th>
              <th>Recurring</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="total">Total: ₹${totalAmount.toLocaleString("en-IN")}</div>
      </body>
      </html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename=expenses_${Date.now()}.html`);
    res.status(200).send(html);
  } catch (err) {
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

module.exports = { exportCSV, exportPDF };