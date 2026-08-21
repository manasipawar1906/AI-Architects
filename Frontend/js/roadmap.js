/* =========================================================
   LEARNPATH AI - ROADMAP
   ML CONNECTED VERSION
   ========================================================= */


// =========================================================
// BACKEND
// =========================================================

const BACKEND_URL =
    "http://127.0.0.1:8000";


// =========================================================
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    loadRoadmap
);


// =========================================================
// LOAD ROADMAP
// =========================================================

async function loadRoadmap() {

    console.log(
        "Loading ML-powered roadmap..."
    );


    // -----------------------------------------------------
    // GET PROFILE
    // -----------------------------------------------------

    let profileData = {};


    try {

        profileData =
            JSON.parse(
                sessionStorage.getItem(
                    "learnPathProfile"
                )
            ) || {};

    }

    catch (error) {

        console.error(
            "Unable to read saved profile:",
            error
        );

        showBackendError(
            "Saved profile data is invalid."
        );

        return;
    }


    console.log(
        "Profile:",
        profileData
    );


    // -----------------------------------------------------
    // CHECK PROFILE
    // -----------------------------------------------------

    if (
        !profileData
        ||
        !profileData.name
    ) {

        alert(
            "Please complete your profile first."
        );


        window.location.href =
            "profile.html";


        return;
    }


    // -----------------------------------------------------
    // UPDATE NAME
    // -----------------------------------------------------

    updateStudentName(
        profileData
    );


    // -----------------------------------------------------
    // LOADING
    // -----------------------------------------------------

    showLoading();


    // -----------------------------------------------------
    // REMOVE OLD RECOMMENDATION
    // -----------------------------------------------------

    localStorage.removeItem(
        "recommendation"
    );


    // -----------------------------------------------------
    // CALL BACKEND
    // -----------------------------------------------------

    try {

        console.log(
            "Sending profile to backend..."
        );


        console.log(
            "Backend URL:",
            `${BACKEND_URL}/recommend`
        );


        console.log(
            "Request data:",
            profileData
        );


        const response =
            await fetch(

                `${BACKEND_URL}/recommend`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            profileData
                        )

                }

            );


        console.log(
            "Backend status:",
            response.status
        );


        // -------------------------------------------------
        // HANDLE ERROR
        // -------------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Backend error ${response.status}`;


            try {

                const errorData =
                    await response.json();


                console.error(
                    "BACKEND ERROR:",
                    errorData
                );


                if (
                    errorData
                    &&
                    errorData.detail
                ) {

                    if (
                        typeof
                        errorData.detail
                        ===
                        "object"
                    ) {

                        errorMessage =
                            JSON.stringify(
                                errorData.detail,
                                null,
                                2
                            );

                    }

                    else {

                        errorMessage =
                            String(
                                errorData.detail
                            );

                    }

                }

                else {

                    errorMessage =
                        JSON.stringify(
                            errorData,
                            null,
                            2
                        );

                }

            }

            catch (parseError) {

                console.error(
                    "Could not parse backend error:",
                    parseError
                );


                errorMessage =
                    `Backend returned HTTP ${response.status}`;

            }


            throw new Error(
                errorMessage
            );
        }


        // -------------------------------------------------
        // READ RESPONSE
        // -------------------------------------------------

        const recommendationData =
            await response.json();


        console.log(
            "================================"
        );


        console.log(
            "ML RECOMMENDATION RECEIVED"
        );


        console.log(
            recommendationData
        );


        console.log(
            "================================"
        );


        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        if (
            !recommendationData
        ) {

            throw new Error(
                "Backend returned an empty response."
            );

        }


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        localStorage.setItem(

            "recommendation",

            JSON.stringify(
                recommendationData
            )

        );


        // -------------------------------------------------
        // DISPLAY
        // -------------------------------------------------

        displayRoadmap(

            profileData,

            recommendationData

        );

    }


    catch (error) {

        console.error(
            "================================"
        );


        console.error(
            "ROADMAP GENERATION ERROR"
        );


        console.error(
            error
        );


        console.error(
            "================================"
        );


        showBackendError(
            error
        );

    }

}


// =========================================================
// DISPLAY ROADMAP
// =========================================================

