document.addEventListener("DOMContentLoaded", function () {

    const professorData = localStorage.getItem("professor");

    if (!professorData) {
        window.location.href = "/faculty-login.html";
        return;
    }

    const professor = JSON.parse(professorData);

    document.getElementById("facultyId").textContent =
        professor.professor_id;

    document.getElementById("facultyName").textContent =
        professor.name;

    document.getElementById("facultyEmail").textContent =
        professor.email || "Not available";
});


function viewAttendance() {

    window.location.href = "/faculty-attendance.html";
}


function markAttendance() {

    window.location.href = "/faculty-mark-attendance.html";
}


function editAttendance() {

    window.location.href = "/faculty-edit-attendance.html";
}


function downloadReport() {

    window.location.href = "/faculty-report.html";
}


function logout() {

    localStorage.removeItem("professor");

    window.location.href = "/faculty-login.html";
}