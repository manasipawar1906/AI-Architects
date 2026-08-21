// =========================================================
// LEARNPATH AI - DYNAMIC ROADMAP
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
        "Loading personalized LearnPath AI roadmap..."
    );

    let profileData = {};
    let recommendationData = null;

    // -----------------------------------------------------
    // READ PROFILE
    // -----------------------------------------------------

    try {

        profileData =
            JSON.parse(
                sessionStorage.getItem(
                    "learnPathProfile"
                )
            ) || {};

    } catch (error) {

        console.error(
            "Profile data error:",
            error
        );

        showError(
            "Saved profile data is invalid."
        );

        return;
    }


    console.log(
        "CURRENT PROFILE:",
        profileData
    );


    // -----------------------------------------------------
    // PROFILE CHECK
    // -----------------------------------------------------

    if (
        !profileData ||
        !profileData.name
    ) {

        alert(
            "Please complete your profile first."
        );

        window.location.href =
            "profile.html";

        return;
    }


    updateStudentName(
        profileData
    );


    // -----------------------------------------------------
    // USE FRESHLY GENERATED ROADMAP
    // -----------------------------------------------------

    try {

        const savedRoadmap =
            sessionStorage.getItem(
                "learnPathRoadmap"
            );

        if (savedRoadmap) {

            recommendationData =
                JSON.parse(
                    savedRoadmap
                );

            console.log(
                "Using roadmap generated for CURRENT profile."
            );
        }

    } catch (error) {

        console.warn(
            "Could not read saved roadmap:",
            error
        );

        sessionStorage.removeItem(
            "learnPathRoadmap"
        );
    }


    // -----------------------------------------------------
    // FALLBACK API REQUEST
    // -----------------------------------------------------

    if (!recommendationData) {

        showLoading();

        try {

            console.log(
                "No saved roadmap found."
            );

            console.log(
                "Sending CURRENT profile to backend:",
                profileData
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
                                profileData
                            )
                    }
                );


            if (!response.ok) {

                let message =
                    `Backend returned ${response.status}`;

                try {

                    const data =
                        await response.json();

                    if (data?.detail) {

                        message =
                            typeof data.detail === "string"
                                ? data.detail
                                : JSON.stringify(
                                    data.detail,
                                    null,
                                    2
                                );
                    }

                } catch (error) {
                    console.error(
                        error
                    );
                }

                throw new Error(
                    message
                );
            }


            recommendationData =
                await response.json();


            sessionStorage.setItem(
                "learnPathRoadmap",
                JSON.stringify(
                    recommendationData
                )
            );


        } catch (error) {

            console.error(
                "Roadmap generation error:",
                error
            );

            showError(
                error.message
            );

            return;
        }
    }


    // -----------------------------------------------------
    // SAVE CURRENT RECOMMENDATION
    // -----------------------------------------------------

    localStorage.setItem(
        "recommendation",
        JSON.stringify(
            recommendationData
        )
    );


    console.log(
        "FINAL ROADMAP:",
        recommendationData
    );


    // -----------------------------------------------------
    // DISPLAY
    // -----------------------------------------------------

    displayRoadmap(
        profileData,
        recommendationData
    );
}


// =========================================================
// DISPLAY ROADMAP
// =========================================================

