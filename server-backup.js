require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");

const app = express();

// ===============================
// Middleware
// ===============================

app.use(express.json());
app.use(express.static("public"));

// ===============================
// MySQL Connection Pool
// ===============================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Test MySQL connection
db.getConnection((err, connection) => {

    if (err) {
        console.log("❌ MySQL connection failed:");
        console.log(err.message);
        return;
    }

    console.log("✅ MySQL Connected Successfully");

    connection.release();
});

// ===============================
// Test API
// ===============================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
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

    // Check Student ID
    if (!student_id) {

        return res.status(400).json({
            success: false,
            message: "Student ID is required"
        });

    }

    // Check GPS
    if (
        latitude === undefined ||
        longitude === undefined
    ) {

        return res.status(400).json({
            success: false,
            message: "GPS location is required"
        });

    }

    // Allowed college radius
    const allowedRadius = 100;

    if (
        distance !== undefined &&
        distance > allowedRadius
    ) {

        return res.json({
            success: false,
            message: "Attendance rejected. You are outside the college.",
            distance: distance
        });

    }

    // ===============================
    // Check Student
    // ===============================

    const studentQuery = `
        SELECT student_id, name
        FROM students
        WHERE student_id = ?
    `;

    db.query(
        studentQuery,
        [student_id],
        (err, students) => {

            if (err) {

                console.log("Student query error:", err);

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

            // ===============================
            // Check Duplicate Attendance
            // ===============================

            const duplicateQuery = `
                SELECT id
                FROM attendance
                WHERE student_id = ?
                AND attendance_date = CURDATE()
            `;

            db.query(
                duplicateQuery,
                [student_id],
                (err, existingAttendance) => {

                    if (err) {

                        console.log("Duplicate query error:", err);

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

                    // ===============================
                    // Insert Attendance
                    // ===============================

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
                        VALUES
                        (
                            ?,
                            CURDATE(),
                            CURTIME(),
                            ?,
                            ?,
                            ?,
                            ?,
                            ?
                        )
                    `;

                    db.query(
                        insertQuery,
                        [
                            student_id,
                            latitude,
                            longitude,
                            accuracy,
                            distance,
                            status || "Present"
                        ],
                        (err, result) => {

                            if (err) {

                                console.log("Insert error:", err);

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to save attendance"
                                });

                            }

                            res.json({
                                success: true,
                                message: "Attendance marked successfully!",
                                attendance_id: result.insertId,
                                student_id: student_id
                            });

                        }
                    );

                }
            );

        }
    );

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
            students.semester,
            attendance.attendance_date,
            attendance.attendance_time,
            attendance.latitude,
            attendance.longitude,
            attendance.accuracy,
            attendance.distance,
            attendance.status,
            attendance.created_at
        FROM attendance
        INNER JOIN students
        ON attendance.student_id = students.student_id
        ORDER BY attendance.id DESC
    `;

    db.query(
        query,
        (err, results) => {

            if (err) {

                console.log("Attendance query error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });

            }

            res.json(results);

        }
    );

});

// ===============================
// Local Server
// ===============================

if (require.main === module) {

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {

        console.log("----------------------------------");
        console.log("GPS Attendance Server Started");
        console.log("----------------------------------");
        console.log(`Open: http://localhost:${PORT}`);

    });

}

// ===============================
// Vercel Export
// ===============================

module.exports = app;