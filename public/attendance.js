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
// CALCULATE DISTANCE BETWEEN GPS COORDINATES
// ==========================================

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

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
// MARK ATTENDANCE
// ==========================================

function markAttendance() {

    const studentIdElement =
        document.getElementById("studentId");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("attendanceBtn");


    // Get Student ID
    const studentId =
        studentIdElement.value.trim();


    // Check Student ID
    if (studentId === "") {

        status.innerHTML =
            "❌ Please enter Student ID";

        return;
    }


    // Check GPS support
    if (!navigator.geolocation) {

        status.innerHTML =
            "❌ GPS is not supported by this browser.";

        return;
    }


    button.disabled = true;

    button.innerHTML =
        "📍 Getting Location...";

    status.innerHTML =
        "⏳ Checking GPS location...";


    // ==========================================
    // GET GPS LOCATION
    // ==========================================

    navigator.geolocation.getCurrentPosition(

        async function(position) {

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
            // CHECK GPS ACCURACY
            // ==========================================

            if (accuracy > MAX_GPS_ACCURACY) {

                status.innerHTML =
                    "❌ GPS accuracy is too low. " +
                    "Please enable precise location and try again.";

                button.disabled = false;

                button.innerHTML =
                    "📍 Mark Attendance";

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

                status.innerHTML =
                    "❌ Attendance Rejected - Outside College";

                button.disabled = false;

                button.innerHTML =
                    "📍 Mark Attendance";

                return;
            }


            // ==========================================
            // STUDENT IS INSIDE COLLEGE
            // ==========================================

            status.innerHTML =
                "⏳ Saving attendance...";


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


                // ==========================================
                // SERVER RESPONSE
                // ==========================================

                if (response.ok) {

                    status.innerHTML =
                        "✅ Attendance Marked Successfully";

                } else {

                    status.innerHTML =
                        "❌ " + (
                            data.message ||
                            "Failed to mark attendance"
                        );

                }


            } catch (error) {

                console.error(error);

                status.innerHTML =
                    "❌ Server connection error.";

            }


            button.disabled = false;

            button.innerHTML =
                "📍 Mark Attendance";

        },


        // ==========================================
        // GPS ERROR
        // ==========================================

        function(error) {

            console.error(error);

            let message =
                "❌ Unable to get GPS location.";

            if (error.code === 1) {

                message =
                    "❌ Location permission denied. " +
                    "Please allow location access.";

            } else if (error.code === 2) {

                message =
                    "❌ GPS location unavailable.";

            } else if (error.code === 3) {

                message =
                    "❌ GPS request timed out. Please try again.";

            }

            status.innerHTML = message;

            button.disabled = false;

            button.innerHTML =
                "📍 Mark Attendance";

        },


        // ==========================================
        // GPS OPTIONS
        // ==========================================

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }

    );

}