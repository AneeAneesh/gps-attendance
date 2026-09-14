require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------
// Middleware
// ----------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public"), {
    index: false
}));

// ----------------------------------
// MySQL Connection
// ----------------------------------

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

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:");
        console.error(err.message);
    } else {
        console.log("✅ MySQL Connected Successfully");
        connection.release();
    }
});

// ----------------------------------
// HOME PAGE
// ----------------------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ----------------------------------
// API TEST
// ----------------------------------

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "GPS Attendance API is working!"
    });
});

// ----------------------------------
// STUDENT LOGIN
// ----------------------------------

app.post("/api/student-login", async (req, res) => {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
        return res.status(400).json({
            success: false,
            message: "Student ID and password are required"
        });
    }

    const sql = `
        SELECT
            id,
            student_id,
            name,
            email,
            course,
            semester,
            password
        FROM students
        WHERE student_id = ?
        LIMIT 1
    `;

    db.query(sql, [student_id], async (err, results) => {
        if (err) {
            console.error("Student login database error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Student ID or password"
            });
        }

        const student = results[0];

        try {
            const passwordMatch = await bcrypt.compare(
                password,
                student.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Student ID or password"
                });
            }

            res.json({
                success: true,
                message: "Student login successful",
                student: {
                    id: student.id,
                    student_id: student.student_id,
                    name: student.name,
                    email: student.email,
                    course: student.course,
                    semester: student.semester
                }
            });

        } catch (error) {
            console.error("Student password comparison error:", error);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    });
});

// ----------------------------------
// PROFESSOR LOGIN
// ----------------------------------

app.post("/api/professor-login", async (req, res) => {
    const { professor_id, password } = req.body;

    if (!professor_id || !password) {
        return res.status(400).json({
            success: false,
            message: "Professor ID and password are required"
        });
    }

    const sql = `
        SELECT
            id,
            professor_id,
            name,
            email,
            password
        FROM professors
        WHERE professor_id = ?
        LIMIT 1
    `;

    db.query(sql, [professor_id], async (err, results) => {
        if (err) {
            console.error("Professor login database error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Professor ID or password"
            });
        }

        const professor = results[0];

        try {
            const passwordMatch = await bcrypt.compare(
                password,
                professor.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Professor ID or password"
                });
            }

            res.json({
                success: true,
                message: "Professor login successful",
                professor: {
                    id: professor.id,
                    professor_id: professor.professor_id,
                    name: professor.name,
                    email: professor.email
                }
            });

        } catch (error) {
            console.error("Professor password comparison error:", error);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    });
});

// ----------------------------------
// GET ATTENDANCE
// ----------------------------------

app.get("/api/attendance", (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({
            success: false,
            message: "Date is required"
        });
    }

    const sql = `
        SELECT
            a.id,
            a.student_id,
            s.name,
            s.course,
            a.attendance_date,
            a.attendance_time,
            a.latitude,
            a.longitude,
            a.accuracy,
            a.distance,
            a.status
        FROM attendance a
        LEFT JOIN students s
            ON a.student_id = s.student_id
        WHERE a.attendance_date = ?
        ORDER BY a.attendance_time DESC
    `;

    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error("Attendance fetch error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            attendance: results
        });
    });
});

// ----------------------------------
// MARK ATTENDANCE
// ----------------------------------

app.post("/api/mark-attendance", (req, res) => {
    const {
        student_id,
        attendance_date,
        attendance_time,
        status
    } = req.body;

    if (
        !student_id ||
        !attendance_date ||
        !attendance_time ||
        !status
    ) {
        return res.status(400).json({
            success: false,
            message: "All attendance fields are required"
        });
    }

    // Check whether student exists
    const studentSql = `
        SELECT student_id
        FROM students
        WHERE student_id = ?
        LIMIT 1
    `;

    db.query(studentSql, [student_id], (studentErr, studentResults) => {
        if (studentErr) {
            console.error("Student lookup error:", studentErr);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student ID not found"
            });
        }

        // Check if attendance already exists
        const duplicateSql = `
            SELECT id
            FROM attendance
            WHERE student_id = ?
            AND attendance_date = ?
            LIMIT 1
        `;

        db.query(
            duplicateSql,
            [student_id, attendance_date],
            (duplicateErr, duplicateResults) => {

                if (duplicateErr) {
                    console.error(
                        "Duplicate attendance check error:",
                        duplicateErr
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (duplicateResults.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Attendance already marked for this student on this date"
                    });
                }

                // Insert attendance
                const insertSql = `
                    INSERT INTO attendance (
                        student_id,
                        attendance_date,
                        attendance_time,
                        latitude,
                        longitude,
                        accuracy,
                        distance,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    student_id,
                    attendance_date,
                    attendance_time,
                    0,
                    0,
                    0,
                    0,
                    status
                ];

                db.query(
                    insertSql,
                    values,
                    (insertErr, result) => {

                        if (insertErr) {
                            console.error(
                                "Attendance insert error:",
                                insertErr
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to mark attendance"
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

// ----------------------------------
// DELETE ATTENDANCE
// ----------------------------------

app.delete("/api/attendance/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Attendance ID is required"
        });
    }

    const sql = `
        DELETE FROM attendance
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Attendance delete error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        res.json({
            success: true,
            message: "Attendance deleted successfully"
        });
    });
});

// ----------------------------------
// UPDATE ATTENDANCE
// ----------------------------------

app.put("/api/attendance/:id", (req, res) => {
    const { id } = req.params;

    const {
        attendance_date,
        attendance_time,
        status
    } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Attendance ID is required"
        });
    }

    if (!attendance_date || !attendance_time || !status) {
        return res.status(400).json({
            success: false,
            message: "Date, time and status are required"
        });
    }

    const sql = `
        UPDATE attendance
        SET
            attendance_date = ?,
            attendance_time = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            attendance_date,
            attendance_time,
            status,
            id
        ],
        (err, result) => {

            if (err) {
                console.error("Attendance update error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Attendance record not found"
                });
            }

            res.json({
                success: true,
                message: "Attendance updated successfully"
            });
        }
    );
});

// ----------------------------------
// 404 API HANDLER
// ----------------------------------

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ----------------------------------
// START SERVER
// ----------------------------------

app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("GPS Attendance Server Started");
    console.log("----------------------------------");
    console.log(`Open: http://localhost:${PORT}`);
});