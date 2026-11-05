import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

export const usersApi = {
  getMe: () => api.get("/users/me"),
  updateMe: (data) => api.put("/users/me", data),
};


export const vehiclesApi = {
  list: () => api.get("/vehicles/"),
  get: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles/", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const ridesApi = {
  listByVehicle: (vehicleId) => api.get(`/rides/vehicle/${vehicleId}`),
  get: (id) => api.get(`/rides/${id}`),
  create: (data) => api.post("/rides/", data),
  update: (id, data) => api.put(`/rides/${id}`, data),
  delete: (id) => api.delete(`/rides/${id}`),
};

export const expensesApi = {
  listByVehicle: (vehicleId) => api.get(`/expenses/vehicle/${vehicleId}`),
  get: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses/", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const obd2Api = {
  record: (data) => api.post("/obd2/record", data),
  history: (vehicleId, limit = 100) => api.get(`/obd2/history/${vehicleId}?limit=${limit}`),
  status: () => api.get("/obd2/status"),
};

export const dashboardApi = {
  get: (year) => api.get(`/dashboard/${year ? `?year=${year}` : ""}`),
};

export const reportsApi = {
  ridesExcel: () => api.get("/reports/rides/excel", { responseType: "blob" }),
  expensesExcel: () => api.get("/reports/expenses/excel", { responseType: "blob" }),
  ridesPdf: () => api.get("/reports/rides/pdf", { responseType: "blob" }),
};

export default api;