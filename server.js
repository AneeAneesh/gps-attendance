require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// ===============================
// MySQL Connection
// ===============================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log("❌ MySQL connection failed:");
        console.log(err.message);
        return;
    }

    console.log("✅ MySQL Connected Successfully");
});

// ===============================
// Test API
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        message: "GPS Attendance API is working!"
    });
});

// ===============================
// Mark Attendance
// ===============================

app.post("/api/attendance", (req, res) => {

    const {
        student_id,
        latitude,
        longitude,
        accuracy,
        distance,
        status
    } = req.body;

    if (!student_id) {
        return res.status(400).json({
            success: false,
            message: "Student ID is required"
        });
    }

    // Check whether student exists
    const studentQuery = `
        SELECT * FROM students
        WHERE student_id = ?
    `;

    db.query(studentQuery, [student_id], (err, students) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student ID not found"
            });
        }

        // Check duplicate attendance for today
        const duplicateQuery = `
            SELECT * FROM attendance
            WHERE student_id = ?
            AND attendance_date = CURDATE()
        `;

        db.query(
            duplicateQuery,
            [student_id],
            (err, existingAttendance) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (existingAttendance.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Attendance already marked today"
                    });
                }

                // Insert attendance
                const insertQuery = `
                    INSERT INTO attendance
                    (
                        student_id,
                        attendance_date,
                        attendance_time,
                        latitude,
                        longitude,
                        accuracy,
                        distance,
                        status
                    )
                    VALUES (?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?)
                `;

                db.query(
                    insertQuery,
                    [
                        student_id,
                        latitude,
                        longitude,
                        accuracy,
                        distance,
                        status
                    ],
                    (err, result) => {

                        if (err) {
                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message: "Failed to save attendance"
                            });
                        }

                        res.json({
                            success: true,
                            message: "Attendance marked successfully",
                            attendance_id: result.insertId
                        });
                    }
                );
            }
        );
    });
});

// ===============================
// Get Attendance Records
// ===============================

app.get("/api/attendance", (req, res) => {

    const query = `
        SELECT
            attendance.id,
            students.student_id,
            students.name,
            students.course,
            attendance.attendance_date,
            attendance.attendance_time,
            attendance.latitude,
            attendance.longitude,
            attendance.accuracy,
            attendance.distance,
            attendance.status
        FROM attendance
        INNER JOIN students
        ON attendance.student_id = students.student_id
        ORDER BY attendance.id DESC
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json(results);
    });
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {

    console.log("----------------------------------");
    console.log("GPS Attendance Server Started");
    console.log("----------------------------------");
    console.log(`Open: http://localhost:${PORT}`);

});