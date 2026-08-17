const completedCourses =
    JSON.parse(
        localStorage.getItem(
            "completedCourses"
        )
    ) || [];


const totalCourses = 10;


const completed =
    completedCourses.length;


const progress =
    Math.round(
        (completed / totalCourses) * 100
    );


document.getElementById(
    "progress"
).textContent = `${progress}%`;


document.getElementById(
    "completed"
).textContent = completed;


if (completed > 0) {

    document.getElementById(
        "completedMessage"
    ).textContent =
        `${completed} course(s) completed. Keep going! 🚀`;

}