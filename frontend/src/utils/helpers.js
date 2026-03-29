import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return format(new Date(date), "dd MMM yyyy");
};

export const formatDateInput = (date) => {
  return format(new Date(date), "yyyy-MM-dd");
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    startDate: format(startOfMonth(now), "yyyy-MM-dd"),
    endDate: format(endOfMonth(now), "yyyy-MM-dd"),
  };
};

export const getLastNMonthsRange = (n) => {
  const now = new Date();
  return {
    startDate: format(startOfMonth(subMonths(now, n)), "yyyy-MM-dd"),
    endDate: format(endOfMonth(now), "yyyy-MM-dd"),
  };
};

export const getBudgetPercentage = (spent, budget) => {
  if (!budget || budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};