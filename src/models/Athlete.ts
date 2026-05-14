import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
  },
  { _id: false }
);

const athleteSchema = new Schema(
  {
    personalDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      gender: { type: String, required: true },
      dob: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: String, required: true },
      age: { type: Number, required: true },
      ageGroup: { type: String, required: true },
    },
    guardian: {
      name: { type: String, required: true },
      relation: { type: String, required: true },
      mobile: { type: String, required: true },
    },
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    clubState: {
      clubName: { type: String, required: true },
      stateAssociation: { type: String, required: true },
    },
    competition: {
      eventName: { type: String, required: true },
      category: { type: String, required: true },
    },
    documents: {
      photoId: { type: documentSchema, required: true },
      dobProof: { type: documentSchema, required: true },
      medicalCertificate: { type: documentSchema, required: true },
    },
    status: { type: String, enum: ["Submitted", "Approved", "Rejected"], default: "Submitted" },
  },
  { timestamps: true }
);

export const Athlete = mongoose.models.Athlete || mongoose.model("Athlete", athleteSchema);
