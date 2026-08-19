// ======================================================
// LEARNPATH AI - ROADMAP
// ML CONNECTED VERSION
// ======================================================

const BACKEND_URL = "http://127.0.0.1:8000";


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    loadRoadmap
);


// ======================================================
// LOAD ROADMAP
// ======================================================

async function loadRoadmap() {

    console.log(
        "Loading ML-powered roadmap..."
    );


    // --------------------------------------------------
    // GET PROFILE
    // --------------------------------------------------

    const profileData =
        JSON.parse(
            localStorage.getItem(
                "learnPathProfile"
            )
        ) || {};


    console.log(
        "Profile:",
        profileData
    );


    // --------------------------------------------------
    // CHECK PROFILE
    // --------------------------------------------------

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


    // --------------------------------------------------
    // SHOW LOADING STATE
    // --------------------------------------------------

    showLoading();


    try {

        // ------------------------------------------------
        // CALL FASTAPI + ML
        // ------------------------------------------------

        const response =
            await fetch(
                `${BACKEND_URL}/recommend`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        profileData
                    )

                }
            );


        // ------------------------------------------------
        // CHECK HTTP RESPONSE
        // ------------------------------------------------

        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Backend error ${response.status}: ${errorText}`
            );

        }


        // ------------------------------------------------
        // GET ML RESPONSE
        // ------------------------------------------------

        const recommendationData =
            await response.json();


        console.log(
            "ML recommendation:",
            recommendationData
        );


        // ------------------------------------------------
        // SAVE LATEST ML RESPONSE
        // ------------------------------------------------

        localStorage.setItem(

            "recommendation",

            JSON.stringify(
                recommendationData
            )

        );


        // ------------------------------------------------
        // DISPLAY ROADMAP
        // ------------------------------------------------

        displayRoadmap(
            profileData,
            recommendationData
        );


    } catch (error) {

        console.error(
            "Unable to load ML recommendation:",
            error
        );


        // ------------------------------------------------
        // FALLBACK TO LAST SAVED RECOMMENDATION
        // ------------------------------------------------

        const savedRecommendation =
            localStorage.getItem(
                "recommendation"
            );


        if (savedRecommendation) {

            console.log(
                "Using previously saved recommendation."
            );


            try {

                const recommendationData =
                    JSON.parse(
                        savedRecommendation
                    );


                displayRoadmap(
                    profileData,
                    recommendationData
                );


                showErrorMessage(
                    "Could not connect to the ML service. Showing the last saved recommendation."
                );


            } catch (parseError) {

                console.error(
                    parseError
                );

                showBackendError();

            }

        } else {

            showBackendError();

        }

    }

}


// ======================================================
// DISPLAY ROADMAP
// ======================================================

function displayRoadmap(
    profileData,
    recommendationData
) {

    // --------------------------------------------------
    // GET BACKEND RESPONSE
    // --------------------------------------------------

    const skillGaps =
        Array.isArray(
            recommendationData.skill_gaps
        )
            ? recommendationData.skill_gaps
            : [];


    const learningPath =
        Array.isArray(
            recommendationData.learning_path
        )
            ? recommendationData.learning_path
            : [];


    const goal =
        recommendationData.goal
        ||
        profileData.goal
        ||
        "Your Learning Journey";


    // --------------------------------------------------
    // USER SKILLS
    // --------------------------------------------------

    const userSkills =
        Array.isArray(
            profileData.skills
        )
            ? profileData.skills
            : [];


    // --------------------------------------------------
    // GOAL
    // --------------------------------------------------

    const roadmapGoal =
        document.getElementById(
            "roadmapGoal"
        );


    if (roadmapGoal) {

        roadmapGoal.textContent =
            goal + " Journey";

    }


    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    const skillsHave =
        document.getElementById(
            "skillsHave"
        );


    const skillsToLearn =
        document.getElementById(
            "skillsToLearn"
        );


    const recommendedSteps =
        document.getElementById(
            "recommendedSteps"
        );


    if (skillsHave) {

        skillsHave.textContent =
            userSkills.length;

    }


    if (skillsToLearn) {

        skillsToLearn.textContent =
            skillGaps.length;

    }


    if (recommendedSteps) {

        recommendedSteps.textContent =
            learningPath.length;

    }


    // --------------------------------------------------
    // READINESS
    // --------------------------------------------------

    let readiness;


    // Prefer backend readiness if available

    if (
        typeof recommendationData
            .readiness_percentage
        === "number"
    ) {

        readiness =
            recommendationData
                .readiness_percentage;

    } else {

        const totalSkills =
            userSkills.length +
            skillGaps.length;


        readiness =
            totalSkills > 0

                ? Math.round(
                    (
                        userSkills.length /
                        totalSkills
                    ) * 100
                )

                : 100;

    }


    readiness =
        Math.max(
            0,
            Math.min(
                100,
                readiness
            )
        );


    const readinessPercentage =
        document.getElementById(
            "readinessPercentage"
        );


    const readinessText =
        document.getElementById(
            "readinessText"
        );


    if (readinessPercentage) {

        readinessPercentage.textContent =
            readiness + "%";

    }


    if (readinessText) {

        readinessText.textContent =
            readiness + "% ready";

    }


    // --------------------------------------------------
    // SKILL TAGS
    // --------------------------------------------------

    const skillTags =
        document.getElementById(
            "skillTags"
        );


    if (skillTags) {

        skillTags.innerHTML = "";


        // Existing skills

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


        // Skill gaps

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


    // --------------------------------------------------
    // ROADMAP COURSES
    // --------------------------------------------------

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    if (roadmapContainer) {

        roadmapContainer.innerHTML = "";


        if (
            learningPath.length === 0
        ) {

            roadmapContainer.innerHTML = `

                <div class="course-card">

                    <h3>
                        No new courses recommended
                    </h3>

                    <p>
                        Your current skills and
                        completed courses do not
                        require another recommendation
                        yet.
                    </p>

                </div>

            `;

        } else {

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

                            ? course.skills.join(
                                ", "
                            )

                            : course.skills
                                || "N/A";


                    step.innerHTML = `

                        <div class="step-number">
                            ${index + 1}
                        </div>


                        <div class="course-card">

                            <div class="course-top">

                                <span class="level">
                                    ${escapeHTML(
                                        course.level
                                        || "N/A"
                                    )}
                                </span>


                                <span class="hours">
                                    ${escapeHTML(
                                        course.duration
                                        || "N/A"
                                    )}
                                </span>

                            </div>


                            <h3>
                                ${escapeHTML(
                                    course.title
                                    || "Recommended Course"
                                )}
                            </h3>


                            <div class="course-info">

                                <p>

                                    <strong>
                                        Description:
                                    </strong>

                                    ${escapeHTML(
                                        course.description
                                        || ""
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
                                        Project:
                                    </strong>

                                    ${escapeHTML(
                                        course.project
                                        || ""
                                    )}

                                </p>

                            </div>


                            <div class="course-project">

                                🏆 Complete
                                ${escapeHTML(
                                    course.title
                                    || "this course"
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
                                            course.title
                                            || "Course"
                                        )}'
                                    )"
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

        }

    }


    // --------------------------------------------------
    // RECOMMENDATION SECTION
    // --------------------------------------------------

    const recommendationContainer =
        document.getElementById(
            "recommendationContainer"
        );


    if (recommendationContainer) {

        recommendationContainer.innerHTML = "";


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

                        ? course.skills.join(
                            ", "
                        )

                        : course.skills
                            || "N/A";


                card.innerHTML = `

                    <h3>
                        ${escapeHTML(
                            course.title
                            || "Recommended Course"
                        )}
                    </h3>


                    <p>

                        <strong>
                            Level:
                        </strong>

                        ${escapeHTML(
                            course.level
                            || "N/A"
                        )}

                    </p>


                    <p>

                        <strong>
                            Duration:
                        </strong>

                        ${escapeHTML(
                            course.duration
                            || "N/A"
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
                            course.description
                            || ""
                        )}

                    </p>


                    <p>

                        <strong>
                            Why:
                        </strong>

                        ${escapeHTML(
                            course.description
                            || "Recommended by the ML recommendation engine based on your learning profile."
                        )}

                    </p>

                `;


                recommendationContainer.appendChild(
                    card
                );

            }
        );

    }


    // --------------------------------------------------
    // DEBUG
    // --------------------------------------------------

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


