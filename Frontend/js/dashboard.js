// ============================================================
// LEARNPATH AI - DASHBOARD
// MULTI-PROFILE + ML CONNECTED VERSION
// ============================================================

const BACKEND_URL =
    "http://127.0.0.1:8000";


document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    console.log(
        "Loading selected learning profile..."
    );


    // ---------------------------------------------------------
    // GET SELECTED PROFILE
    // ---------------------------------------------------------

    const profile =
        getSelectedProfile();


    if (!profile) {

        showDefaultDashboard();

        return;
    }


    console.log(
        "Selected profile:",
        profile
    );


    // ---------------------------------------------------------
    // USER NAME
    // ---------------------------------------------------------

    updateUserName(
        profile
    );


    // ---------------------------------------------------------
    // STUDY TIME
    // ---------------------------------------------------------

    updateStudyTime(
        profile
    );


    // ---------------------------------------------------------
    // GET RECOMMENDATION
    // ---------------------------------------------------------

    let recommendation =
        profile.recommendation;


    if (
        !recommendation ||
        typeof recommendation !== "object"
    ) {

        try {

            recommendation =
                await fetchRecommendation(
                    profile
                );


            updateSelectedProfile({

                recommendation,

                totalRoadmapCourses:
                    Array.isArray(
                        recommendation.learning_path
                    )
                        ? recommendation.learning_path.length
                        : 0

            });

        } catch (error) {

            console.error(
                "ML recommendation failed:",
                error
            );


            recommendation = null;
        }
    }


    if (!recommendation) {

        updateEmptyDashboard();

        return;
    }


    console.log(
        "Recommendation for selected profile:",
        recommendation
    );


    // ---------------------------------------------------------
    // LEARNING PATH
    // ---------------------------------------------------------

    const learningPath =
        getLearningPath(
            recommendation
        );


    // ---------------------------------------------------------
    // COMPLETED COURSES
    // ---------------------------------------------------------

    const completedCourses =
        getCompletedCourses(
            profile
        );


    const completedElement =
        document.getElementById(
            "completed"
        );


    if (completedElement) {

        completedElement.textContent =
            completedCourses.length;
    }


    // ---------------------------------------------------------
    // TOTAL ROADMAP COURSES
    // ---------------------------------------------------------

    const totalRoadmapCourses =
        Number(
            profile.totalRoadmapCourses
        ) > 0

            ? Number(
                profile.totalRoadmapCourses
            )

            : learningPath.length;


    // ---------------------------------------------------------
    // AVAILABLE / REMAINING COURSES
    // ---------------------------------------------------------

    const availableCourses =
        document.getElementById(
            "availableCourses"
        );


    const remainingCourses =
        Math.max(
            0,
            totalRoadmapCourses -
            completedCourses.length
        );


    if (availableCourses) {

        availableCourses.textContent =
            remainingCourses;
    }


    // ---------------------------------------------------------
    // CURRENT SKILLS
    // ---------------------------------------------------------

    const currentSkills =
        getCurrentSkills(
            recommendation,
            profile
        );


    // ---------------------------------------------------------
    // SKILL GAPS
    // ---------------------------------------------------------

    const skillGaps =
        getSkillGaps(
            recommendation
        );


    // ---------------------------------------------------------
    // SKILL CHART
    // ---------------------------------------------------------

    updateSkillChart(
        currentSkills,
        skillGaps
    );


    // ---------------------------------------------------------
    // OVERALL COURSE PROGRESS
    //
    // Overall Progress is based on actual completed
    // roadmap courses, not goal readiness.
    // ---------------------------------------------------------

    let overallProgress =
        0;


    if (
        totalRoadmapCourses > 0
    ) {

        overallProgress =
            Math.round(
                (
                    completedCourses.length /
                    totalRoadmapCourses
                ) * 100
            );
    }


    overallProgress =
        clamp(
            overallProgress,
            0,
            100
        );


    updateProgress(
        overallProgress
    );


    // ---------------------------------------------------------
    // COMPLETED LEARNING
    // ---------------------------------------------------------

    updateCompletedLearning(
        completedCourses
    );


    // ---------------------------------------------------------
    // DEBUG
    // ---------------------------------------------------------

    console.log(
        "Dashboard loaded successfully."
    );


    console.log(
        "Completed courses:",
        completedCourses.length
    );


    console.log(
        "Total roadmap courses:",
        totalRoadmapCourses
    );


    console.log(
        "Available courses:",
        remainingCourses
    );


    console.log(
        "Overall progress:",
        `${overallProgress}%`
    );
}


// ============================================================
// GET SELECTED PROFILE
// ============================================================

