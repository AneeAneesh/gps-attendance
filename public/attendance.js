// ==========================================
// COLLEGE GPS LOCATION
// ==========================================

const COLLEGE_LATITUDE = 12.2538430;
const COLLEGE_LONGITUDE = 75.1389692;

// Allowed radius in meters
const ALLOWED_RADIUS = 100;

// Maximum acceptable GPS accuracy
const MAX_GPS_ACCURACY = 100;


// ==========================================
// CALCULATE DISTANCE
// ==========================================

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


// ==========================================
// GET CURRENT LOCATION
// ==========================================

function getLocation() {

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("attendanceBtn");

    if (!navigator.geolocation) {

        status.innerText =
            "GPS is not supported by this browser.";

        return;
    }

    status.innerText =
        "Getting your location...";

    button.disabled = true;

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            // ==========================================
            // DISPLAY GPS INFORMATION
            // ==========================================

            document.getElementById("latitude").innerText =
                latitude.toFixed(6);

            document.getElementById("longitude").innerText =
                longitude.toFixed(6);

            document.getElementById("accuracy").innerText =
                accuracy.toFixed(2) + " meters";


            // ==========================================
            // CHECK ACCURACY
            // ==========================================

            if (accuracy > MAX_GPS_ACCURACY) {

                status.innerText =
                    "GPS accuracy is too low. " +
                    "Please enable precise location and try again.";

                button.disabled = false;

                return;
            }


            // ==========================================
            // CALCULATE DISTANCE
            // ==========================================

            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    COLLEGE_LATITUDE,
                    COLLEGE_LONGITUDE
                );

            document.getElementById("distance").innerText =
                distance.toFixed(2) + " meters";


            // ==========================================
            // CHECK COLLEGE RADIUS
            // ==========================================

            if (distance > ALLOWED_RADIUS) {

                status.innerText =
                    "Attendance Rejected - Outside College.";

                button.disabled = false;

                return;
            }


            // ==========================================
            // STUDENT IS INSIDE COLLEGE
            // ==========================================

            status.innerText =
                "You are inside the college area. " +
                "Click Mark Attendance.";

            button.disabled = false;

        },

        function (error) {

            console.error(
                "GPS Error:",
                error
            );

            button.disabled = false;

            if (error.code === 1) {

                status.innerText =
                    "Location permission denied. " +
                    "Please allow location access.";

            } else if (error.code === 2) {

                status.innerText =
                    "Location unavailable. " +
                    "Please turn on GPS/location services.";

            } else if (error.code === 3) {

                status.innerText =
                    "Location request timed out. " +
                    "Please try again.";

            } else {

                status.innerText =
                    "Unable to get your location.";
            }

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}


// ==========================================
// MARK ATTENDANCE
// ==========================================

async function markAttendance() {

    const studentIdElement =
        document.getElementById("studentId");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("attendanceBtn");


    const studentId =
        studentIdElement.value.trim();


    // ==========================================
    // CHECK STUDENT ID
    // ==========================================

    if (studentId === "") {

        status.innerText =
            "Please enter Student ID.";

        return;
    }


    // ==========================================
    // GET GPS AGAIN
    // ==========================================

    if (!navigator.geolocation) {

        status.innerText =
            "GPS is not supported by this browser.";

        return;
    }


    status.innerText =
        "Getting your location...";

    button.disabled = true;


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            // ==========================================
            // DISPLAY GPS
            // ==========================================

            document.getElementById("latitude").innerText =
                latitude.toFixed(6);

            document.getElementById("longitude").innerText =
                longitude.toFixed(6);

            document.getElementById("accuracy").innerText =
                accuracy.toFixed(2) + " meters";


            // ==========================================
            // CHECK ACCURACY
            // ==========================================

            if (accuracy > MAX_GPS_ACCURACY) {

                status.innerText =
                    "GPS accuracy is too low. " +
                    "Please enable precise location.";

                button.disabled = false;

                return;
            }


            // ==========================================
            // CALCULATE DISTANCE
            // ==========================================

            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    COLLEGE_LATITUDE,
                    COLLEGE_LONGITUDE
                );


            document.getElementById("distance").innerText =
                distance.toFixed(2) + " meters";


            // ==========================================
            // CHECK COLLEGE RADIUS
            // ==========================================

            if (distance > ALLOWED_RADIUS) {

                status.innerText =
                    "Attendance Rejected - Outside College.";

                button.disabled = false;

                return;
            }


            // ==========================================
            // SEND ATTENDANCE TO SERVER
            // ==========================================

            status.innerText =
                "Saving attendance...";


            try {

                const response =
                    await fetch("/api/attendance", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            student_id: studentId,

                            latitude: latitude,

                            longitude: longitude,

                            accuracy: accuracy,

                            distance: distance,

                            status: "Present"

                        })

                    });


                const data =
                    await response.json();


                console.log(
                    "Attendance response:",
                    data
                );


                if (response.ok && data.success) {

                    status.innerText =
                        "Attendance Marked Successfully!";

                } else {

                    status.innerText =
                        data.message ||
                        "Unable to mark attendance.";

                }

            } catch (error) {

                console.error(
                    "Attendance error:",
                    error
                );

                status.innerText =
                    "Unable to connect to server.";

            }


            button.disabled = false;

        },

        function (error) {

            console.error(
                "GPS Error:",
                error
            );

            button.disabled = false;


            if (error.code === 1) {

                status.innerText =
                    "Location permission denied. " +
                    "Please allow location access.";

            } else if (error.code === 2) {

                status.innerText =
                    "Location unavailable. " +
                    "Please turn on GPS/location services.";

            } else if (error.code === 3) {

                status.innerText =
                    "Location request timed out. " +
                    "Please try again.";

            } else {

                status.innerText =
                    "Unable to get your location.";

            }

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const studentData =
            localStorage.getItem("student");

        if (!studentData) {

            window.location.href =
                "/login.html";

            return;
        }


        const studentId =
            document.getElementById("studentId");

        try {

            const student =
                JSON.parse(studentData);

            if (student.student_id) {

                studentId.value =
                    student.student_id;

            }

        } catch (error) {

            console.error(
                "Student data error:",
                error
            );

            localStorage.removeItem("student");

            window.location.href =
                "/login.html";

            return;
        }


        const button =
            document.getElementById("attendanceBtn");


        // ==========================================
        // BUTTON CLICK
        // ==========================================

        button.addEventListener(
            "click",
            markAttendance
        );


        // ==========================================
        // GET LOCATION WHEN PAGE OPENS
        // ==========================================

        getLocation();

    }
);