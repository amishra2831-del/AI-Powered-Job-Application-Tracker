import Application from "../models/Application.js";
import mongoose from "mongoose";

// Get ALL applications for ONLY the logged in user
// @route   GET /api/applications
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id }).sort({
      order: 1,
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new application
// @route   POST /api/applications
export const createApplication = async (req, res) => {
  try {
    const {
      company,
      role,
      status,
      jobUrl,
      location,
      jobType,
      priority,
      salary,
      appliedDate,
      deadline,
      jobDescription,
    } = req.body;

    // Get the highest order number in this status column
    const lastApp = await Application.findOne({
      userId: req.user.id,
      status: status || "Applied",
    }).sort({ order: -1 });

    const order = lastApp ? lastApp.order + 1 : 0;

    const application = await Application.create({
      userId: req.user.id,
      company,
      role,
      status,
      jobUrl,
      location,
      jobType,
      priority,
      salary,
      appliedDate,
      deadline,
      jobDescription,
      order,
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single application
// @route   GET /api/applications/:id
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update application
// @route   PUT /api/applications/:id
export const updateApplication = async (req, res) => {
  try {
    let application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Explicitly update each field
    const fields = [
      "company",
      "role",
      "status",
      "jobUrl",
      "location",
      "jobType",
      "priority",
      "salary",
      "appliedDate",
      "deadline",
      "jobDescription",
      "order",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Delete application
// @route   DELETE /api/applications/:id
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update application status (drag and drop)
// @route   PATCH /api/applications/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { returnDocument: "after", runValidators: true },
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add note to application
// @route   POST /api/applications/:id/notes
export const addNote = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.notes.push({ content: req.body.content });
    await application.save();

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete note from application
// @route   DELETE /api/applications/:id/notes/:noteId
export const deleteNote = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    // filtering out the note
    application.notes = application.notes.filter(
      (note) => note._id.toString() !== req.params.noteId,
    );

    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stats for dashboard
// @route   GET /api/applications/stats
export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Application.countDocuments({ userId });

    const byStatus = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const upcoming = await Application.find({
      userId,
      deadline: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }).sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      data: { total, byStatus, upcoming },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
