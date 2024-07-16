# NFC Attendance Management System

NFC Attendance Management System (NFCAMS) is a comprehensive solution developed by Mathews A George and Ansu Rose Joseph for automating attendance tracking in educational institutions. The system leverages NFC (Near Field Communication) technology to streamline the process of marking student attendance. It includes a server-side component for data management and a client-side web interface for teachers to interact with.It allows teachers to manage student attendance, generate reports, and send notifications using a web interface.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **NFC Attendance**: Take attendance using NFC technology.
- **Real-time Updates**: Get real-time updates on attendance data.
- **Report Generation**: Generate attendance reports in Excel and PDF formats.
- **Messaging**: Send messages to students and parents.
- **Low Attendance Alerts**: Notify students with low attendance via email.
- **User Authentication**: Secure login for teachers.
- **NFC Tag Integration**: Teachers can use NFC tags to quickly mark student attendance by tapping the tags.
- **Dynamic Subject Selection**: The system allows teachers to select subjects based on the teacher's profile, ensuring accurate attendance tracking.
- **Class Management**: Teachers can start classes, increment class counts, and receive absence notifications for students who are marked absent.
- **Email Notifications**: Absentees are automatically notified via email, providing a seamless communication channel.
- **Database Integration**: Utilizes MongoDB for storing attendance records and class information securely.
- **User-Friendly Interface**: The web interface offers an intuitive design for easy navigation and interaction.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/nfc-attendance-system.git
    cd nfc-attendance-system
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    SMTP_USER=your_smtp_user
    SMTP_PASS=your_smtp_password
    ```

4. **Start the server**:
    ```bash
    npm start
    ```

## Usage

1. **Access the application**:
    Open your browser and navigate to `http://localhost:3000`.

2. **Login**:
    Use the provided credentials to log in as a teacher.

3. **Dashboard**:
    - **Take Attendance**: Use the NFC feature to take attendance.
    - **View Attendance**: View and manage attendance records.
    - **Generate Reports**: Download attendance reports in Excel or PDF format.
    - **Send Messages**: Send messages to students and parents.
    - **Profile**: Update your profile information.

## File Structure

- **server.js**: Main server file that sets up the Express server, connects to MongoDB, and defines routes.
- **views/dashboard.ejs**: EJS template for the teacher dashboard.
- **views/login.ejs**: EJS template for the login page.

- ## Developers
- **Mathews A George**
  - Role: Backend Development, Database Management
  - GitHub: [mathewsgeorge2003](https://github.com/mathewsgeorge2003)

- **Ansu Rose Joseph**
  - Role: Frontend Development, User Interface Design
  - GitHub: [ansurose41](https://github.com/ansurose41)

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.

---

Developed by Mathews A George and Ansu Rose Joseph.
