document.addEventListener("DOMContentLoaded", function () {

    const studentData = localStorage.getItem("student");

    if (!studentData) {
        window.location.href = "/login.html";
        return;
    }

    let student;

    try {
        student = JSON.parse(studentData);
    } catch (error) {
        console.error("Invalid student data:", error);
        localStorage.removeItem("student");
        window.location.href = "/login.html";
        return;
    }

    const studentName = document.getElementById("studentName");
    const studentId = document.getElementById("studentId");
    const status = document.getElementById("status");
    const container = document.getElementById("attendanceContainer");
    const loadButton = document.getElementById("loadAttendanceBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const id = student.student_id;

    if (studentName) {
        studentName.textContent = student.name || "-";
    }

    if (studentId) {
        studentId.textContent = id || "-";
    }

    async function loadAttendance() {

        if (!id) {
            status.textContent = "Student ID not found.";
            return;
        }

        status.textContent = "Loading attendance...";
        container.innerHTML = "";

        try {

            const response = await fetch(
                "/api/student-attendance?student_id=" +
                encodeURIComponent(id)
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load attendance");
            }

            if (!data.attendance || data.attendance.length === 0) {
                status.textContent = "No attendance records found.";
                return;
            }

            status.textContent =
                "Attendance records: " + data.attendance.length;

            const table = document.createElement("table");

            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Distance</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = table.querySelector("tbody");

            data.attendance.forEach(function (record) {

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${record.attendance_date || "-"}</td>
                    <td>${record.attendance_time || "-"}</td>
                    <td>${record.status || "-"}</td>
                    <td>${record.latitude ?? "-"}</td>
                    <td>${record.longitude ?? "-"}</td>
                    <td>${record.distance ?? "-"} m</td>
                `;

                tbody.appendChild(row);
            });

            container.appendChild(table);

        } catch (error) {

            console.error("Attendance loading error:", error);

            status.textContent =
                "Unable to load attendance: " + error.message;
        }
    }

    if (loadButton) {
        loadButton.addEventListener("click", loadAttendance);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("student");
            window.location.href = "/login.html";
        });
    }

    loadAttendance();
});