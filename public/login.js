document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("studentLoginForm");
    const message = document.getElementById("loginMessage");

    if (!form) {
        console.error("Student login form not found");
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const student_id =
            document.getElementById("student_id").value.trim();

        const password =
            document.getElementById("password").value;

        if (!student_id || !password) {
            message.textContent =
                "Please enter Student ID and password.";
            return;
        }

        message.textContent = "Logging in...";

        try {

            const response = await fetch("/api/student-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    student_id: student_id,
                    password: password
                })
            });

            const data = await response.json();

            console.log("Login response:", data);

            if (data.success) {

                message.textContent =
                    "Login successful!";

                localStorage.setItem(
                    "student",
                    JSON.stringify(data.student)
                );

                setTimeout(function () {
                    window.location.href = "/index.html";
                }, 500);

            } else {

                message.textContent =
                    data.message || "Login failed.";

            }

        } catch (error) {

            console.error("Login error:", error);

            message.textContent =
                "Unable to connect to server.";
        }
    });
});