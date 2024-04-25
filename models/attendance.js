// models/attendance.js
const mongoose = require('mongoose');

// Define mongoose schema for attendance data
const attendanceSchema = new mongoose.Schema({
  serialNumber: String,
  logData: String,
  time: Date
}, { collection: 'records' }); // Specify the collection name with dot notation

// Create mongoose model for attendance data
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
