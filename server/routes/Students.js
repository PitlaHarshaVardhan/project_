const multer = require("multer");
const path = require("path");
const fs = require("fs");
const exportStudentsToCSV = require("../utils/csvExport");

const upload = multer({ dest: "uploads/" });

const express = require("express");
const Student = require("../models/Student");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ====== CRUD ROUTES ======

// Admin: get all students (with pagination)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const total = await Student.countDocuments();
    const students = await Student.find()
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      students,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create student
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, course, enrollmentDate } = req.body;
    const existing = await Student.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Student email already exists" });
    const student = new Student({
      name,
      email,
      course,
      enrollmentDate: enrollmentDate || Date.now(),
    });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update student
router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ message: "Not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: delete student
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student: get only own profile
router.get(
  "/me",
  authenticate,
  authorize("student", "admin"),
  async (req, res) => {
    try {
      if (req.user.role === "admin" && req.query.userId) {
        const byUser =
          (await Student.findOne({ linkedUser: req.query.userId })) ||
          (await Student.findById(req.query.userId));
        return res.json(byUser);
      }

      const student =
        (await Student.findOne({ linkedUser: req.user._id })) ||
        (await Student.findOne({ email: req.user.email }));
      if (!student)
        return res.status(404).json({ message: "Student profile not found" });
      res.json(student);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Student: update own profile
router.put(
  "/me",
  authenticate,
  authorize("student", "admin"),
  async (req, res) => {
    try {
      let student =
        (await Student.findOne({ linkedUser: req.user._id })) ||
        (await Student.findOne({ email: req.user.email }));
      if (!student)
        return res.status(404).json({ message: "Student profile not found" });

      const { name, email, course } = req.body;
      if (name) student.name = name;
      if (email) student.email = email;
      if (course) student.course = course;
      await student.save();

      // Also update User model if needed
      const User = require("../models/User");
      const user = await User.findById(req.user._id);
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();
      }

      res.json(student);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Admin: clear all students
router.delete("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    await Student.deleteMany({});
    res.json({ message: "All students deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ====== EXTRA FEATURES ======

// Search & filter
router.get("/search", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, course } = req.query;
    const query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (course) query.course = course;
    const students = await Student.find(query);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export CSV
router.get(
  "/export/csv",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const students = await Student.find().lean();
      const formattedStudents = students.map((s) => ({
        name: s.name,
        email: s.email,
        course: s.course,
        enrollmentDate: s.enrollmentDate
          ? new Date(s.enrollmentDate).toLocaleDateString()
          : "",
      }));

      const filePath = await exportStudentsToCSV(formattedStudents);

      res.download(filePath, "students_export.csv", (err) => {
        if (err) console.error("Download error:", err);
        // cleanup file after download
        fs.unlink(filePath, () => {});
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Upload profile picture
router.post(
  "/me/upload",
  authenticate,
  authorize("student"),
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const student = await Student.findOne({ linkedUser: req.user._id });
      if (!student)
        return res.status(404).json({ message: "Student not found" });
      student.profilePic = `/uploads/${req.file.filename}`;
      await student.save();
      res.json({
        message: "Profile picture uploaded",
        path: student.profilePic,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Serve uploaded images
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
