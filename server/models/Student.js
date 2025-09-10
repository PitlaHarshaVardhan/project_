const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, default: "MERN Bootcamp" },
    enrollmentDate: { type: Date, default: Date.now },
    profilePic: { type: String, default: "" },
    linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional link to User
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
