// server.js
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const exceljs = require('exceljs');
const PDFDocument = require('pdfkit');
const ObjectId = mongoose.Types.ObjectId;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Files will be saved in the 'uploads' directory

const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server); // Setup socket.io

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// MongoDB Connection
mongoose.connect('mongodb+srv://mathewsgeorge202:ansu@cluster0.ylyaonw.mongodb.net/NFC?retryWrites=true&w=majority')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));


// server.js
const nodemailer = require('nodemailer');

// Configure Nodemailer with your SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail', // For example, if you're using Gmail
  auth: {
    user: 'nfcamsofficial@gmail.com',
    pass: 'tdrp soek zybx damz'
  }
});

// Define student data with parent emails
const studentParentData = [
    { studentName: "Mathews A George", class: "CSES6", studentEmail: "pta21cs044@cek.ac.in", parentEmail: "mathewsgeorge2003@gmail.com" },
    { studentName: "Ansu Rose Joseph", class: "CSES6", studentEmail: "ansurose41@gmail.com", parentEmail: "ansurose41@gmail.com" },
    { studentName: "Keshav Umesh", class: "CSES6", studentEmail: "keshavumesh001@gmail.com", parentEmail: "keshavumesh001@gmail.com" },
    { studentName: "Neha Sara Cherian", class: "CSES6", studentEmail: "nehacherian570@gmail.com", parentEmail: "nehacherian570@gmail.com" },
    { studentName: "Adwaith J", class: "CSES4", studentEmail: "nehacherian570@gmail.com", parentEmail: "nehacherian570@gmail.com" },
    { studentName: "Sonu Jacob Jose", class: "CSES4", studentEmail: "nehacherian570@gmail.com", parentEmail: "nehacherian570@gmail.com" }
    // { studentName: "Neha Sara Cherian", class: "CSES6", studentEmail: "nehacherian570@gmail.com", parentEmail: "nehacherian570@gmail.com" }
];

// Route to get students by class
app.get('/get-students-by-class', (req, res) => {
    const { classId } = req.query;
    const filteredStudents = studentParentData.filter(student => student.class === classId);
    res.json(filteredStudents);
});

app.post('/send-message', upload.single('pdfFile'), async (req, res) => {
    const { studentEmails, subject, message } = req.body;
    let recipients = Array.isArray(studentEmails) ? studentEmails.join(', ') : studentEmails;

    let mailOptions = {
        from: 'your-email@example.com',
        to: recipients,
        subject: subject,
        html: `
            <p style="font-size: 16px; color: #333; font-weight: bold;">${message}</p>
            <p style="font-size: 12px; color: #999;">Best regards,<br>NFCAMS</p>
              <p style="font-size: 10px; color: #999;">Copyright © 2024 NFCAMS. All rights reserved.</p>
        `,
    };

    if (req.file) {
        mailOptions.attachments = [{ filename: req.file.originalname, path: req.file.path }];
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Error sending message');
        } else {
            console.log('Message sent: ' + info.response);
            res.send('Message sent successfully');
        }
    });
});

// Define which subjects each teacher can edit
const teacherSubjects = {
    'Jini_George': ['CGIPS6', 'DESIGNS4'],
    'Anitha': ['AADS6', 'OSS4'],
    'Nimitha': ['IEFTS6', 'COAS4']
};

// Define mongoose schema and model for attendance data
const attendanceSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: Date,
    period:String,
    subject:String
});

// Define mongoose schema and model for student data
const studentSchema = new mongoose.Schema({
    serialNumber: String,
    student_name: String,
    class: String,
    ph: String
});


// User Data
const users = {
    Jini_George: { username: 'Jini_George', password: '1', collection: 'jini_records' },
    Anitha: { username: 'Anitha', password: '2', collection: 'anitha_records' },
    Nimitha: { username: 'Nimitha', password: '3', collection: 'nimitha_records' }
   
};

// Function to map serial numbers to student names
function mapSerialToStudentName(serialNumber) {
    const serialToNameMap = {
        
        "05:39:ea:cc:f7:b0:c1": "Mathews A George", //roll no:1
        "05:33:96:60:06:b0:c1": "Ansu Rose Joseph", //roll no:2
        "05:36:41:dc:f7:b0:c1": "Keshav Umesh", //roll no:3
        "05:35:84:cc:f7:b0:c1": "Neha Sara Cherian", //roll no:4
        "05:34:6a:64:26:b0:c1": "Adhwaith J", //roll no:5
        "05:39:01:60:06:b0:c1": "Sonu Jacob Jose" //roll no:6
        
        

        
        // Add more mappings as needed
    };
    return serialToNameMap[serialNumber] || "Unknown"; // Return student name or "Unknown" if not found
}

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