function getSelectedProfile() {

    try {

        const profilesRaw =
            localStorage.getItem(
                "learnPathProfiles"
            );


        const selectedId =
            localStorage.getItem(
                "selectedProfileId"
            );


        if (
            profilesRaw &&
            selectedId
        ) {

            const profiles =
                JSON.parse(
                    profilesRaw
                );


            if (
                Array.isArray(
                    profiles
                )
            ) {

                const selected =
                    profiles.find(
                        profile =>
                            profile.id ===
                            selectedId
                    );


                if (selected) {

                    return selected;
                }
            }
        }


        // -----------------------------------------------------
        // Backward compatibility
        // -----------------------------------------------------

        const oldProfile =
            localStorage.getItem(
                "learnPathProfile"
            );


        if (oldProfile) {

            return JSON.parse(
                oldProfile
            );
        }

    } catch (error) {

        console.error(
            "Unable to read selected profile:",
            error
        );
    }


    return null;
}


// ============================================================
// UPDATE SELECTED PROFILE
// ============================================================

function updateSelectedProfile(
    updates
) {

    try {

        const profilesRaw =
            localStorage.getItem(
                "learnPathProfiles"
            );


        const selectedId =
            localStorage.getItem(
                "selectedProfileId"
            );


        if (
            !profilesRaw ||
            !selectedId
        ) {

            return;
        }


        const profiles =
            JSON.parse(
                profilesRaw
            );


        if (
            !Array.isArray(
                profiles
            )
        ) {

            return;
        }


        const index =
            profiles.findIndex(
                profile =>
                    profile.id ===
                    selectedId
            );


        if (index === -1) {

            return;
        }


        profiles[index] = {

            ...profiles[index],

            ...updates

        };


        localStorage.setItem(
            "learnPathProfiles",
            JSON.stringify(
                profiles
            )
        );


        // Backward compatibility
        localStorage.setItem(
            "learnPathProfile",
            JSON.stringify(
                profiles[index]
            )
        );

    } catch (error) {

        console.error(
            "Unable to update profile:",
            error
        );
    }
}


// ============================================================
// FETCH RECOMMENDATION
// ============================================================

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


// ============================================================
// USER NAME
// ============================================================

function updateUserName(
    profile
) {

    const nameElement =
        document.getElementById(
            "topNavName"
        );


    const welcomeElement =
        document.getElementById(
            "welcomeMessage"
        );


    let name =
        profile.name ||
        profile.full_name ||
        profile.fullName ||
        profile.username ||
        profile.userName ||
        profile.student_name;


    if (
        !name &&
        profile.user
    ) {

        name =
            profile.user.name ||
            profile.user.full_name ||
            profile.user.username;
    }


    name =
        name ||
        "Student";


    if (nameElement) {

        nameElement.textContent =
            name;
    }


    if (welcomeElement) {

        welcomeElement.textContent =
            `Welcome back, ${name}! 👋`;
    }
}


// ============================================================
// STUDY TIME
// ============================================================

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


    const studyTime =
        profile.study_time ||
        profile.studyTime ||
        profile.hours_per_week ||
        profile.hoursPerWeek ||
        profile.hours_per_day ||
        profile.hoursPerDay ||
        profile.daily_hours ||
        profile.dailyHours;


    if (
        studyTime === undefined ||
        studyTime === null ||
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
        `${studyTime} hours/week`;
}


// ============================================================
// LEARNING PATH
// ============================================================

function getLearningPath(
    recommendation
) {

    if (
        !recommendation ||
        !Array.isArray(
            recommendation.learning_path
        )
    ) {

        return [];
    }


    return recommendation.learning_path;
}


// ============================================================
// COMPLETED COURSES
// ============================================================

function getCompletedCourses(
    profile
) {

    // ---------------------------------------------------------
    // CURRENT MULTI-PROFILE SOURCE
    // ---------------------------------------------------------

    if (
        profile &&
        Array.isArray(
            profile.completed
        )
    ) {

        return profile.completed;
    }


    // ---------------------------------------------------------
    // ALTERNATIVE PROFILE FIELD
    // ---------------------------------------------------------

    if (
        profile &&
        Array.isArray(
            profile.completedCourses
        )
    ) {

        return profile.completedCourses;
    }


    // ---------------------------------------------------------
    // LEGACY STORAGE FALLBACK
    // ---------------------------------------------------------

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
            "Could not read completed courses:",
            error
        );

        return [];
    }
}


// ============================================================
// CURRENT SKILLS
// ============================================================

function getCurrentSkills(
    recommendation,
    profile
) {

    // Backend response
    if (
        recommendation &&
        Array.isArray(
            recommendation.current_skills
        )
    ) {

        return uniqueSkills(
            recommendation.current_skills
        );
    }


    const fields = [

        "skills",

        "current_skills",

        "currentSkills",

        "known_skills",

        "knownSkills",

        "technical_skills",

        "technicalSkills"

    ];


    for (
        const field of fields
    ) {

        const value =
            profile[field];


        if (
            Array.isArray(
                value
            )
        ) {

            return uniqueSkills(
                value
                    .map(
                        extractSkillName
                    )
                    .filter(Boolean)
            );
        }


        if (
            typeof value === "string"
        ) {

            return uniqueSkills(
                value
                    .split(",")
                    .map(
                        skill =>
                            skill.trim()
                    )
                    .filter(Boolean)
            );
        }
    }


    return [];
}


// ============================================================
// SKILL GAPS
// ============================================================

