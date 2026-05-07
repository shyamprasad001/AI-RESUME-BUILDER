import mongoose from "mongoose";
import Resume from "../models/Resume.model.js";
import normalizeCertifications from "../utils/normalizeCertifications.js";

// Strip invalid _id fields from subdocument arrays before saving.
// The client generates temporary _id values (e.g., Date.now().toString())
// that are not valid ObjectIds and cause Mongoose CastErrors.
const sanitizeSections = (sections) => {
  if (!sections) return sections;
  const cleaned = { ...sections };
  const arrayFields = ["experience", "education", "projects"];

  for (const field of arrayFields) {
    if (Array.isArray(cleaned[field])) {
      cleaned[field] = cleaned[field].map(({ _id, ...rest }) => {
        const item = { ...rest };

        // Normalize description (often returned as array by AI)
        if (item.description && Array.isArray(item.description)) {
          item.description = item.description.join(" ");
        }

        if (_id && mongoose.Types.ObjectId.isValid(_id)) {
          return { _id, ...item };
        }
        return item;
      });
    }
  }

  // Certifications require special normalization — any input format is safe
  cleaned.certifications = normalizeCertifications(cleaned.certifications);

  return cleaned;
};

export const createResume = async (userId, data = {}) => {
  const resume = await Resume.create({
    userId,
    title: data.title || "Untitled Resume",
    templateId: data.templateId || "classic",
    targetRole: data.targetRole || "",
  });
  return resume;
};

export const getResumesByUser = async (userId) => {
  const resumes = await Resume.find({ userId })
    .sort({ updatedAt: -1 })
    .select("-__v");
  return resumes;
};

export const getResumeById = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId }).select("-__v");
  if (!resume) {
    const error = new Error("Resume not found.");
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const updateResume = async (resumeId, userId, updateData) => {
  if (updateData.sections) {
    updateData.sections = sanitizeSections(updateData.sections);
  }
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: updateData },
    { returnDocument: "after" },
  );
  if (!resume) {
    const error = new Error("Resume not found.");
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const updateSection = async (
  resumeId,
  userId,
  sectionName,
  sectionData,
) => {
  const arrayFields = ["experience", "education", "projects"];
  let cleanData = sectionData;

  if (sectionName === "certifications") {
    // normalizeCertifications handles strings, arrays, nulls — never throws
    cleanData = normalizeCertifications(sectionData);
  } else if (arrayFields.includes(sectionName) && Array.isArray(sectionData)) {
    cleanData = sectionData.map(({ _id, ...rest }) => {
      const item = { ...rest };

      // Normalize description for projects
      if (sectionName === "projects" && item.description && Array.isArray(item.description)) {
        item.description = item.description.join(" ");
      }

      if (_id && mongoose.Types.ObjectId.isValid(_id)) {
        return { _id, ...item };
      }
      return item;
    });
  }

  const updateKey = `sections.${sectionName}`;
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { [updateKey]: cleanData } },
    { returnDocument: "after" },
  );
  if (!resume) {
    const error = new Error("Resume not found.");
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const updateTemplate = async (resumeId, userId, templateId) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: { templateId } },
    { returnDocument: "after" },
  );
  if (!resume) {
    const error = new Error("Resume not found.");
    error.statusCode = 404;
    throw error;
  }
  return resume;
};

export const createFromUpload = async (
  userId,
  parsedSections,
  title = "Uploaded Resume",
) => {
  // Sanitize full sections (including certifications normalization)
  const safeSections = sanitizeSections(parsedSections ?? {});
  const resume = await Resume.create({
    userId,
    title,
    templateId: "classic",
    sections: safeSections,
  });
  return resume;
};

export const deleteResume = async (resumeId, userId) => {
  const resume = await Resume.findOneAndDelete({ _id: resumeId, userId });
  if (!resume) {
    const error = new Error("Resume not found.");
    error.statusCode = 404;
    throw error;
  }
  return resume;
};
