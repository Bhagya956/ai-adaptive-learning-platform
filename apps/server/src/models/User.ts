import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

  role: {
    type: String,
    enum: ["student", "admin", "educator", "organization"],
    default: "student",
  },
     currentRole: {
  type: String,
  default: "",
},

experience: {
  type: Number,
  default: 0,
},

skills: [
  {
    type: String,
  },
],

interestedDomains: [
  {
    type: String,
  },
],

careerGoal: {
  type: String,
  default: "",
},

education: {
  type: String,
  default: "",
},

// For students only: the educator who has assigned/connected this student.
// null means the student is independent (no educator).
educatorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

// For students and educators: the organization they belong to.
// null means independent (not part of any organization).
organizationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
  },
  {
    timestamps: true,
  },
 
);

const User = mongoose.model("User", userSchema);

export default User;