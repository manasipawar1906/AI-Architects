/* =========================================================
   LEARNPATH AI - DASHBOARD
   ML CONNECTED VERSION
   ========================================================= */

const BACKEND_URL =
    "http://127.0.0.1:8000";


document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

async function loadDashboard() {

    console.log(
        "Loading ML-powered dashboard..."
    );


    // -----------------------------------------------------
    // PROFILE
    // -----------------------------------------------------

    const profile =
        getObject(
            "learnPathProfile"
        );


    // -----------------------------------------------------
    // COMPLETED COURSES
    // -----------------------------------------------------

    const completedCourses =
        getCompletedCourses();


    console.log(
        "Profile:",
        profile
    );


    console.log(
        "Completed Courses:",
        completedCourses
    );


    // -----------------------------------------------------
    // USER NAME
    // -----------------------------------------------------

    updateUserName(
        profile
    );


    // -----------------------------------------------------
    // STUDY TIME
    // -----------------------------------------------------

    updateStudyTime(
        profile
    );


    // -----------------------------------------------------
    // GET FRESH ML RECOMMENDATION
    // -----------------------------------------------------

    let recommendation;


    try {

        recommendation =
            await fetchRecommendation(
                profile
            );


        console.log(
            "Fresh ML Recommendation:",
            recommendation
        );


        // Save latest ML response

        localStorage.setItem(

            "recommendation",

            JSON.stringify(
                recommendation
            )

        );


    } catch (error) {

        console.error(
            "ML recommendation failed:",
            error
        );


        // Fallback to old cached result

        recommendation =
            getObject(
                "recommendation"
            );


        console.warn(
            "Using cached recommendation."
        );

    }


    // -----------------------------------------------------
    // GOAL
    // -----------------------------------------------------

    updateGoal(
        recommendation
    );


    // -----------------------------------------------------
    // LEARNING PATH
    // -----------------------------------------------------

    const learningPath =
        getLearningPath(
            recommendation
        );


    const availableCourses =
        document.getElementById(
            "availableCourses"
        );


    if (availableCourses) {

        availableCourses.textContent =
            learningPath.length;

    }


    // -----------------------------------------------------
    // COMPLETED COURSES
    // -----------------------------------------------------

    const completedElement =
        document.getElementById(
            "completed"
        );


    if (completedElement) {

        completedElement.textContent =
            completedCourses.length;

    }


    // -----------------------------------------------------
    // CURRENT SKILLS
    // -----------------------------------------------------

    const currentSkills =
        getCurrentSkills(
            profile
        );


    // -----------------------------------------------------
    // SKILL GAPS
    // -----------------------------------------------------

    const skillGaps =
        getSkillGaps(
            recommendation
        );


    // -----------------------------------------------------
    // SKILL CHART
    // -----------------------------------------------------

    updateSkillChart(

        currentSkills,

        skillGaps

    );


    // -----------------------------------------------------
    // READINESS
    // -----------------------------------------------------

    const readiness =
        calculateReadiness(

            currentSkills,

            skillGaps

        );


    updateProgress(
        readiness
    );


    // -----------------------------------------------------
    // COMPLETED LEARNING
    // -----------------------------------------------------

    updateCompletedLearning(
        completedCourses
    );


    console.log(
        "Dashboard loaded successfully."
    );

}


/* =========================================================
   FETCH RECOMMENDATION FROM FASTAPI + ML
   ========================================================= */

async function fetchRecommendation(
    profile
) {

    if (
        !profile ||
        Object.keys(profile).length === 0
    ) {

        throw new Error(
            "Learner profile is empty."
        );

    }


    console.log(
        "Sending profile to ML backend..."
    );


    const response =
        await fetch(

            `${BACKEND_URL}/recommend`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        profile
                    )

            }

        );


    if (!response.ok) {

        const errorText =
            await response.text();


        throw new Error(

            `Backend returned ${response.status}: ${errorText}`

        );

    }


    return await response.json();

}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function getObject(
    key
) {

    try {

        const value =
            localStorage.getItem(
                key
            );


        if (!value) {

            return {};

        }


        return JSON.parse(
            value
        );


    } catch (error) {

        console.error(

            `Unable to read ${key}:`,

            error

        );


        return {};

    }

}


/* =========================================================
   COMPLETED COURSES
   ========================================================= */

function getCompletedCourses() {

    try {

        const value =
            localStorage.getItem(
                "completedCourses"
            );


        if (!value) {

            return [];

        }


        const courses =
            JSON.parse(
                value
            );


        return Array.isArray(
            courses
        )

            ? courses

            : [];


    } catch (error) {

        console.error(

            "Unable to read completedCourses:",

            error

        );


        return [];

    }

}


