import api from "./axios.js";

// All API functions for job applications
// Each function maps to one backend endpoint

export const getApplications = () => api.get("/applications");
export const createApplication = (data) => api.post("/applications", data);
export const updateApplication = (id, data) =>
  api.put(`/applications/${id}`, data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);
export const updateStatus = (id, status) =>
  api.patch(`/applications/${id}/status`, { status });
export const addNote = (id, content) =>
  api.post(`/applications/${id}/notes`, { content });
export const deleteNote = (id, noteId) =>
  api.delete(`/applications/${id}/notes/${noteId}`);
export const getStats = () => api.get("/applications/stats");
