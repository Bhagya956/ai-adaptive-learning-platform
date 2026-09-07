/**
 * RelationshipRequest
 *
 * Tracks a user's request to join a mentor or organization.
 * Separate from the User document so request history is preserved
 * even after acceptance/rejection.
 *
 * requestType values:
 *   "mentor_student"       — student requested to join a mentor
 *   "organization_student" — student requested to join an organization
 *   "organization_mentor"  — educator requested to join an organization
 *
 * status values:
 *   "pending"  — awaiting review
 *   "accepted" — approved
 *   "rejected" — declined
 */

import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    // The user making the request
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // "student" | "educator"
    requesterRole: {
      type: String,
      required: true,
    },
    // What kind of relationship is being requested
    requestType: {
      type: String,
      enum: ["mentor_student", "organization_student", "organization_mentor"],
      required: true,
    },
    // The mentor or organization being requested to join
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests (one active request per requester→target pair)
requestSchema.index(
  { requesterId: 1, targetId: 1, requestType: 1, status: 1 },
  { unique: false }
);

export default mongoose.model("RelationshipRequest", requestSchema);
