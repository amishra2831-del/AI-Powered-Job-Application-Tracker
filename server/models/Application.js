import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const contactSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  role: { type: String, trim: true },
  email: { type: String, trim: true },
  linkedin: { type: String, trim: true },
});

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Saved", "Applied", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite", ""],
      default: "",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
     notes: [noteSchema],
    contacts: [contactSchema],
    order: {
      type: Number,
      default: 0,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    matchScore: {
      type: Number,
      default: null,
    },
    matchFeedback: {
      strengths: [String],
      gaps: [String],
      tips: [String],
    },
  },
  { timestamps: true },
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;