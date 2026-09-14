document.addEventListener("DOMContentLoaded", function () {

    const professorData = localStorage.getItem("professor");

    if (!professorData) {
        window.location.href = "/faculty-login.html";
        return;
    }

    // Automatically select today's date
    const today = new Date().toISOString().split("T")[0];

    document.getElementById("attendanceDate").value = today;

    // Load today's attendance
    loadAttendance();
});


async function loadAttendance() {

    const date = document.getElementById("attendanceDate").value;
    const message = document.getElementById("attendanceMessage");
    const tableBody = document.getElementById("attendanceBody");

    if (!date) {
        message.textContent = "Please select a date.";
        return;
    }

    message.textContent = "Loading attendance...";
    tableBody.innerHTML = "";

    try {

        const response = await fetch(
            `/api/attendance?date=${encodeURIComponent(date)}`
        );

        const data = await response.json();

        console.log("Attendance response:", data);

        if (!data.success) {
            message.textContent =
                data.message || "Unable to load attendance.";
            return;
        }

        if (!data.attendance || data.attendance.length === 0) {

            message.textContent =
                "No attendance records found for this date.";

            return;
        }

        data.attendance.forEach(function (record) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${record.student_id || ""}</td>
                <td>${record.name || ""}</td>
                <td>${record.course || ""}</td>
                <td>${record.date || date}</td>
                <td>${record.time || ""}</td>
                <td>${record.status || "Present"}</td>
            `;

            tableBody.appendChild(row);
        });

        message.textContent =
            `${data.attendance.length} attendance record(s) found.`;

    } catch (error) {

        console.error("Attendance loading error:", error);

        message.textContent =
            "Unable to connect to server.";
    }
}