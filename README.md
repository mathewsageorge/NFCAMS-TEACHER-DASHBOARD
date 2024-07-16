# NFC Attendance Management System

This project is an NFC-based attendance management system developed by Mathews A George and Ansu Rose Joseph. It allows teachers to manage student attendance, generate reports, and send notifications using a web interface.

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

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.

---

Developed by Mathews A George and Ansu Rose Joseph.