/* =========================================================
   USER NAME
   ========================================================= */

function updateUserName(
    profile
) {

    const element =
        document.getElementById(
            "welcomeUser"
        );


    if (!element) {

        return;

    }


    let name =

        profile.name
        ||

        profile.full_name
        ||

        profile.fullName
        ||

        profile.username
        ||

        profile.userName
        ||

        profile.student_name;


    if (
        !name &&
        profile.user
    ) {

        name =

            profile.user.name
            ||

            profile.user.full_name
            ||

            profile.user.username;

    }


    if (name) {

        element.textContent =
            `Welcome, ${name} 👋`;

    } else {

        element.textContent =
            "Welcome 👋";

    }

}


/* =========================================================
   GOAL
   ========================================================= */

function updateGoal(
    recommendation
) {

    const goal =
        recommendation.goal;


    console.log(
        "Career Goal:",
        goal
    );

}


/* =========================================================
   STUDY TIME
   ========================================================= */

function updateStudyTime(
    profile
) {

    const element =
        document.getElementById(
            "studyTime"
        );


    if (!element) {

        return;

    }


    let studyTime =

        profile.study_time
        ||

        profile.studyTime
        ||

        profile.hours_per_day
        ||

        profile.hoursPerDay
        ||

        profile.daily_hours
        ||

        profile.dailyHours
        ||

        profile.hours_per_week
        ||

        profile.hoursPerWeek;


    if (

        studyTime === undefined
        ||

        studyTime === null
        ||

        studyTime === ""

    ) {

        element.textContent =
            "Not set";


        return;

    }


    if (
        typeof studyTime === "string"
    ) {

        element.textContent =
            studyTime;


        return;

    }


    element.textContent =
        `${studyTime} hours/day`;

}


/* =========================================================
   LEARNING PATH
   ========================================================= */

function getLearningPath(
    recommendation
) {

    if (

        !recommendation
        ||

        !Array.isArray(
            recommendation.learning_path
        )

    ) {

        return [];

    }


    return recommendation.learning_path;

}


/* =========================================================
   CURRENT SKILLS
   ========================================================= */

function getCurrentSkills(
    profile
) {

    if (!profile) {

        return [];

    }


    const possibleFields = [

        "skills",

        "current_skills",

        "currentSkills",

        "known_skills",

        "knownSkills",

        "technical_skills",

        "technicalSkills"

    ];


    for (
        const field of possibleFields
    ) {

        const value =
            profile[field];


        if (
            Array.isArray(value)
        ) {

            return value

                .map(
                    extractSkillName
                )

                .filter(
                    Boolean
                );

        }


        if (
            typeof value === "string"
        ) {

            return value

                .split(",")

                .map(
                    skill =>
                        skill.trim()
                )

                .filter(
                    Boolean
                );

        }

    }


    return [];

}


/* =========================================================
   SKILL GAPS
   ========================================================= */

function getSkillGaps(
    recommendation
) {

    if (

        !recommendation
        ||

        !Array.isArray(
            recommendation.skill_gaps
        )

    ) {

        return [];

    }


    return recommendation.skill_gaps

        .map(
            extractSkillName
        )

        .filter(
            Boolean
        );

}


/* =========================================================
   EXTRACT SKILL NAME
   ========================================================= */

function extractSkillName(
    skill
) {

    if (
        typeof skill === "string"
    ) {

        return skill.trim();

    }


    if (

        typeof skill === "object"
        &&
        skill !== null

    ) {

        return (

            skill.name
            ||

            skill.skill
            ||

            skill.title
            ||

            skill.label
            ||

            ""

        );

    }


    return "";

}


/* =========================================================
   NORMALIZE SKILL
   ========================================================= */

function normalizeSkill(
    skill
) {

    return String(skill)

        .trim()

        .toLowerCase();

}


/* =========================================================
   CALCULATE READINESS
   ========================================================= */

function calculateReadiness(

    currentSkills,

    skillGaps

) {

    const existing =
        new Set(

            currentSkills.map(
                normalizeSkill
            )

        );


    const gaps =
        new Set(

            skillGaps.map(
                normalizeSkill
            )

        );


    const total =
        new Set([

            ...existing,

            ...gaps

        ]).size;


    if (
        total === 0
    ) {

        return 0;

    }


    const readiness =
        Math.round(

            (
                existing.size
                /
                total
            ) * 100

        );


    return Math.min(

        100,

        Math.max(
            0,
            readiness
        )

    );

}