function displayRoadmap(
    profileData,
    roadmapData
) {

    const learningPath =
        Array.isArray(
            roadmapData.learning_path
        )
            ? roadmapData.learning_path
            : [];


    const skillGaps =
        Array.isArray(
            roadmapData.skill_gaps
        )
            ? roadmapData.skill_gaps
            : [];


    const userSkills =
        getCurrentSkills(
            profileData
        );


    // -----------------------------------------------------
    // GOAL
    // -----------------------------------------------------

    const goal =
        roadmapData.goal ||
        profileData.goal ||
        "Learning";


    const goalElement =
        document.getElementById(
            "roadmapTitle"
        );


    if (goalElement) {

        goalElement.textContent =
            `${goal} Journey`;
    }


    // -----------------------------------------------------
    // SUBTITLE
    // -----------------------------------------------------

    const subtitle =
        document.getElementById(
            "roadmapSubtitle"
        );


    if (subtitle) {

        const months =
            profileData.target_months ||
            6;

        const hours =
            profileData.study_time ||
            0;

        subtitle.textContent =
            `${hours} hours/week • ` +
            `${months} month target`;
    }


    // -----------------------------------------------------
    // NAME
    // -----------------------------------------------------

    updateStudentName(
        profileData
    );


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

    let readiness =
        Number(
            roadmapData.readiness_percentage
        );


    if (!Number.isFinite(readiness)) {

        const total =
            userSkills.length +
            skillGaps.length;

        readiness =
            total > 0
                ? Math.round(
                    (
                        userSkills.length /
                        total
                    ) * 100
                )
                : 0;
    }


    readiness =
        Math.max(
            0,
            Math.min(
                100,
                readiness
            )
        );


    const readinessElement =
        document.getElementById(
            "readinessPercentage"
        );


    if (readinessElement) {

        readinessElement.textContent =
            `${readiness}%`;
    }


    // -----------------------------------------------------
    // SKILL TAGS
    // -----------------------------------------------------

    renderSkillMap(
        userSkills,
        skillGaps
    );


    // -----------------------------------------------------
    // ROADMAP
    // -----------------------------------------------------

    renderRoadmapCards(
        learningPath
    );


    // -----------------------------------------------------
    // TOP RECOMMENDATIONS
    // -----------------------------------------------------

    renderRecommendations(
        learningPath
    );


    console.log(
        "================================"
    );

    console.log(
        "PERSONALIZED ROADMAP LOADED"
    );

    console.log(
        "Goal:",
        goal
    );

    console.log(
        "User Skills:",
        userSkills
    );

    console.log(
        "Skill Gaps:",
        skillGaps
    );

    console.log(
        "Steps:",
        learningPath.length
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
// CURRENT SKILLS
// =========================================================

function getCurrentSkills(
    profile
) {

    if (!profile) {
        return [];
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
            Array.isArray(value)
        ) {

            return value
                .map(
                    skill =>
                        extractSkillName(
                            skill
                        )
                )
                .filter(Boolean);
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
                .filter(Boolean);
        }
    }


    return [];
}


// =========================================================
// SKILL NAME
// =========================================================

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


// =========================================================
// SKILL MAP
// =========================================================

function renderSkillMap(
    userSkills,
    skillGaps
) {

    const container =
        document.getElementById(
            "skillTags"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // CURRENT SKILLS

    userSkills.forEach(
        skill => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "skill-have";

            tag.textContent =
                `✓ ${skill}`;

            container.appendChild(
                tag
            );
        }
    );


    // REQUIRED SKILLS

    skillGaps.forEach(
        skill => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "skill-needed";

            tag.textContent =
                `→ ${skill}`;

            container.appendChild(
                tag
            );
        }
    );


    if (
        userSkills.length === 0 &&
        skillGaps.length === 0
    ) {

        const tag =
            document.createElement(
                "span"
            );

        tag.textContent =
            "No skill information available.";

        container.appendChild(
            tag
        );
    }
}


// =========================================================
// ROADMAP CARDS
// =========================================================