// ======================================================
// COMPLETE COURSE
// ======================================================

function completeCourse(index) {

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


    const completed =
        JSON.parse(
            localStorage.getItem(
                "completedCourses"
            )
        ) || [];


    // --------------------------------------------------
    // Use course title instead of only index
    // --------------------------------------------------

    const courseName =
        course?.title
        || `Course ${index + 1}`;


    if (
        !completed.some(
            item =>
                (
                    typeof item === "object"
                    &&
                    item !== null
                    &&
                    (
                        item.title
                        || item.name
                    ) === courseName
                )
                ||
                item === courseName
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


    // Refresh recommendation after completion

    loadRoadmap();

}


// ======================================================
// FEEDBACK
// ======================================================

function giveFeedback(course) {

    const feedback =
        prompt(
            `Give feedback for ${course}:`
        );


    if (feedback) {

        console.log(
            "Course feedback:",
            {
                course,
                feedback
            }
        );


        alert(
            "Thank you for your feedback! ❤️"
        );

    }

}


// ======================================================
// LOADING
// ======================================================

function showLoading() {

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    if (roadmapContainer) {

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


// ======================================================
// ERROR MESSAGE
// ======================================================

function showBackendError() {

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    if (roadmapContainer) {

        roadmapContainer.innerHTML = `

            <div class="course-card">

                <h3>
                    ⚠️ Unable to generate roadmap
                </h3>

                <p>
                    Please make sure both the
                    FastAPI backend and ML service
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


// ======================================================
// TEMPORARY ERROR MESSAGE
// ======================================================

function showErrorMessage(message) {

    console.warn(
        message
    );

}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHTML(value) {

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


// ======================================================
// JAVASCRIPT STRING ESCAPE
// ======================================================

function escapeJS(value) {

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