function displayRoadmap(
    profileData,
    recommendationData
) {

    const learningPath =
        recommendationData.learning_path
        || [];


    const userSkills =
        getCurrentSkills(
            profileData
        );


    const skillGaps =
        recommendationData.skill_gaps
        || [];


    // -----------------------------------------------------
    // GOAL
    // -----------------------------------------------------

    const goal =
        recommendationData.goal
        ||
        profileData.goal
        ||
        "Learning";


    const goalElement =
        document.getElementById(
            "goal"
        );


    if (goalElement) {

        goalElement.textContent =
            `${goal} Journey`;

    }


    // -----------------------------------------------------
    // SKILLS YOU HAVE
    // -----------------------------------------------------

    const skillsHave =
        document.getElementById(
            "skillsHave"
        );


    if (skillsHave) {

        skillsHave.textContent =
            userSkills.length;

    }


    // -----------------------------------------------------
    // SKILLS TO LEARN
    // -----------------------------------------------------

    const skillsToLearn =
        document.getElementById(
            "skillsToLearn"
        );


    if (skillsToLearn) {

        skillsToLearn.textContent =
            skillGaps.length;

    }


    // -----------------------------------------------------
    // RECOMMENDED STEPS
    // -----------------------------------------------------

    const recommendedSteps =
        document.getElementById(
            "recommendedSteps"
        );


    if (recommendedSteps) {

        recommendedSteps.textContent =
            learningPath.length;

    }


    // -----------------------------------------------------
    // READINESS
    // -----------------------------------------------------

    let readiness;


    if (
        typeof
        recommendationData
            .readiness_percentage
        ===
        "number"
    ) {

        readiness =
            recommendationData
                .readiness_percentage;

    }

    else {

        const totalSkills =
            userSkills.length
            +
            skillGaps.length;


        if (
            totalSkills > 0
        ) {

            readiness =
                Math.round(

                    (
                        userSkills.length
                        /
                        totalSkills
                    )
                    *
                    100

                );

        }

        else {

            readiness = 0;

        }

    }


    readiness =
        Math.max(
            0,
            Math.min(
                100,
                readiness
            )
        );


    // -----------------------------------------------------
    // UPDATE READINESS
    // -----------------------------------------------------

    const readinessPercentage =
        document.getElementById(
            "readinessPercentage"
        );


    if (
        readinessPercentage
    ) {

        readinessPercentage.textContent =
            `${readiness}%`;

    }


    const readinessText =
        document.getElementById(
            "readinessText"
        );


    if (
        readinessText
    ) {

        readinessText.textContent =
            `${readiness}% ready`;

    }


    // -----------------------------------------------------
    // DISPLAY SKILL TAGS
    // -----------------------------------------------------

    const skillTags =
        document.getElementById(
            "skillTags"
        );


    if (skillTags) {

        skillTags.innerHTML =
            "";


        // -----------------------------------------------
        // CURRENT SKILLS
        // -----------------------------------------------

        userSkills.forEach(
            skill => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "skill-have";


                tag.textContent =
                    "✓ " + skill;


                skillTags.appendChild(
                    tag
                );

            }
        );


        // -----------------------------------------------
        // SKILL GAPS
        // -----------------------------------------------

        skillGaps.forEach(
            skill => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "skill-needed";


                tag.textContent =
                    "→ " + skill;


                skillTags.appendChild(
                    tag
                );

            }
        );

    }


    // =====================================================
    // ROADMAP
    // =====================================================

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    if (!roadmapContainer) {

        return;

    }


    roadmapContainer.innerHTML =
        "";


    // -----------------------------------------------------
    // NO COURSES
    // -----------------------------------------------------

    if (
        learningPath.length === 0
    ) {

        roadmapContainer.innerHTML = `

            <div class="course-card">

                <h3>
                    No new courses recommended
                </h3>

                <p>
                    The AI recommendation engine
                    did not return any new courses
                    for this profile.
                </p>

            </div>

        `;


        return;

    }


    // -----------------------------------------------------
    // COURSE CARDS
    // -----------------------------------------------------

    learningPath.forEach(

        (
            course,
            index
        ) => {


            const step =
                document.createElement(
                    "div"
                );


            step.className =
                "roadmap-step";


            const skills =
                Array.isArray(
                    course.skills
                )

                    ?

                course.skills.join(
                    ", "
                )

                    :

                course.skills
                ||
                "N/A";


            // -------------------------------------------------
            // MASTERY VALUES
            // -------------------------------------------------

            const masteryBefore =
                Number(
                    course.mastery_before
                    ??
                    0
                );


            const masteryGain =
                Number(
                    course.mastery_gain
                    ??
                    0
                );


            const masteryAfter =
                Number(
                    course.mastery_after
                    ??
                    0
                );


            // -------------------------------------------------
            // COURSE CARD
            // -------------------------------------------------

            step.innerHTML = `

                <div class="step-number">

                    ${index + 1}

                </div>


                <div class="course-card">


                    <!-- COURSE TOP -->

                    <div class="course-top">

                        <span class="level">

                            ${escapeHTML(
                                course.level
                                ||
                                "N/A"
                            )}

                        </span>


                        <span class="hours">

                            ${escapeHTML(
                                course.duration
                                ||
                                "N/A"
                            )}

                        </span>

                    </div>


                    <!-- COURSE TITLE -->

                    <h3>

                        ${escapeHTML(
                            course.title
                            ||
                            "Recommended Course"
                        )}

                    </h3>


                    <!-- COURSE INFORMATION -->

                    <div class="course-info">


                        <!-- DESCRIPTION -->

                        <p>

                            <strong>
                                Description:
                            </strong>

                            ${escapeHTML(
                                course.description
                                ||
                                ""
                            )}

                        </p>


                        <!-- MASTERY -->

                        <div
                            class="mastery-box"
                            style="
                                margin: 18px 0;
                                padding: 16px;
                                border-radius: 10px;
                                background: rgba(124, 58, 237, 0.10);
                                border: 1px solid rgba(124, 58, 237, 0.25);
                            "
                        >

                            <div
                                style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 8px;
                                "
                            >

                                <strong>
                                    Skill Progress
                                </strong>

                                <span
                                    style="
                                        font-weight: 600;
                                    "
                                >

                                    ${masteryBefore}%
                                    →
                                    ${masteryAfter}%

                                </span>

                            </div>


                            <div
                                style="
                                    height: 8px;
                                    background: #272b3a;
                                    border-radius: 10px;
                                    overflow: hidden;
                                "
                            >

                                <div
                                    style="
                                        width: ${masteryAfter}%;
                                        height: 100%;
                                        background: linear-gradient(
                                            90deg,
                                            #7c3aed,
                                            #a855f7
                                        );
                                        border-radius: 10px;
                                    "
                                ></div>

                            </div>


                            <p
                                style="
                                    margin-top: 8px;
                                    margin-bottom: 0;
                                "
                            >

                                Estimated mastery gain:

                                <strong>
                                    +${masteryGain}%
                                </strong>

                            </p>

                        </div>


                        <!-- SKILLS -->

                        <p>

                            <strong>
                                Skills:
                            </strong>

                            ${escapeHTML(
                                skills
                            )}

                        </p>


                        <!-- PROJECT -->

                        <p>

                            <strong>
                                Project:
                            </strong>

                            ${escapeHTML(
                                course.project
                                ||
                                ""
                            )}

                        </p>


                    </div>


                    <!-- PROJECT -->

                    <div class="course-project">

                        🏆 Complete

                        ${escapeHTML(
                            course.title
                            ||
                            "this course"
                        )}

                        and finish the project

                    </div>


                    <!-- BUTTONS -->

                    <div class="course-buttons">


                        <button
                            onclick="
                                completeCourse(
                                    ${index}
                                )
                            "
                        >

                            Mark Complete

                        </button>


                        <button
                            onclick="
                                giveFeedback(
                                    '${escapeJS(
                                        course.title
                                        ||
                                        "Course"
                                    )}'
                                )
                            "
                        >

                            Give Feedback

                        </button>


                    </div>


                </div>

            `;


            roadmapContainer.appendChild(
                step
            );

        }

    );


    // =====================================================
    // TOP AI RECOMMENDATIONS
    // =====================================================

    const recommendationContainer =
        document.getElementById(
            "recommendationContainer"
        );


    if (
        recommendationContainer
    ) {

        recommendationContainer.innerHTML =
            "";


        learningPath.forEach(

            course => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "recommendation-card";


                const skills =
                    Array.isArray(
                        course.skills
                    )

                        ?

                    course.skills.join(
                        ", "
                    )

                        :

                    course.skills
                    ||
                    "N/A";


                const masteryBefore =
                    Number(
                        course.mastery_before
                        ??
                        0
                    );


                const masteryGain =
                    Number(
                        course.mastery_gain
                        ??
                        0
                    );


                const masteryAfter =
                    Number(
                        course.mastery_after
                        ??
                        0
                    );


                card.innerHTML = `

                    <h3>

                        ${escapeHTML(
                            course.title
                            ||
                            "Recommended Course"
                        )}

                    </h3>


                    <p>

                        <strong>
                            Level:
                        </strong>

                        ${escapeHTML(
                            course.level
                            ||
                            "N/A"
                        )}

                    </p>


                    <p>

                        <strong>
                            Duration:
                        </strong>

                        ${escapeHTML(
                            course.duration
                            ||
                            "N/A"
                        )}

                    </p>


                    <p>

                        <strong>
                            Skills:
                        </strong>

                        ${escapeHTML(
                            skills
                        )}

                    </p>


                    <p>

                        <strong>
                            Skill Progress:
                        </strong>

                        ${masteryBefore}%
                        →
                        ${masteryAfter}%

                        (+${masteryGain}%)

                    </p>


                    <p>

                        ${escapeHTML(
                            course.description
                            ||
                            ""
                        )}

                    </p>

                `;


                recommendationContainer.appendChild(
                    card
                );

            }

        );

    }


    // =====================================================
    // DEBUG
    // =====================================================

    console.log(
        "================================"
    );


    console.log(
        "ML ROADMAP LOADED"
    );


    console.log(
        "Profile:",
        profileData
    );


    console.log(
        "User skills:",
        userSkills
    );


    console.log(
        "Skill gaps:",
        skillGaps
    );


    console.log(
        "Learning path:",
        learningPath
    );


    console.log(
        "Readiness:",
        readiness
    );


    console.log(
        "================================"
    );

}