function renderRoadmapCards(
    learningPath
) {

    const container =
        document.getElementById(
            "roadmapContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        learningPath.length === 0
    ) {

        container.innerHTML = `
            <div class="course-card">
                <h3>
                    No new courses recommended
                </h3>

                <p>
                    The recommendation engine
                    did not return a learning path
                    for this profile.
                </p>
            </div>
        `;

        return;
    }


    learningPath.forEach(
        (course, index) => {

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
                    ? course.skills.join(", ")
                    : (
                        course.skills ||
                        course.skill ||
                        "N/A"
                    );


            const masteryBefore =
                Number(
                    course.mastery_before ?? 0
                );


            const masteryGain =
                Number(
                    course.mastery_gain ?? 0
                );


            const masteryAfter =
                Number(
                    course.mastery_after ?? 0
                );


            step.innerHTML = `

                <div class="step-number">
                    ${index + 1}
                </div>

                <div class="course-card">

                    <div class="course-top">

                        <span class="level">
                            ${escapeHTML(
                                course.level ||
                                "Intermediate"
                            )}
                        </span>

                        <span class="hours">
                            ${escapeHTML(
                                course.duration ||
                                "N/A"
                            )}
                        </span>

                    </div>


                    <h3>
                        ${escapeHTML(
                            course.title ||
                            "Recommended Course"
                        )}
                    </h3>


                    <div class="course-info">

                        <p>
                            <strong>
                                Description:
                            </strong>

                            ${escapeHTML(
                                course.description ||
                                ""
                            )}
                        </p>


                        <div
                            class="mastery-box"
                            style="
                                margin:18px 0;
                                padding:16px;
                                border-radius:10px;
                                background:rgba(124,58,237,0.10);
                                border:1px solid rgba(124,58,237,0.25);
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    margin-bottom:8px;
                                "
                            >

                                <strong>
                                    Skill Progress
                                </strong>

                                <span>
                                    ${masteryBefore}%
                                    →
                                    ${masteryAfter}%
                                </span>

                            </div>


                            <div
                                style="
                                    height:8px;
                                    background:#272b3a;
                                    border-radius:10px;
                                    overflow:hidden;
                                "
                            >

                                <div
                                    style="
                                        width:${masteryAfter}%;
                                        height:100%;
                                        background:linear-gradient(
                                            90deg,
                                            #7c3aed,
                                            #a855f7
                                        );
                                        border-radius:10px;
                                    "
                                ></div>

                            </div>


                            <p
                                style="
                                    margin-top:8px;
                                    margin-bottom:0;
                                "
                            >

                                Estimated mastery gain:

                                <strong>
                                    +${masteryGain}%
                                </strong>

                            </p>

                        </div>


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
                                Project:
                            </strong>

                            ${escapeHTML(
                                course.project ||
                                `Build a practical ${skills} project.`
                            )}
                        </p>

                    </div>


                    <div class="course-project">

                        🏆 Complete

                        ${escapeHTML(
                            course.title ||
                            "this course"
                        )}

                        and finish the project

                    </div>


                    <div class="course-buttons">

                        <button
                            onclick="completeCourse(${index})"
                        >
                            Mark Complete
                        </button>

                        <button
                            onclick="giveFeedback(
                                '${escapeJS(
                                    course.title ||
                                    "Course"
                                )}'
                            )"
                        >
                            Give Feedback
                        </button>

                    </div>

                </div>
            `;


            container.appendChild(
                step
            );
        }
    );
}


// =========================================================
// TOP RECOMMENDATIONS
// =========================================================

function renderRecommendations(
    learningPath
) {

    const container =
        document.getElementById(
            "recommendationContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


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
                    ? course.skills.join(", ")
                    : (
                        course.skills ||
                        course.skill ||
                        "N/A"
                    );


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        course.title ||
                        "Recommended Course"
                    )}
                </h3>

                <p>
                    <strong>
                        Level:
                    </strong>

                    ${escapeHTML(
                        course.level ||
                        "N/A"
                    )}
                </p>

                <p>
                    <strong>
                        Duration:
                    </strong>

                    ${escapeHTML(
                        course.duration ||
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
                    ${escapeHTML(
                        course.description ||
                        ""
                    )}
                </p>
            `;


            container.appendChild(
                card
            );
        }
    );
}


// =========================================================
// COMPLETE COURSE
// =========================================================

function completeCourse(
    index
) {

    let recommendation = {};


    try {

        recommendation =
            JSON.parse(
                localStorage.getItem(
                    "recommendation"
                )
            ) || {};

    } catch (error) {

        console.error(
            error
        );
    }


    const learningPath =
        recommendation.learning_path ||
        [];


    const course =
        learningPath[index];


    if (!course) {

        alert(
            "Course not found."
        );

        return;
    }


    let completed = [];


    try {

        completed =
            JSON.parse(
                localStorage.getItem(
                    "completedCourses"
                )
            ) || [];

    } catch (error) {

        completed = [];
    }


    const courseName =
        course.title ||
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
                course: course,
                feedback: feedback
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

    const container =
        document.getElementById(
            "roadmapContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="course-card">

            <h3>
                🤖 Generating your
                personalized learning path...
            </h3>

            <p>
                The AI recommendation engine
                is analyzing your skills,
                experience and learning goal.
            </p>

        </div>
    `;
}


// =========================================================
// ERROR
// =========================================================

function showError(
    message
) {

    const container =
        document.getElementById(
            "roadmapContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

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
                    white-space:pre-wrap;
                    word-break:break-word;
                "
            >${escapeHTML(
                message
            )}</pre>

            <p>
                Make sure the backend and
                ML services are running.
            </p>

        </div>
    `;
}


// =========================================================
// NAME
// =========================================================

function updateStudentName(
    profile
) {

    const element =
        document.getElementById(
            "topNavName"
        );


    if (
        element &&
        profile &&
        profile.name
    ) {

        element.textContent =
            profile.name
                .trim()
                .split(/\s+/)[0];
    }
}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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

    return String(
        value ?? ""
    )
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