// Assuming you have a global object to track change streams
const userChangeStreams = {};

// Route for handling login and rendering dashboard with attendance and student data
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
        try {
            // Fetch attendance data from the MongoDB collection
            const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
            const attendanceData = await Attendance.find({});

            // Fetch student data from the MongoDB collection
            const Student = mongoose.model('Student', studentSchema);
            const studentData = await Student.find({});

            // Extract unique periods from attendance data
            const uniquePeriods = [...new Set(attendanceData.map(data => data.period))];
            
            // Extract unique subjects from attendance data
            const uniqueSubjects = [...new Set(attendanceData.map(data => data.subject))];

            // Extract unique classes from student data
            const uniqueClasses = [...new Set(studentData.map(student => student.class))];

            // Map attendance data to include student names
            const mappedAttendanceData = attendanceData.map(data => ({
                ...data.toObject(),
                studentName: mapSerialToStudentName(data.serialNumber),
                logData: data.logData,
                time: data.time,
                period: data.period,
                subject: data.subject,
                serialNumber: data.serialNumber,
                id: data._id.toString()
            }));

            // Close existing change stream if it exists
            if (userChangeStreams[username]) {
                userChangeStreams[username].close();
                console.log(`Closed existing change stream for user: ${username}`);
            }

            // Set up a new change stream
            const changeStream = Attendance.watch();
            userChangeStreams[username] = changeStream;

            changeStream.on('change', (change) => {
                if (change.operationType === 'insert') {
                    const newAttendance = change.fullDocument;
                    // Apply the mapping function before emitting
                    const mappedNewAttendance = {
                        ...newAttendance,
                        studentName: mapSerialToStudentName(newAttendance.serialNumber)
                    };
                    // Emit the change only to the specific user
                    io.to(username).emit('attendanceAdded', mappedNewAttendance);
                }
            });

            // Render dashboard with attendance and student data
            res.render('dashboard', { 
                username: user.username, 
                students: studentData, 
                attendanceData: mappedAttendanceData, 
                periods: uniquePeriods, 
                subjects: uniqueSubjects,
                classes: uniqueClasses,
            });
        } catch (err) {
            console.error('Error retrieving data:', err);
            res.render('error', { message: 'Error retrieving data' });
        }
    } else {
        res.render('error', { message: 'Invalid username or password' });
    }
});

// Ensure the user is joined to a specific room for real-time updates
io.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.join(username);
    });
});


// Define the schema for TotalClasses
const totalClassesSchema = new mongoose.Schema({
    subject: String,
    count: Number
});

// Compile the model from the schema
const TotalClasses = mongoose.model('TotalClasses', totalClassesSchema, 'total_classes');

// Now, use this model in your route
app.get('/get-total-classes', async (req, res) => {
    const { subject } = req.query;

    if (!subject) {
        return res.status(400).json({ error: 'Missing required query parameter: subject' });
    }

    try {
        const totalClassesData = await TotalClasses.findOne({ subject: subject });

        if (totalClassesData) {
            res.json({ totalClasses: totalClassesData.count });
        } else {
            res.status(404).json({ error: 'Total classes data not found for the subject' });
        }
    } catch (error) {
        console.error('Error fetching total classes:', error);
        res.status(500).json({ error: 'Failed to fetch total classes' });
    }
});


app.get('/generate-excel-report', async (req, res) => {
    const { username } = req.query; // Extract username from query parameters
    const user = users[username];
    if (!user) {
        return res.status(400).send('User not found');
    }

    try {
        // Fetch attendance data from the MongoDB collection based on the logged-in user's collection
        const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
        const attendanceData = await Attendance.find({});

        // Create a new Excel workbook and worksheet
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('NFC Attendance Report');

        // Define column headers
        worksheet.columns = [
            { header: 'Serial Number', key: 'serialNumber', width: 15 },
            { header: 'Log Data', key: 'logData', width: 30 },
            { header: 'Time', key: 'time', width: 20 },
            { header: 'Period', key: 'period', width: 15 },
            { header: 'Subject', key: 'subject', width: 20 },
        ];

        // Add data rows
        attendanceData.forEach(data => {
            worksheet.addRow({
                serialNumber: mapSerialToStudentName(data.serialNumber),
                logData: data.logData,
                time: data.time.toString(), // Convert date object to string
                period: data.period,
                subject: data.subject,
            });
        });

        // Generate Excel file
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // Set response headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="nfc_attendance_report.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        // Send the Excel file as response
        res.send(excelBuffer);
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).send('Failed to generate Excel report');
    }
});


