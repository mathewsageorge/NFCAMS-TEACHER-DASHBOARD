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
    user: 'mathewsgeorge202@gmail.com',
    pass: 'lhmw gvsd pydu wecj'
  }
});

app.post('/send-message', upload.single('pdfFile'), async (req, res) => {
    const { recipientType, email, subject, message } = req.body;
  
    // Define recipient emails for groups directly in the server code
    const groupEmails = {
        parents: ['mathewsgeorge2003@gmail.com', 'ansurose41@gmail.com',"pta21cs044@cek.ac.in"], // Example group
        students: ['student1@example.com', 'student2@example.com'] // Another example group
    };
    // Determine the recipient based on the recipientType
    let recipients;
    if (recipientType === 'individual') {
        recipients = email; // Use the provided email for individual messages
    } else {
        // Use a predefined group of emails from groupEmails
        recipients = groupEmails[recipientType].join(', '); // Join group emails into a single string
    }
    // Define the email options
    let mailOptions = {
        from: 'mathewsgeorge202@gmail.com',
        to: recipients,
        subject: subject,
        text: message,
    };

    // Check if a file was uploaded and include it as an attachment if present
    if (req.file) {
        mailOptions.attachments = [
            {
                filename: req.file.originalname,
                path: req.file.path
            }
        ];
    }
    
    // Send the email
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

// server.js

// Route for handling login and rendering dashboard with attendance and student data
app.get('/login', (req, res) => {
    res.render('login'); // Make sure 'login' points to your login EJS file
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
            const mappedAttendanceData = attendanceData.map(data => {
                return {
                    ...data.toObject(),
                    studentName: mapSerialToStudentName(data.serialNumber),
                    logData: data.logData,
                    time: data.time,
                    period: data.period,
                    subject: data.subject,
                    serialNumber: data.serialNumber,
                    id: data._id.toString()
                };
            });

            // Render dashboard with attendance and student data
            res.render('dashboard', { 
                username: user.username, 
                students: studentData, 
                attendanceData: mappedAttendanceData, 
                periods: uniquePeriods, 
                subjects: uniqueSubjects,
                student: attendanceData,
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
      io.emit('attendanceAdded', newAttendance); // Emit event to all clients
      res.status(200).send('Attendance added successfully');
    } catch (error) {
      console.error('Error adding attendance:', error);
      res.status(500).send('Failed to add attendance');
    }
});

  app.post('/delete-attendance', async (req, res) => {
    const { id, username } = req.body;
    console.log("Attempting to delete record with ID:", id); // This should log the ID

    
    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing ID' });
    }

    // Determine the collection name based on the username
    const user = users[username];
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const collectionName = user.collection;

    // Use the attendanceSchema for the model
    // Note: Mongoose models are singular and capitalized by convention
    // Ensure the model name is unique to avoid "OverwriteModelError"
    const AttendanceModel = mongoose.model('Attendance' + collectionName, attendanceSchema, collectionName);

    try {
        // Attempt to delete the record by ID
        const result = await AttendanceModel.findByIdAndDelete(id);
        if (result) {
            io.emit('attendanceDeleted', id); // Emit event to all clients
            res.json({ success: true, message: 'Record deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Record not found' });
        }
    } catch (error) {
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

        doc.font('Helvetica-Bold').fontSize(16).text('NFCAMS-Custom Attendance Report', { align: 'center' }).moveDown();
        doc.fontSize(12);

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

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