/* =========================================================
   UPDATE OVERALL PROGRESS
   ========================================================= */

function updateProgress(
    percentage
) {

    const progress =
        document.getElementById(
            "progress"
        );


    const donutPercentage =
        document.getElementById(
            "donutPercentage"
        );


    if (progress) {

        progress.textContent =
            `${percentage}%`;

    }


    if (donutPercentage) {

        donutPercentage.textContent =
            `${percentage}%`;

    }


    updateDonut(
        percentage
    );

}


/* =========================================================
   DONUT
   ========================================================= */

function updateDonut(
    percentage
) {

    const donut =
        document.getElementById(
            "progressDonut"
        );


    if (!donut) {

        return;

    }


    donut.style.background =

        `conic-gradient(
            #ff5c7a 0% ${percentage}%,
            #20273f ${percentage}% 100%
        )`;

}


/* =========================================================
   SKILL CHART
   ========================================================= */

function updateSkillChart(

    currentSkills,

    skillGaps

) {

    const chart =
        document.getElementById(
            "skillChart"
        );


    if (!chart) {

        return;

    }


    chart.innerHTML = "";


    const skillMap =
        new Map();


    // -----------------------------------------------------
    // CURRENT SKILLS
    // -----------------------------------------------------

    currentSkills.forEach(
        skill => {

            const key =
                normalizeSkill(
                    skill
                );


            skillMap.set(

                key,

                {

                    name:
                        skill,

                    percentage:
                        90

                }

            );

        }

    );


    // -----------------------------------------------------
    // SKILL GAPS
    // -----------------------------------------------------

    skillGaps.forEach(
        skill => {

            const key =
                normalizeSkill(
                    skill
                );


            if (
                !skillMap.has(key)
            ) {

                skillMap.set(

                    key,

                    {

                        name:
                            skill,

                        percentage:
                            30

                    }

                );

            }

        }

    );


    const skills =
        Array.from(
            skillMap.values()
        );


    if (
        skills.length === 0
    ) {

        chart.innerHTML = `

            <p style="opacity:0.7;">
                No skill information available.
            </p>

        `;


        return;

    }


    skills.forEach(
        skill => {

            createSkillBar(

                chart,

                skill.name,

                skill.percentage

            );

        }

    );

}


/* =========================================================
   CREATE SKILL BAR
   ========================================================= */

function createSkillBar(

    chart,

    name,

    percentage

) {

    const container =
        document.createElement(
            "div"
        );


    const bar =
        document.createElement(
            "span"
        );


    const label =
        document.createElement(
            "label"
        );


    bar.style.height =
        `${percentage}%`;


    label.textContent =
        name;


    bar.title =
        `${name}: ${percentage}%`;


    container.appendChild(
        bar
    );


    container.appendChild(
        label
    );


    chart.appendChild(
        container
    );

}


/* =========================================================
   COMPLETED LEARNING
   ========================================================= */

function updateCompletedLearning(
    completedCourses
) {

    const message =
        document.getElementById(
            "completedMessage"
        );


    const list =
        document.getElementById(
            "completedList"
        );


    if (!message) {

        return;

    }


    if (list) {

        list.innerHTML = "";

    }


    if (
        completedCourses.length === 0
    ) {

        message.textContent =
            "No completed courses yet. Start your roadmap to see progress here.";


        return;

    }


    message.textContent =

        `You have completed ${
            completedCourses.length
        } course${
            completedCourses.length === 1
                ? ""
                : "s"
        }. Great work! 🎉`;


    if (!list) {

        return;

    }


    completedCourses.forEach(
        course => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "completed-course";


            let name;


            if (
                typeof course === "string"
            ) {

                name = course;

            }

            else if (

                typeof course === "object"
                &&
                course !== null

            ) {

                name =

                    course.title
                    ||

                    course.name
                    ||

                    course.course
                    ||

                    course.skill
                    ||

                    "Completed Course";

            }

            else {

                name =
                    "Completed Course";

            }


            item.textContent =
                `✓ ${name}`;


            list.appendChild(
                item
            );

        }

    );

}


/* =========================================================
   UPDATE WHEN STORAGE CHANGES
   ========================================================= */

window.addEventListener(

    "storage",

    event => {

        if (

            event.key ===
                "completedCourses"

            ||

            event.key ===
                "recommendation"

            ||

            event.key ===
                "learnPathProfile"

        ) {

            loadDashboard();

        }

    }

);


/* =========================================================
   UPDATE WHEN USER RETURNS
   ========================================================= */

window.addEventListener(

    "focus",

    () => {

        loadDashboard();

    }

);