document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------
    // CHECK FACULTY LOGIN
    // ----------------------------------

    const professorData =
        localStorage.getItem("professor");

    if (!professorData) {
        window.location.href =
            "/faculty-login.html";
        return;
    }


    // ----------------------------------
    // ELEMENTS
    // ----------------------------------

    const reportDate =
        document.getElementById("reportDate");

    const loadReportBtn =
        document.getElementById("loadReportBtn");

    const downloadCsvBtn =
        document.getElementById("downloadCsvBtn");

    const reportMessage =
        document.getElementById("reportMessage");

    const reportContainer =
        document.getElementById("reportContainer");


    // ----------------------------------
    // STORE REPORT DATA
    // ----------------------------------

    let reportData = [];


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

    reportDate.value = today;


    // ----------------------------------
    // LOAD REPORT
    // ----------------------------------

    loadReportBtn.addEventListener(
        "click",
        loadReport
    );


    async function loadReport() {

        const date = reportDate.value;


        if (!date) {

            reportMessage.textContent =
                "Please select a date.";

            return;
        }


        reportMessage.textContent =
            "Loading report...";

        reportContainer.innerHTML = "";


        try {

            const response = await fetch(
                "/api/attendance?date=" +
                encodeURIComponent(date)
            );


            const data =
                await response.json();


            console.log(
                "Report response:",
                data
            );


            if (!data.success) {

                reportMessage.textContent =
                    data.message ||
                    "Unable to load report.";

                return;
            }


            reportData =
                data.attendance || [];


            if (reportData.length === 0) {

                reportMessage.textContent =
                    "No attendance records found for " +
                    date + ".";

                return;
            }


            reportMessage.textContent =
                reportData.length +
                " attendance record(s) found.";


            displayReport(reportData);

        } catch (error) {

            console.error(
                "Report loading error:",
                error
            );


            reportMessage.textContent =
                "Unable to connect to server.";

        }

    }


    // ----------------------------------
    // DISPLAY REPORT
    // ----------------------------------

    function displayReport(records) {

        reportContainer.innerHTML = "";


        const table =
            document.createElement("table");


        table.border = "1";

        table.cellPadding = "8";

        table.style.width = "100%";


        // ----------------------------------
        // TABLE HEADER
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
            "Latitude",
            "Longitude",
            "Accuracy",
            "Distance"
        ];


        headers.forEach(function (header) {

            const th =
                document.createElement("th");

            th.textContent =
                header;

            headerRow.appendChild(th);

        });


        table.appendChild(headerRow);


        // ----------------------------------
        // TABLE DATA
        // ----------------------------------

        records.forEach(function (record) {

            const row =
                document.createElement("tr");


            addCell(
                row,
                record.student_id
            );

            addCell(
                row,
                record.name
            );

            addCell(
                row,
                record.course
            );

            addCell(
                row,
                record.attendance_date
            );

            addCell(
                row,
                record.attendance_time
            );

            addCell(
                row,
                record.status
            );

            addCell(
                row,
                record.latitude
            );

            addCell(
                row,
                record.longitude
            );

            addCell(
                row,
                record.accuracy
            );

            addCell(
                row,
                record.distance
            );


            table.appendChild(row);

        });


        reportContainer.appendChild(table);

    }


    // ----------------------------------
    // ADD TABLE CELL
    // ----------------------------------

    function addCell(row, value) {

        const cell =
            document.createElement("td");

        if (
            value === null ||
            value === undefined
        ) {

            cell.textContent = "";

        } else {

            cell.textContent = value;

        }

        row.appendChild(cell);

    }


    // ----------------------------------
    // DOWNLOAD CSV
    // ----------------------------------

    downloadCsvBtn.addEventListener(
        "click",
        downloadCSV
    );


    function downloadCSV() {

        if (reportData.length === 0) {

            alert(
                "Please load an attendance report first."
            );

            return;
        }


        const headers = [
            "Student ID",
            "Student Name",
            "Course",
            "Attendance Date",
            "Attendance Time",
            "Status",
            "Latitude",
            "Longitude",
            "Accuracy",
            "Distance"
        ];


        const rows = [];


        rows.push(headers);


        reportData.forEach(function (record) {

            rows.push([

                record.student_id || "",

                record.name || "",

                record.course || "",

                record.attendance_date || "",

                record.attendance_time || "",

                record.status || "",

                record.latitude ?? "",

                record.longitude ?? "",

                record.accuracy ?? "",

                record.distance ?? ""

            ]);

        });


        // ----------------------------------
        // CONVERT TO CSV
        // ----------------------------------

        const csv = rows
            .map(function (row) {

                return row
                    .map(function (value) {

                        const text =
                            String(value);

                        return '"' +
                            text.replace(
                                /"/g,
                                '""'
                            ) +
                            '"';

                    })
                    .join(",");

            })
            .join("\n");


        // ----------------------------------
        // CREATE DOWNLOAD FILE
        // ----------------------------------

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        const selectedDate =
            reportDate.value ||
            "attendance";


        link.download =
            "attendance-report-" +
            selectedDate +
            ".csv";


        document.body.appendChild(link);


        link.click();


        document.body.removeChild(link);


        URL.revokeObjectURL(url);

    }

});