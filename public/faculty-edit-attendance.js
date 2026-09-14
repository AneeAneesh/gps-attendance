document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------
    // CHECK FACULTY LOGIN
    // ----------------------------------

    const professorData = localStorage.getItem("professor");

    if (!professorData) {
        window.location.href = "/faculty-login.html";
        return;
    }


    // ----------------------------------
    // ELEMENTS
    // ----------------------------------

    const dateInput =
        document.getElementById("attendanceDate");

    const loadButton =
        document.getElementById("loadAttendanceBtn");

    const message =
        document.getElementById("message");

    const container =
        document.getElementById("attendanceContainer");


    // ----------------------------------
    // SET TODAY'S DATE
    // ----------------------------------

    const now = new Date();

    const today =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

    dateInput.value = today;


    // ----------------------------------
    // LOAD BUTTON
    // ----------------------------------

    loadButton.addEventListener(
        "click",
        loadAttendance
    );


    // ----------------------------------
    // LOAD ATTENDANCE
    // ----------------------------------

    async function loadAttendance() {

        const date = dateInput.value;

        if (!date) {
            message.textContent =
                "Please select a date.";
            return;
        }

        message.textContent =
            "Loading attendance...";

        container.innerHTML = "";

        try {

            const response = await fetch(
                "/api/attendance?date=" +
                encodeURIComponent(date)
            );

            const data =
                await response.json();

            console.log(
                "Attendance response:",
                data
            );


            if (!data.success) {

                message.textContent =
                    data.message ||
                    "Unable to load attendance.";

                return;
            }


            if (
                !data.attendance ||
                data.attendance.length === 0
            ) {

                message.textContent =
                    "No attendance records found.";

                return;
            }


            message.textContent =
                data.attendance.length +
                " attendance record(s) found.";


            // ----------------------------------
            // CREATE TABLE
            // ----------------------------------

            const table =
                document.createElement("table");

            table.border = "1";

            table.cellPadding = "8";

            table.style.width = "100%";


            // ----------------------------------
            // HEADER
            // ----------------------------------

            const headerRow =
                document.createElement("tr");


            const headers = [
                "Student ID",
                "Student Name",
                "Course",
                "Date",
                "Time",
                "Status",
                "Action"
            ];


            headers.forEach(function (header) {

                const th =
                    document.createElement("th");

                th.textContent = header;

                headerRow.appendChild(th);

            });


            table.appendChild(headerRow);


            // ----------------------------------
            // RECORDS
            // ----------------------------------

            data.attendance.forEach(function (record) {

                const row =
                    document.createElement("tr");


                // ----------------------------------
                // STUDENT ID
                // ----------------------------------

                const studentIdCell =
                    document.createElement("td");

                studentIdCell.textContent =
                    record.student_id || "";

                row.appendChild(studentIdCell);


                // ----------------------------------
                // STUDENT NAME
                // ----------------------------------

                const nameCell =
                    document.createElement("td");

                nameCell.textContent =
                    record.name || "";

                row.appendChild(nameCell);


                // ----------------------------------
                // COURSE
                // ----------------------------------

                const courseCell =
                    document.createElement("td");

                courseCell.textContent =
                    record.course || "";

                row.appendChild(courseCell);


                // ----------------------------------
                // DATE INPUT
                // ----------------------------------

                const dateCell =
                    document.createElement("td");

                const editDate =
                    document.createElement("input");

                editDate.type = "date";

                editDate.value =
                    formatDate(record.attendance_date);

                dateCell.appendChild(editDate);

                row.appendChild(dateCell);


                // ----------------------------------
                // TIME INPUT
                // ----------------------------------

                const timeCell =
                    document.createElement("td");

                const editTime =
                    document.createElement("input");

                editTime.type = "time";

                editTime.value =
                    formatTime(record.attendance_time);

                timeCell.appendChild(editTime);

                row.appendChild(timeCell);


                // ----------------------------------
                // STATUS
                // ----------------------------------

                const statusCell =
                    document.createElement("td");

                const statusSelect =
                    document.createElement("select");


                const presentOption =
                    document.createElement("option");

                presentOption.value =
                    "Present";

                presentOption.textContent =
                    "Present";


                const absentOption =
                    document.createElement("option");

                absentOption.value =
                    "Absent";

                absentOption.textContent =
                    "Absent";


                statusSelect.appendChild(
                    presentOption
                );

                statusSelect.appendChild(
                    absentOption
                );


                statusSelect.value =
                    record.status || "Present";


                statusCell.appendChild(
                    statusSelect
                );

                row.appendChild(statusCell);


                // ----------------------------------
                // ACTION
                // ----------------------------------

                const actionCell =
                    document.createElement("td");


                // SAVE BUTTON
                const saveButton =
                    document.createElement("button");

                saveButton.textContent =
                    "Save";


                saveButton.addEventListener(
                    "click",
                    function () {

                        updateAttendance(
                            record.id,
                            editDate.value,
                            editTime.value,
                            statusSelect.value
                        );

                    }
                );


                // DELETE BUTTON
                const deleteButton =
                    document.createElement("button");

                deleteButton.textContent =
                    "Delete";

                deleteButton.style.marginLeft =
                    "5px";


                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteAttendance(
                            record.id
                        );

                    }
                );


                actionCell.appendChild(
                    saveButton
                );

                actionCell.appendChild(
                    deleteButton
                );


                row.appendChild(actionCell);

                table.appendChild(row);

            });


            container.appendChild(table);

        } catch (error) {

            console.error(
                "Load attendance error:",
                error
            );

            message.textContent =
                "Unable to connect to server.";
        }
    }


    // ----------------------------------
    // FORMAT DATE
    // ----------------------------------

    function formatDate(value) {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (isNaN(date.getTime())) {
            return value;
        }

        return (
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0")
        );
    }


    // ----------------------------------
    // FORMAT TIME
    // ----------------------------------

    function formatTime(value) {

        if (!value) {
            return "";
        }

        // MySQL TIME normally arrives as HH:MM:SS
        // HTML time input needs HH:MM

        if (
            typeof value === "string" &&
            value.length >= 5
        ) {
            return value.substring(0, 5);
        }

        return value;
    }


    // ----------------------------------
    // UPDATE ATTENDANCE
    // ----------------------------------

    async function updateAttendance(
        attendanceId,
        attendanceDate,
        attendanceTime,
        status
    ) {

        if (!attendanceDate) {

            alert("Please select a date.");

            return;
        }


        if (!attendanceTime) {

            alert("Please select a time.");

            return;
        }


        try {

            const response = await fetch(
                "/api/attendance/" +
                attendanceId,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        attendance_date:
                            attendanceDate,

                        attendance_time:
                            attendanceTime,

                        status:
                            status

                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "Update response:",
                data
            );


            if (data.success) {

                alert(
                    "Attendance updated successfully."
                );

                loadAttendance();

            } else {

                alert(
                    data.message ||
                    "Unable to update attendance."
                );
            }

        } catch (error) {

            console.error(
                "Update attendance error:",
                error
            );

            alert(
                "Unable to connect to server."
            );
        }
    }


    // ----------------------------------
    // DELETE ATTENDANCE
    // ----------------------------------

    async function deleteAttendance(
        attendanceId
    ) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this attendance record?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
                "/api/attendance/" +
                attendanceId,
                {
                    method: "DELETE"
                }
            );


            const data =
                await response.json();


            console.log(
                "Delete response:",
                data
            );


            if (data.success) {

                alert(
                    "Attendance deleted successfully."
                );

                loadAttendance();

            } else {

                alert(
                    data.message ||
                    "Unable to delete attendance."
                );
            }

        } catch (error) {

            console.error(
                "Delete attendance error:",
                error
            );

            alert(
                "Unable to connect to server."
            );
        }
    }

});