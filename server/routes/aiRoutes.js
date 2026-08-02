import express from "express";
import {
  uploadResume,
  parseJob,
  upload,
  getMatchScore,
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/upload-resume", upload.single("resume"), uploadResume);
router.post("/parse-job", parseJob);
router.post("/match-score", getMatchScore);

export default router;
