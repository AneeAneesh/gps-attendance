document.addEventListener("DOMContentLoaded", function () {

    // Check student login
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

    // Display student information
    const studentName =
        document.getElementById("studentName");

    const studentId =
        document.getElementById("studentId");

    const studentCourse =
        document.getElementById("studentCourse");

    if (studentName) {
        studentName.textContent =
            student.name || "Student";
    }

    if (studentId) {
        studentId.textContent =
            student.student_id || "-";
    }

    if (studentCourse) {
        studentCourse.textContent =
            student.course || "-";
    }

    // Logout
    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem("student");

                window.location.href =
                    "/login.html";
            }
        );
    }

});