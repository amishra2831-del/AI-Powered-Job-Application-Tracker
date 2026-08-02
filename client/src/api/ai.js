import api from "./axios.js";

export const parseJob = (description) =>
  api.post("/ai/parse-job", { description });
export const uploadResume = (data) => 
  api.post("/ai/upload-resume", data);
export const getMatchScore = (applicationId) =>
  api.post("/ai/match-score", { applicationId });