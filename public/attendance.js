// College GPS coordinates
const COLLEGE_LATITUDE = 10.778700;
const COLLEGE_LONGITUDE = 76.693100;

// Allowed radius in meters
const ALLOWED_RADIUS = 100;


// Calculate distance between two GPS coordinates
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

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}


// Mark Attendance
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


    // Get GPS location
    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            // Display GPS information
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


            // Check college radius
            if (distance > ALLOWED_RADIUS) {

                status.innerHTML =
                    "❌ Attendance Rejected - Outside College";

                button.disabled = false;

                button.innerHTML =
                    "📍 Mark Attendance";

                return;
            }


            // Student is inside college
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


                if (response.ok) {

                    status.innerHTML =
                        "✅ Attendance Marked Successfully";

                } else {

                    status.innerHTML =
                        "❌ " + data.message;

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


        function(error) {

            console.error(error);

            status.innerHTML =
                "❌ Unable to get GPS location.";

            button.disabled = false;

            button.innerHTML =
                "📍 Mark Attendance";

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}