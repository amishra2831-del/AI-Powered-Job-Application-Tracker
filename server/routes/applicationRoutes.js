import express from "express";
import {
  getApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
  addNote,
  deleteNote,
  getStats,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/stats", getStats);

router.route("/").get(getApplications).post(createApplication);

router
  .route("/:id")
  .get(getApplication)
  .put(updateApplication)
  .delete(deleteApplication);

router.patch("/:id/status", updateStatus);

router.route("/:id/notes").post(addNote);

router.delete("/:id/notes/:noteId", deleteNote);

export default router;
