import API from "./axios";

export const getExpensesAPI = (params) => API.get("/expenses", { params });

export const addExpenseAPI = (data) => API.post("/expenses", data);

export const updateExpenseAPI = (id, data) => API.put(`/expenses/${id}`, data);

export const deleteExpenseAPI = (id) => API.delete(`/expenses/${id}`);

export const deleteMultipleExpensesAPI = (ids) =>
  API.delete("/expenses/bulk", { data: { ids } });

export const getExpenseByIdAPI = (id) => API.get(`/expenses/${id}`);