// ==========================================
// GPS STUDENT ATTENDANCE SYSTEM
// STEP 2 - NODE.JS BACKEND
// ==========================================


// College GPS coordinates
// Temporary coordinates

const COLLEGE_LATITUDE = 12.253954 ;
const COLLEGE_LONGITUDE = 75.138827;


// Allowed radius

const ALLOWED_RADIUS = 100;


// ==========================================
// MARK ATTENDANCE
// ==========================================

function markAttendance() {

    const studentId =
        document.getElementById("studentId").value.trim();

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("attendanceBtn");


    // Check Student ID

    if (studentId === "") {

        status.innerHTML =
            "❌ Please enter Student ID";

        return;
    }


    // Check browser GPS

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


    // Get GPS

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            // Display GPS

            document.getElementById("latitude").innerText =
                latitude.toFixed(6);

            document.getElementById("longitude").innerText =
                longitude.toFixed(6);

            document.getElementById("accuracy").innerText =
                accuracy.toFixed(2) + " meters";


            // Calculate distance

            const distance =
                calculateDistance(

                    latitude,
                    longitude,

                    COLLEGE_LATITUDE,
                    COLLEGE_LONGITUDE

                );


            document.getElementById("distance").innerText =
                distance.toFixed(2) + " meters";


            // ======================================
            // CHECK COLLEGE RADIUS
            // ======================================

            if (distance > ALLOWED_RADIUS) {

                status.innerHTML =
                    "❌ Attendance Rejected - Outside College";

                button.disabled = false;

                button.innerHTML =
                    "📍 Mark Attendance";

                return;
            }


            // ======================================
            // SEND DATA TO NODE.JS
            // ======================================

            try {

                const response =
                    await fetch("/api/attendance", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            studentId: studentId,

                            latitude: latitude,

                            longitude: longitude,

                            accuracy: accuracy,

                            distance: distance

                        })

                    });


                const result =
                    await response.json();


                // ======================================
                // SERVER RESPONSE
                // ======================================

                if (result.success) {

                    status.innerHTML =
                        "✅ " + result.message;

                } else {

                    status.innerHTML =
                        "❌ " + result.message;

                }

            }

            catch (error) {

                console.error(error);

                status.innerHTML =
                    "❌ Unable to connect to server.";

            }


            button.disabled = false;

            button.innerHTML =
                "📍 Mark Attendance";

        },


        function(error) {

            button.disabled = false;

            button.innerHTML =
                "📍 Mark Attendance";


            if (error.code === 1) {

                status.innerHTML =
                    "❌ Location permission denied.";

            }

            else if (error.code === 2) {

                status.innerHTML =
                    "❌ Location unavailable.";

            }

            else if (error.code === 3) {

                status.innerHTML =
                    "❌ GPS request timed out.";

            }

            else {

                status.innerHTML =
                    "❌ Unable to get GPS location.";

            }

        },


        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}


// ==========================================
// HAVERSINE DISTANCE FORMULA
// ==========================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371000;


    const lat1Radians =
        lat1 * Math.PI / 180;

    const lat2Radians =
        lat2 * Math.PI / 180;


    const differenceLatitude =
        (lat2 - lat1) * Math.PI / 180;

    const differenceLongitude =
        (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(differenceLatitude / 2) *
        Math.sin(differenceLatitude / 2)

        +

        Math.cos(lat1Radians) *
        Math.cos(lat2Radians) *

        Math.sin(differenceLongitude / 2) *
        Math.sin(differenceLongitude / 2);


    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;
}