function getSkillGaps(
    recommendation
) {

    if (
        !recommendation ||
        !Array.isArray(
            recommendation.skill_gaps
        )
    ) {

        return [];
    }


    return uniqueSkills(
        recommendation.skill_gaps
    );
}


// ============================================================
// EXTRACT SKILL NAME
// ============================================================

function extractSkillName(
    skill
) {

    if (
        typeof skill === "string"
    ) {

        return skill.trim();
    }


    if (
        skill &&
        typeof skill === "object"
    ) {

        return (

            skill.name ||

            skill.skill ||

            skill.title ||

            skill.label ||

            ""

        );
    }


    return "";
}


// ============================================================
// UNIQUE SKILLS
// ============================================================

function uniqueSkills(
    skills
) {

    const result =
        [];

    const seen =
        new Set();


    if (
        !Array.isArray(
            skills
        )
    ) {

        return result;
    }


    skills.forEach(
        skill => {

            const name =
                extractSkillName(
                    skill
                );


            const normalized =
                name
                    .trim()
                    .toLowerCase();


            if (
                normalized &&
                !seen.has(
                    normalized
                )
            ) {

                seen.add(
                    normalized
                );


                result.push(
                    name
                );
            }
        }
    );


    return result;
}


// ============================================================
// CALCULATE READINESS
// ============================================================
//
// Kept for compatibility.
// This is GOAL READINESS, not overall course progress.
// ============================================================

function calculateReadiness(
    recommendation,
    currentSkills,
    skillGaps
) {

    if (
        recommendation &&
        Number.isFinite(
            Number(
                recommendation
                    .readiness_percentage
            )
        )
    ) {

        return clamp(
            Number(
                recommendation
                    .readiness_percentage
            ),
            0,
            100
        );
    }


    const existing =
        new Set(
            currentSkills.map(
                skill =>
                    skill
                        .trim()
                        .toLowerCase()
            )
        );


    const gaps =
        new Set(
            skillGaps.map(
                skill =>
                    skill
                        .trim()
                        .toLowerCase()
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


    return clamp(

        Math.round(

            (
                existing.size /
                total
            ) * 100

        ),

        0,

        100

    );
}


// ============================================================
// UPDATE OVERALL PROGRESS
// ============================================================

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


// ============================================================
// DONUT
// ============================================================

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


// ============================================================
// SKILL CHART
// ============================================================

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


    chart.innerHTML =
        "";


    const skillMap =
        new Map();


    // Current skills
    currentSkills.forEach(
        skill => {

            const key =
                skill
                    .trim()
                    .toLowerCase();


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


    // Skill gaps
    skillGaps.forEach(
        skill => {

            const key =
                skill
                    .trim()
                    .toLowerCase();


            if (
                !skillMap.has(
                    key
                )
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


// ============================================================
// CREATE SKILL BAR
// ============================================================

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


    container.style.position =
        "relative";


    container.style.height =
        "100px";


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


// ============================================================
// COMPLETED LEARNING
// ============================================================

function updateCompletedLearning(
    completedCourses
) {

    const message =
        document.getElementById(
            "completedMessage"
        );


    if (!message) {

        return;
    }


    if (
        completedCourses.length === 0
    ) {

        message.textContent =
            "No completed courses yet. Start your roadmap to see progress here.";

        return;
    }


    const names =
        completedCourses
            .map(
                course => {

                    if (
                        typeof course === "string"
                    ) {

                        return course;
                    }


                    return (
                        course.title ||
                        course.name ||
                        course.course ||
                        "Completed course"
                    );
                }
            );


    if (
        names.length === 1
    ) {

        message.textContent =
            `You have completed ${names[0]}. Keep going with your personalized roadmap!`;

    } else {

        message.textContent =
            `You have completed ${names.length} courses: ${names.join(", ")}. Keep going with your personalized roadmap!`;
    }
}


// ============================================================
// EMPTY DASHBOARD
// ============================================================

function updateEmptyDashboard() {

    setText(
        "progress",
        "0%"
    );


    setText(
        "completed",
        "0"
    );


    setText(
        "availableCourses",
        "0"
    );


    setText(
        "studyTime",
        "Not set"
    );


    setText(
        "donutPercentage",
        "0%"
    );


    const chart =
        document.getElementById(
            "skillChart"
        );


    if (chart) {

        chart.innerHTML = `

            <p style="opacity:0.7;">

                No recommendation data available.

            </p>

        `;
    }


    updateDonut(
        0
    );


    const message =
        document.getElementById(
            "completedMessage"
        );


    if (message) {

        message.textContent =
            "No completed courses yet. Start your roadmap to see progress here.";
    }
}


// ============================================================
// DEFAULT DASHBOARD
// ============================================================

function showDefaultDashboard() {

    console.warn(
        "No selected learning profile found."
    );


    setText(
        "topNavName",
        "Student"
    );


    setText(
        "welcomeMessage",
        "Welcome back! 👋"
    );


    updateEmptyDashboard();
}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


// ============================================================
// CLAMP
// ============================================================

function clamp(
    value,
    min,
    max
) {

    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );
}