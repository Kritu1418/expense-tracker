import API from "./axios";

export const exportCSVAPI = (params) =>
  API.get("/export/csv", {
    params,
    responseType: "blob",
  });

export const exportPDFAPI = (params) =>
  API.get("/export/pdf", {
    params,
    responseType: "blob",
  });