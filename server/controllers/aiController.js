import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import multer from "multer";
import User from "../models/User.js";
import Application from "../models/Application.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse");

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      'OPENAI_API_KEY is not configured. AI endpoints will be unavailable.',
    );
    return null;
  }
  return new OpenAI({ apiKey });
};

// Multer config — store file in memory temporarily
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Upload resume (PDF or plain text)
// @route   POST /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    let resumeText = "";

    if (req.file) {
      // PDF uploaded, extract text
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } else if (req.body.resumeText) {
      // Plain text pasted
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF or paste your resume text",
      });
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Resume text is too short — please provide more content",
      });
    }

    // Save to user
    await User.findByIdAndUpdate(req.user.id, {
      resumeText,
      resumeUploadedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Resume saved successfully",
      characterCount: resumeText.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parse job description with AI
// @route   POST /api/ai/parse-job
export const parseJob = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API key is not configured",
      });
    }

    const { description } = req.body;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Please provide a job description",
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Extract information from this job description and return ONLY a JSON object with no extra text, no markdown, no explanation.\n\nJob Description:\n${description}\n\nReturn this exact JSON structure:\n{\n  "company": "company name or empty string if not found",\n  "role": "job title or empty string if not found",\n  "location": "location or empty string if not found",\n  "jobType": "Remote or Hybrid or Onsite or empty string",\n  "salaryMin": null or number,\n  "salaryMax": null or number,\n  "currency": "USD or relevant currency"\n}`,
        },
      ],
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "";

    // Strip markdown code blocks if the model wraps response in them
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned unexpected format, please try again",
      });
    }

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("parseJob error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get resume match score for an application
// @route   POST /api/ai/match-score
export const getMatchScore = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API key is not configured",
      });
    }

    const { applicationId } = req.body;

    // Get user's resume
    const user = await User.findById(req.user.id).select("+resumeText");

    if (!user.resumeText || user.resumeText.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume first",
      });
    }

    // Get application
    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      !application.jobDescription ||
      application.jobDescription.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "This application has no job description to match against",
      });
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a professional career coach. Compare this resume against the job description and return ONLY a JSON object with no extra text, no markdown, no explanation.\n\nRESUME:\n${user.resumeText}\n\nJOB DESCRIPTION:\n${application.jobDescription}\n\nReturn this exact JSON structure:\n{\n  "score": number between 0 and 100,\n  "strengths": ["strength 1", "strength 2", "strength 3"],\n  "gaps": ["gap 1", "gap 2", "gap 3"],\n  "tips": ["tip 1", "tip 2", "tip 3"]\n}`,
        },
      ],
    });

    let rawText = response.choices?.[0]?.message?.content?.trim() || "";

    // Strip markdown code blocks if the model wraps response in them
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned unexpected format, please try again",
      });
    }

    // Save score to application
    await Application.findByIdAndUpdate(applicationId, {
      matchScore: parsed.score,
      matchFeedback: {
        strengths: parsed.strengths,
        gaps: parsed.gaps,
        tips: parsed.tips,
      },
    });

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("getMatchScore error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};