// =========================================================
// GET CURRENT SKILLS
// =========================================================

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
            typeof value
            ===
            "string"
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


// =========================================================
// EXTRACT SKILL
// =========================================================

function extractSkillName(
    skill
) {

    if (
        typeof skill
        ===
        "string"
    ) {

        return skill.trim();

    }


    if (
        typeof skill
        ===
        "object"

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


// =========================================================
// UPDATE STUDENT NAME
// =========================================================

function updateStudentName(
    profileData
) {

    const element =
        document.getElementById(
            "topNavName"
        );


    if (
        !element
        ||
        !profileData.name
    ) {

        return;

    }


    const firstName =
        profileData.name
            .trim()
            .split(/\s+/)[0];


    element.textContent =
        firstName;

}


// =========================================================
// COMPLETE COURSE
// =========================================================

function completeCourse(
    index
) {

    const recommendation =
        JSON.parse(
            localStorage.getItem(
                "recommendation"
            )
        ) || {};


    const learningPath =
        recommendation.learning_path
        || [];


    const course =
        learningPath[index];


    if (!course) {

        alert(
            "Course not found."
        );

        return;

    }


    const completed =
        JSON.parse(
            localStorage.getItem(
                "completedCourses"
            )
        ) || [];


    const courseName =
        course.title
        ||
        `Course ${index + 1}`;


    if (
        !completed.includes(
            courseName
        )
    ) {

        completed.push(
            courseName
        );

    }


    localStorage.setItem(

        "completedCourses",

        JSON.stringify(
            completed
        )

    );


    alert(
        "Course marked as completed! 🎉"
    );

}


// =========================================================
// FEEDBACK
// =========================================================

function giveFeedback(
    course
) {

    const feedback =
        prompt(
            `Give feedback for ${course}:`
        );


    if (feedback) {

        console.log(
            "Course feedback:",
            {

                course:
                    course,

                feedback:
                    feedback

            }
        );


        alert(
            "Thank you for your feedback! ❤️"
        );

    }

}


// =========================================================
// LOADING
// =========================================================

function showLoading() {

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    if (
        roadmapContainer
    ) {

        roadmapContainer.innerHTML = `

            <div class="course-card">

                <h3>

                    🤖 Generating your
                    personalized learning path...

                </h3>


                <p>

                    The AI recommendation engine
                    is analyzing your skills,
                    experience and learning goals.

                </p>

            </div>

        `;

    }

}


// =========================================================
// ERROR
// =========================================================

function showBackendError(
    error
) {

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    let message;


    if (
        error instanceof Error
    ) {

        message =
            error.message;

    }

    else if (
        typeof error
        ===
        "object"
    ) {

        try {

            message =
                JSON.stringify(
                    error,
                    null,
                    2
                );

        }

        catch (
            stringifyError
        ) {

            message =
                String(error);

        }

    }

    else {

        message =
            String(error);

    }


    console.error(
        "Roadmap error:",
        message
    );


    if (
        roadmapContainer
    ) {

        roadmapContainer.innerHTML = `

            <div class="course-card">

                <h3>

                    ⚠️ Unable to generate roadmap

                </h3>


                <p>

                    <strong>
                        Error:
                    </strong>

                </p>


                <pre
                    style="
                        white-space: pre-wrap;
                        word-break: break-word;
                        font-family: monospace;
                    "
                >${escapeHTML(
                    message
                )}</pre>


                <p>

                    Make sure both services
                    are running.

                </p>


                <p>

                    Backend:
                    http://127.0.0.1:8000

                </p>


                <p>

                    ML:
                    http://127.0.0.1:8001

                </p>

            </div>

        `;

    }

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// JAVASCRIPT ESCAPE
// =========================================================

function escapeJS(
    value
) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        )

        .replace(
            /\n/g,
            "\\n"
        )

        .replace(
            /\r/g,
            "\\r"
        );

}