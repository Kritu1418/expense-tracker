import API from "./axios";

export const loginAPI = (data) => API.post("/auth/login", data);

export const signupAPI = (data) => API.post("/auth/signup", data);

export const getProfileAPI = () => API.get("/auth/profile");

export const updateProfileAPI = (data) => API.put("/auth/profile", data);

export const changePasswordAPI = (data) => API.put("/auth/change-password", data);