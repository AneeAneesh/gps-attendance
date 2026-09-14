document.addEventListener("DOMContentLoaded", function () {

    const professorData =
        localStorage.getItem("professor");

    if (!professorData) {

        window.location.href =
            "/faculty-login.html";

        return;
    }


    const now = new Date();

    const today =
        now.toISOString().split("T")[0];

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");


    document.getElementById("attendanceDate").value =
        today;

    document.getElementById("attendanceTime").value =
        hours + ":" + minutes;


    const form =
        document.getElementById("markAttendanceForm");


    form.addEventListener("submit", async function (event) {

        event.preventDefault();


        const student_id =
            document.getElementById("studentId").value.trim();

        const attendance_date =
            document.getElementById("attendanceDate").value;

        const attendance_time =
            document.getElementById("attendanceTime").value;

        const status =
            document.getElementById("status").value;

        const message =
            document.getElementById(
                "markAttendanceMessage"
            );


        if (
            !student_id ||
            !attendance_date ||
            !attendance_time ||
            !status
        ) {

            message.textContent =
                "Please fill in all fields.";

            return;
        }


        message.textContent =
            "Marking attendance...";


        try {

            const response = await fetch(
                "/api/mark-attendance",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        student_id: student_id,
                        attendance_date: attendance_date,
                        attendance_time: attendance_time,
                        status: status
                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "Mark attendance response:",
                data
            );


            if (data.success) {

                message.textContent =
                    "Attendance marked successfully.";

                document.getElementById("studentId").value =
                    "";

            } else {

                message.textContent =
                    data.message ||
                    "Unable to mark attendance.";
            }


        } catch (error) {

            console.error(
                "Mark attendance error:",
                error
            );

            message.textContent =
                "Unable to connect to server.";
        }

    });

});