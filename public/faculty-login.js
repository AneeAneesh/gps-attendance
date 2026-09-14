document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("facultyLoginForm");
    const message = document.getElementById("loginMessage");

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const professor_id =
            document.getElementById("professor_id").value.trim();

        const password =
            document.getElementById("password").value;

        if (!professor_id || !password) {
            message.textContent =
                "Please enter Faculty ID and password.";
            return;
        }

        message.textContent = "Logging in...";

        try {

            const response = await fetch("/api/professor-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    professor_id: professor_id,
                    password: password
                })
            });

            const data = await response.json();

            console.log("Faculty login response:", data);

            if (data.success) {

                message.textContent =
                    "Login successful!";

                localStorage.setItem(
                    "professor",
                    JSON.stringify(data.professor)
                );

                setTimeout(function () {
                    window.location.href = "/faculty-dashboard.html";
                }, 500);

            } else {

                message.textContent =
                    data.message || "Login failed.";

            }

        } catch (error) {

            console.error("Faculty login error:", error);

            message.textContent =
                "Unable to connect to server.";
        }
    });
});