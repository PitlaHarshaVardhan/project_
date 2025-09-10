const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

async function exportStudentsToCSV(students) {
  const filePath = path.join(__dirname, "../students_export.csv");
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "course", title: "Course" },
      { id: "enrollmentDate", title: "Enrollment Date" },
    ],
  });
  await csvWriter.writeRecords(students);
  return filePath;
}

module.exports = exportStudentsToCSV;
