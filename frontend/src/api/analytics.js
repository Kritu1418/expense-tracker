import API from "./axios";

export const getDashboardStatsAPI = () => API.get("/analytics/dashboard");

export const getCategoryWiseAPI = (params) =>
  API.get("/analytics/category", { params });

export const getMonthlyTrendAPI = (params) =>
  API.get("/analytics/monthly", { params });

export const getPaymentMethodStatsAPI = () =>
  API.get("/analytics/payment-methods");

export const getTopExpensesAPI = (params) =>
  API.get("/analytics/top-expenses", { params });