app.get('/generate-pdf-report', async (req, res) => {
    const { username } = req.query;
    const user = users[username];
    if (!user) {
        return res.status(400).send('User not found');
    }

    try {
        const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
        const attendanceData = await Attendance.find({});

        // Sort attendance data by date
        attendanceData.sort((a, b) => a.time - b.time);

        const doc = new PDFDocument();
        doc.pipe(res);

        // Function to draw border
        const drawBorder = () => {
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
        };

        // Draw border on the first page
        drawBorder();

        // Ensure border is drawn on each new page
        doc.on('pageAdded', () => {
            drawBorder();
        });

        // Add report generation date and time
        const reportDateTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        doc.fontSize(14).text(`NFCAMS Report Generated On: ${reportDateTime}`, { align: 'center' }).moveDown(2);

        let currentDate = null;

        attendanceData.forEach(data => {
            if (currentDate !== data.time.toDateString()) {
                if (currentDate) {
                    doc.addPage();
                }
                currentDate = data.time.toDateString();
                doc.fontSize(14).text(`Date: ${currentDate}`, { align: 'center' }).moveDown();
            }

            doc.text(`Serial Number: ${mapSerialToStudentName(data.serialNumber)}`);
            doc.text(`Log Data: ${data.logData}`);
            doc.text(`Time: ${data.time.toString()}`);
            doc.text(`Period: ${data.period}`);
            doc.text(`Subject: ${data.subject}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).send('Failed to generate PDF report');
    }
});

/// Handle form submission to add attendance data
app.post('/add-attendance', async (req, res) => {
    const { serialNumber, logData, time, teacher, period, subject, username } = req.body;
  
    // Retrieve user details from the users object or session
    const user = users[username];
    if (!user) {
        return res.status(404).send('User not found');
    }

    try {
      // Create a model for attendance data using the user's specific collection
      const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
  
      // Create new attendance object
      const newAttendance = new Attendance({
        serialNumber,
        logData,
        time,
        teacher,
        period,
        subject
      });
  
      // Save attendance data to the specified collection
      await newAttendance.save();
      
      res.status(200).send('Attendance added successfully');
    } catch (error) {
      console.error('Error adding attendance:', error);
      res.status(500).send('Failed to add attendance');
    }
});

// Assuming getModelForUser is a function that retrieves the correct model based on the username
const getModelForUser = (username) => {
    const user = users[username]; // Ensure you have a users object or similar structure
    if (!user) return null;
    const modelName = 'Attendance' + user.collection; // Assuming collections are named uniquely per user
    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    } else {
        return mongoose.model(modelName, attendanceSchema, user.collection);
    }
};

app.post('/delete-attendance', async (req, res) => {
    const { id, username } = req.body;

    // Validate the ID
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing ID' });
    }

    // Get the model for the user
    const AttendanceModel = getModelForUser(username);
    if (!AttendanceModel) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    try {
        // Attempt to find and delete the attendance record
        const result = await AttendanceModel.findByIdAndDelete(id);
        if (result) {
            // If deletion is successful, emit an event to all clients
            io.emit('attendanceDeleted', id);
            res.json({ success: true, message: 'Record deleted successfully' });
        } else {
            // If no record is found, send a 404 response
            res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (error) {
        // Log and send any server errors
        console.error('Failed to delete record:', error);
        res.status(500).json({ success: false, message: 'Failed to delete record' });
    }
});


app.post('/calculate-attendance-percentage', async (req, res) => {
    const { subject, totalClasses, username } = req.body;

    if (!subject || !totalClasses || !username) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = users[username];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
        const attendanceRecords = await Attendance.find({ subject: subject });

        // Calculate attendance percentage for each student
        let attendanceCounts = {};
        attendanceRecords.forEach(record => {
            const studentName = mapSerialToStudentName(record.serialNumber);
            if (attendanceCounts[studentName]) {
                attendanceCounts[studentName] += 1;
            } else {
                attendanceCounts[studentName] = 1;
            }
        });

        let percentages = [];
        for (let studentName in attendanceCounts) {
            let percentage = (attendanceCounts[studentName] / totalClasses) * 100;
            percentages.push({ studentName, percentage: percentage.toFixed(2) });
        }

        res.json(percentages);
    } catch (error) {
        console.error('Error calculating attendance percentage:', error);
        res.status(500).json({ error: 'Failed to calculate attendance percentage' });
    }
});

app.get('/generate-attendance-percentage-pdf', async (req, res) => {
    const { subject, totalClasses, username } = req.query;

    // Validate input
    if (!subject || !totalClasses || !username) {
        return res.status(400).send('Missing required query parameters');
    }

    const user = users[username];
    if (!user) {
        return res.status(404).send('User not found');
    }

    try {
        const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
        const attendanceRecords = await Attendance.find({ subject: subject });

        let attendanceCounts = {};

        attendanceRecords.forEach(record => {
            const studentName = mapSerialToStudentName(record.serialNumber);
            if (attendanceCounts[studentName]) {
                attendanceCounts[studentName] += 1;
            } else {
                attendanceCounts[studentName] = 1;
            }
        });

        let percentages = [];
        for (let studentName in attendanceCounts) {
            let percentage = (attendanceCounts[studentName] / totalClasses) * 100;
            percentages.push({ studentName, percentage: percentage.toFixed(2) });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename="attendance_percentage_report.pdf"');
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // Function to draw border and watermark
        const drawBorderAndWatermark = () => {
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
            doc.fontSize(60).opacity(0.1).text('NFCAMS', {
                align: 'center',
                baseline: 'middle'
            });
        };

        // Draw border and watermark on the first page
        drawBorderAndWatermark();

        // Ensure border and watermark are drawn on each new page
        doc.on('pageAdded', () => {
            drawBorderAndWatermark();
        });

        // Add report generation date and time
        const reportDateTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        doc.fontSize(14).opacity(1).text(`Report Generated On: ${reportDateTime}`, { align: 'center' }).moveDown(2);

        doc.fontSize(14).opacity(1).text('NFCAMS-Attendance Percentage Report', { align: 'center' }).moveDown();
        doc.text(`Subject: ${subject}`).moveDown();
        doc.text(`Total Classes: ${totalClasses}`).moveDown(2);

        percentages.forEach(({ studentName, percentage }) => {
            doc.text(`${studentName}: ${percentage}%`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
});




app.post('/export-attendance-to-pdf', async (req, res) => {
    const { attendanceData } = req.body;

    if (!attendanceData || attendanceData.length === 0) {
        return res.status(400).send('No data provided for PDF generation');
    }

    try {
        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename="attendance_report.pdf"');
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // Function to draw border
        const drawBorder = () => {
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
        };

        // Draw border on the first page
        drawBorder();

        // Ensure border is drawn on each new page
        doc.on('pageAdded', () => {
            drawBorder();
        });

        // Add report generation date and time
        const reportDateTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        doc.font('Helvetica-Bold').fontSize(16).text('NFCAMS-Custom Attendance Report', { align: 'center' }).moveDown();
        doc.fontSize(12).text(`Report Generated On: ${reportDateTime}`, { align: 'center' }).moveDown(2);

        // Define table headers and adjust column widths
        const headers = ["Date", "Time", "Student Name", "Subject/Class", "Period"];
        const columnWidths = [100, 80, 150, 100, 60]; // Adjusted widths to better fit content

        const startY = doc.y;
        const startX = doc.x;

        // Draw headers
        headers.forEach((header, i) => {
            doc.font('Helvetica-Bold').text(header, startX + sumPreviousWidths(i, columnWidths), startY, { width: columnWidths[i], align: 'left' });
        });

        // Move to next row
        doc.moveDown(1.5);

        // Reset font for data rows
        doc.font('Helvetica');

        // Draw rows
        attendanceData.forEach(data => {
            let currentY = doc.y;
            doc.text(data.date, startX, currentY, { width: columnWidths[0] });
            doc.text(data.time, startX + columnWidths[0], currentY, { width: columnWidths[1] });
            doc.text(data.studentName, startX + columnWidths[0] + columnWidths[1], currentY, { width: columnWidths[2] });
            doc.text(data.subject, startX + columnWidths[0] + columnWidths[1] + columnWidths[2], currentY, { width: columnWidths[3] });
            doc.text(data.period, startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], currentY, { width: columnWidths[4] });
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

function sumPreviousWidths(index, widths) {
    let sum = 0;
    for (let i = 0; i < index; i++) {
        sum += widths[i];
    }
    return sum;
}

app.get('/students-low-attendance', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const user = users[username];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        const Attendance = mongoose.model('Attendance', attendanceSchema, user.collection);
        const TotalClasses = mongoose.model('TotalClasses', totalClassesSchema, 'total_classes');
        const subjects = await Attendance.distinct('subject');
        let lowAttendanceStudents = [];

        for (let subject of subjects) {
            const totalClassesData = await TotalClasses.findOne({ subject: subject });
            if (!totalClassesData) {
                console.log(`No total classes data found for subject: ${subject}`);
                continue; // Skip if no total classes data found for the subject
            }
            const totalClasses = totalClassesData.count;
            const attendanceRecords = await Attendance.find({ subject: subject });

            let attendanceCounts = {};
            attendanceRecords.forEach(record => {
                const studentName = mapSerialToStudentName(record.serialNumber);
                if (attendanceCounts[studentName]) {
                    attendanceCounts[studentName] += 1;
                } else {
                    attendanceCounts[studentName] = 1;
                }
            });

            for (let studentName in attendanceCounts) {
                let percentage = (attendanceCounts[studentName] / totalClasses) * 100;
                if (percentage < 75) {
                    lowAttendanceStudents.push({ studentName, subject, percentage: percentage.toFixed(2) });
                }
            }
        }

        res.json(lowAttendanceStudents);
    } catch (error) {
        console.error('Error fetching low attendance students:', error);
        res.status(500).json({ error: 'Failed to fetch low attendance students' });
    }
});

app.post('/set-class-count', async (req, res) => {
    const { username, subject, newCount } = req.body;

    // Check if the user is authorized to update the subject
    const userSubjects = teacherSubjects[username];
    if (!userSubjects || !userSubjects.includes(subject)) {
        return res.status(403).json({ message: 'You are not authorized to update this subject' });
    }

    try {
        // Set the class count for the subject to the specified new count
        const result = await TotalClasses.findOneAndUpdate(
            { subject: subject },
            { $set: { count: parseInt(newCount) } },
            { new: true }
        );

        if (result) {
            res.json({ message: `Class count for ${subject} updated successfully to ${result.count}` });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        console.error('Error updating class count:', error);
        res.status(500).json({ message: 'Failed to update class count' });
    }
});

app.post('/send-low-attendance-emails', async (req, res) => {
    const { lowAttendanceStudents, totalClasses, subject } = req.body;
  
    // Check if lowAttendanceStudents is an array
    if (!Array.isArray(lowAttendanceStudents)) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }
  
    // Define email addresses for students within the route
    const studentEmails = {
      'Mathews A George': 'mathewsgeorge2003@gmail.com',
      'Ansu Rose Joseph': 'pta21cs044@cek.ac.in',
      'Keshav Umesh': 'keshavumesh001@gmail.com',
      'Neha Sara Cherian': 'nehacherian570@gmail.com',
      'Adwaith J': 'nehacherian570@gmail.com',
      'Sonu Jacob Jose': 'nehacherian570@gmail.com'
      // Add more students as needed
    };
  
    // Send emails to each student/parent
    for (const student of lowAttendanceStudents) {
      if (student.percentage < 75) {
        const email = studentEmails[student.studentName];
        if (email) {
          const mailOptions = {
            from: 'NFAMS',
            to: email,
            subject: 'NFCAMS-Low Attendance Alert',
            html: `
              <p style="font-size: 18px; color: #333; font-weight: bold;">Dear ${student.studentName},</p>
              <p style="font-size: 17px; color: #333;">Your attendance for the subject <b> ${subject} </b> is currently <b> ${student.percentage}% </b>. A minimum attendance of 75% is required. Please make sure to attend the upcoming classes regularly.</p>
              <p style="font-size: 14px; color: #666;">If you have any concerns or need assistance, feel free to reach out to your teacher or academic advisor.</p>
              <p style="font-size: 12px; color: #999;">Best regards,<br>NFCAMS</p>
              <p style="font-size: 10px; color: #999;">Copyright © 2024 NFCAMS. All rights reserved.</p>
            `
          };
  
          try {
            await transporter.sendMail(mailOptions);
          } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send emails' });
          }
        }
      }
    }
  
    res.json({ success: true, message: 'Emails sent successfully' });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
