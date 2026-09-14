const express = require("express");

const app = express();

const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());


// Serve frontend files from public folder

app.use(express.static("public"));


// ==========================================
// TEMPORARY ATTENDANCE STORAGE
// ==========================================

let attendanceRecords = [];


// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {

    res.json({
        message: "GPS Attendance Server is running!"
    });

});


// ==========================================
// MARK ATTENDANCE API
// ==========================================

app.post("/api/attendance", (req, res) => {

    const {
        studentId,
        latitude,
        longitude,
        accuracy,
        distance
    } = req.body;


    // Check Student ID

    if (!studentId) {

        return res.status(400).json({
            success: false,
            message: "Student ID is required"
        });

    }


    // Check GPS data

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


    // Check distance

    if (distance > allowedRadius) {

        return res.json({

            success: false,

            message:
                "Attendance rejected. You are outside the college.",

            distance: distance

        });

    }


    // Create attendance record

    const record = {

        id: attendanceRecords.length + 1,

        studentId: studentId,

        date: new Date().toISOString().split("T")[0],

        time: new Date().toLocaleTimeString(),

        latitude: latitude,

        longitude: longitude,

        accuracy: accuracy,

        distance: distance,

        status: "Present"

    };


    // Save record

    attendanceRecords.push(record);


    // Send response

    res.json({

        success: true,

        message: "Attendance marked successfully!",

        record: record

    });

});


// ==========================================
// GET ALL ATTENDANCE
// ==========================================

app.get("/api/attendance", (req, res) => {

    res.json(attendanceRecords);

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log("----------------------------------");

    console.log("GPS Attendance Server Started");

    console.log("----------------------------------");

    console.log(
        `Open: http://localhost:${PORT}`
    );

});