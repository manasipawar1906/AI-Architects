/* =========================================================
   LEARNPATH AI - ROADMAP
   ML CONNECTED VERSION
   ========================================================= */

const BACKEND_URL = "http://127.0.0.1:8000";
const COURSE_CONTENT_URL = "../../data/course_details.json";

let courseContent = {};

document.addEventListener("DOMContentLoaded", loadRoadmap);


/* =========================================================
   LOAD COURSE CONTENT
   ========================================================= */

async function loadCourseContent() {
    try {
        const response = await fetch(COURSE_CONTENT_URL);

        if (!response.ok) {
            throw new Error(
                `Unable to load course_content.json (${response.status})`
            );
        }

        courseContent = await response.json();

        console.log("Course content loaded:", courseContent);
    } catch (error) {
        console.error("Course content loading error:", error);

        /*
         * The roadmap itself should still work even if the
         * optional content file cannot be loaded.
         */
        courseContent = {};
    }
}


/* =========================================================
   LOAD ROADMAP
   ========================================================= */

async function loadRoadmap() {

    console.log("Loading ML-powered roadmap...");

    await loadCourseContent();


    /* =====================================================
       GET SAVED PROFILE
       ===================================================== */

    let profileData = {};

    try {

        profileData =
            JSON.parse(
                sessionStorage.getItem("learnPathProfile")
            ) || {};

        /*
         * Compatibility fallback.
         *
         * If profile.js is currently saving to localStorage,
         * the roadmap will still work.
         */
        if (
            !profileData ||
            !profileData.name
        ) {
            profileData =
                JSON.parse(
                    localStorage.getItem("learnPathProfile")
                ) || {};
        }

    } catch (error) {

        console.error(
            "Unable to read saved profile:",
            error
        );

        showBackendError(
            "Saved profile data is invalid."
        );

        return;
    }


    /* =====================================================
       CHECK PROFILE
       ===================================================== */

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


    updateStudentName(profileData);

    showLoading();


    /*
     * IMPORTANT:
     * We do NOT delete the recommendation here if it exists.
     *
     * This prevents unnecessary loss of the current roadmap.
     */

    try {

        console.log(
            "Sending profile to backend..."
        );

        console.log(
            "Backend URL:",
            `${BACKEND_URL}/recommend`
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

            let errorMessage =
                `Backend error ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData &&
                    errorData.detail
                ) {

                    errorMessage =
                        typeof errorData.detail === "object"
                            ? JSON.stringify(
                                errorData.detail,
                                null,
                                2
                            )
                            : String(
                                errorData.detail
                            );

                }

            } catch (parseError) {

                console.error(
                    "Could not parse backend error:",
                    parseError
                );
            }

            throw new Error(
                errorMessage
            );
        }


        /* =================================================
           READ BACKEND RESPONSE
           ================================================= */

        const recommendationData =
            await response.json();


        if (
            !recommendationData
        ) {

            throw new Error(
                "Backend returned an empty response."
            );
        }


        /*
         * Save recommendation.
         */
        localStorage.setItem(
            "recommendation",
            JSON.stringify(
                recommendationData
            )
        );


        /*
         * Display roadmap.
         */
        displayRoadmap(
            profileData,
            recommendationData
        );

    } catch (error) {

        console.error(
            "ROADMAP GENERATION ERROR:",
            error
        );

        showBackendError(error);
    }
}


/* =========================================================
   UPDATE STUDENT NAME
   ========================================================= */

function updateStudentName(profileData) {

    const topNavName =
        document.getElementById(
            "topNavName"
        );


    if (
        topNavName &&
        profileData.name
    ) {

        const firstName =
            profileData.name
                .trim()
                .split(/\s+/)[0];

        topNavName.textContent =
            firstName;
    }


    const studentName =
        document.getElementById(
            "studentName"
        );


    if (
        studentName &&
        profileData.name
    ) {

        studentName.textContent =
            profileData.name;
    }
}


/* =========================================================
   DISPLAY ROADMAP
   ========================================================= */

function displayRoadmap(
    profileData,
    recommendationData
) {

    console.log(
        "Displaying roadmap..."
    );


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
        recommendationData.goal ||
        profileData.goal ||
        "Your Learning Journey";


    const userSkills =
        Array.isArray(
            profileData.skills
        )
            ? profileData.skills
            : [];


    updateStudentName(
        profileData
    );


    /* =====================================================
       HEADER
       ===================================================== */

    const roadmapTitle =
        document.getElementById(
            "roadmapTitle"
        );

    if (roadmapTitle) {

        roadmapTitle.textContent =
            `${goal} Learning Roadmap`;
    }


    const roadmapSubtitle =
        document.getElementById(
            "roadmapSubtitle"
        );

    if (roadmapSubtitle) {

        roadmapSubtitle.textContent =
            "Your personalized learning journey based on your profile";
    }


    const roadmapGoal =
        document.getElementById(
            "roadmapGoal"
        );

    if (roadmapGoal) {

        roadmapGoal.textContent =
            `${goal} Journey`;
    }


    /* =====================================================
       SUMMARY CARDS
       ===================================================== */

    const skillsHave =
        document.getElementById(
            "skillsHave"
        );

    if (skillsHave) {

        skillsHave.textContent =
            userSkills.length;
    }


    const skillsToLearn =
        document.getElementById(
            "skillsToLearn"
        );

    if (skillsToLearn) {

        skillsToLearn.textContent =
            skillGaps.length;
    }


    const recommendedSteps =
        document.getElementById(
            "recommendedSteps"
        );

    if (recommendedSteps) {

        recommendedSteps.textContent =
            learningPath.length;
    }


    /* =====================================================
       READINESS
       ===================================================== */

    let readiness;

    if (
        typeof recommendationData.readiness_percentage ===
        "number"
    ) {

        readiness =
            recommendationData.readiness_percentage;

    } else {

        const totalSkills =
            userSkills.length +
            skillGaps.length;


        if (
            totalSkills > 0
        ) {

            readiness =
                Math.round(
                    (
                        userSkills.length /
                        totalSkills
                    ) * 100
                );

        } else {

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


    /* =====================================================
       SKILL TAGS
       ===================================================== */

    const skillTags =
        document.getElementById(
            "skillTags"
        );


    if (skillTags) {

        skillTags.innerHTML = "";


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

                skillTags.appendChild(
                    tag
                );
            }
        );


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

                skillTags.appendChild(
                    tag
                );
            }
        );
    }


    /* =====================================================
       ROADMAP
       ===================================================== */

    const roadmapContainer =
        document.getElementById(
            "roadmapContainer"
        );


    if (!roadmapContainer) {
        return;
    }


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
                    The AI recommendation engine
                    did not return any courses
                    for this profile.
                </p>
            </div>
        `;

    } else {

        learningPath.forEach(
            (course, index) => {

                createRoadmapCourse(
                    course,
                    index,
                    roadmapContainer
                );
            }
        );
    }


    /* =====================================================
       TOP AI RECOMMENDATIONS
       ===================================================== */

    displayTopRecommendations(
        learningPath
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
}


/* =========================================================
   CREATE ROADMAP COURSE
   ========================================================= */

function createRoadmapCourse(
    course,
    index,
    roadmapContainer
) {

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
            : course.skills || "N/A";


    const title =
        course.title ||
        "Recommended Course";


    step.innerHTML = `

        <div class="step-number">
            ${index + 1}
        </div>

        <div class="course-card">

            <div class="course-top">

                <span class="level">
                    ${escapeHTML(
                        course.level || "N/A"
                    )}
                </span>

                <span class="hours">
                    ${escapeHTML(
                        course.duration || "N/A"
                    )}
                </span>

            </div>


            <!-- =================================================
                 CLICKABLE COURSE TITLE
                 ================================================= -->

            <h3
                class="course-title-clickable"
                data-course-title="${escapeHTML(title)}"
                style="
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                "
                title="Click to view course details"
            >
                ${escapeHTML(title)}
            </h3>


            <div class="course-info">

                <p>
                    <strong>
                        Description:
                    </strong>

                    ${escapeHTML(
                        course.description || ""
                    )}
                </p>


                <p>
                    <strong>
                        Skills:
                    </strong>

                    ${escapeHTML(skills)}
                </p>


                ${
                    course.project
                        ? `
                            <p>
                                <strong>
                                    Project:
                                </strong>

                                ${escapeHTML(
                                    course.project
                                )}
                            </p>
                        `
                        : ""
                }

            </div>


            <div class="course-project">

                🏆 Complete

                ${escapeHTML(title)}

                and finish the project

            </div>


            <!-- =================================================
                 COURSE BUTTONS
                 ================================================= -->

            <div class="course-buttons">

                <button
                    class="course-details-button"
                    type="button"
                >
                    📚 View Course Details
                </button>

                <button
                    class="complete-course-button"
                    type="button"
                >
                    Mark Complete
                </button>

                <button
                    class="feedback-course-button"
                    type="button"
                >
                    Give Feedback
                </button>

            </div>


            <!-- =================================================
                 COURSE DETAILS
                 Hidden until the user clicks the course
                 ================================================= -->

            <div
                class="course-details-panel"
                style="display:none;"
            ></div>

        </div>
    `;


    /* =====================================================
       TITLE CLICK
       ===================================================== */

    const titleElement =
        step.querySelector(
            ".course-title-clickable"
        );


    if (titleElement) {

        titleElement.addEventListener(
            "click",
            () => {

                toggleCourseDetails(
                    step,
                    course
                );
            }
        );


        titleElement.addEventListener(
            "mouseenter",
            () => {
                titleElement.style.opacity =
                    "0.75";
            }
        );


        titleElement.addEventListener(
            "mouseleave",
            () => {
                titleElement.style.opacity =
                    "1";
            }
        );
    }


    /* =====================================================
       DETAILS BUTTON
       ===================================================== */

    const detailsButton =
        step.querySelector(
            ".course-details-button"
        );


    if (detailsButton) {

        detailsButton.addEventListener(
            "click",
            () => {

                toggleCourseDetails(
                    step,
                    course
                );
            }
        );
    }


    /* =====================================================
       COMPLETE BUTTON
       ===================================================== */

    const completeButton =
        step.querySelector(
            ".complete-course-button"
        );


    if (completeButton) {

        completeButton.addEventListener(
            "click",
            () => {

                completeCourse(
                    index
                );
            }
        );
    }


    /* =====================================================
       FEEDBACK BUTTON
       ===================================================== */

    const feedbackButton =
        step.querySelector(
            ".feedback-course-button"
        );


    if (feedbackButton) {

        feedbackButton.addEventListener(
            "click",
            () => {

                giveFeedback(
                    title
                );
            }
        );
    }


    roadmapContainer.appendChild(
        step
    );
}


/* =========================================================
   COURSE DETAILS TOGGLE
   ========================================================= */

function toggleCourseDetails(
    step,
    course
) {

    const panel =
        step.querySelector(
            ".course-details-panel"
        );


    if (!panel) {
        return;
    }


    /*
     * If already open, close it.
     */
    if (
        panel.style.display !== "none"
    ) {

        panel.style.display =
            "none";

        panel.innerHTML =
            "";

        return;
    }


    /*
     * Close other open course panels.
     */
    document
        .querySelectorAll(
            ".course-details-panel"
        )
        .forEach(
            otherPanel => {

                if (
                    otherPanel !== panel
                ) {

                    otherPanel.style.display =
                        "none";

                    otherPanel.innerHTML =
                        "";
                }
            }
        );


    const title =
        course.title ||
        "Course";


    const content =
        findCourseContent(
            title
        );


    if (!content) {

        panel.innerHTML = `

            <div
                style="
                    margin-top:20px;
                    padding:20px;
                    border-radius:14px;
                    background:rgba(0,0,0,0.04);
                "
            >

                <h3>
                    📚 Course Details
                </h3>

                <p>
                    Detailed learning content for
                    <strong>
                        ${escapeHTML(title)}
                    </strong>
                    is not available yet.
                </p>

            </div>
        `;

        panel.style.display =
            "block";

        return;
    }


    panel.innerHTML =
        buildCourseDetailsHTML(
            title,
            content
        );


    panel.style.display =
        "block";


    /*
     * Attach assessment functionality.
     */
    setupAssessment(
        panel,
        content.assessment || []
    );
}


/* =========================================================
   FIND COURSE CONTENT
   ========================================================= */

function findCourseContent(
    courseTitle
) {

    if (
        !courseContent ||
        typeof courseContent !== "object"
    ) {
        return null;
    }


    /*
     * Exact match first.
     */
    if (
        courseContent[
            courseTitle
        ]
    ) {

        return courseContent[
            courseTitle
        ];
    }


    /*
     * Case-insensitive fallback.
     */
    const normalized =
        String(courseTitle)
            .trim()
            .toLowerCase();


    const key =
        Object.keys(
            courseContent
        ).find(
            item =>
                item
                    .trim()
                    .toLowerCase() ===
                normalized
        );


    if (key) {

        return courseContent[
            key
        ];
    }


    return null;
}


/* =========================================================
   BUILD COURSE DETAILS HTML
   ========================================================= */

function buildCourseDetailsHTML(
    title,
    content
) {

    const topics =
        Array.isArray(
            content.topics
        )
            ? content.topics
            : [];


    const youtube =
        Array.isArray(
            content.youtube
        )
            ? content.youtube
            : [];


    const practice =
        Array.isArray(
            content.practice
        )
            ? content.practice
            : [];


    const assessment =
        Array.isArray(
            content.assessment
        )
            ? content.assessment
            : [];


    return `

        <div
            class="course-details-content"
            style="
                margin-top:22px;
                padding:24px;
                border-radius:18px;
                background:rgba(67,97,238,0.06);
                border:1px solid rgba(67,97,238,0.15);
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    margin-bottom:20px;
                    flex-wrap:wrap;
                "
            >

                <h2
                    style="
                        margin:0;
                    "
                >
                    📖 ${escapeHTML(title)}
                </h2>

                <span
                    style="
                        padding:7px 12px;
                        border-radius:20px;
                        background:rgba(67,97,238,0.12);
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    Course Details
                </span>

            </div>


            <!-- =================================================
                 TOPICS
                 ================================================= -->

            <div
                style="
                    margin-bottom:25px;
                "
            >

                <h3>
                    📚 Topics Overview
                </h3>

                ${
                    topics.length
                        ? `
                            <ul>
                                ${topics
                                    .map(
                                        topic => `
                                            <li>
                                                ${escapeHTML(
                                                    topic
                                                )}
                                            </li>
                                        `
                                    )
                                    .join("")}
                            </ul>
                        `
                        : `
                            <p>
                                No topics available.
                            </p>
                        `
                }

            </div>


            <!-- =================================================
                 YOUTUBE
                 ================================================= -->

            <div
                style="
                    margin-bottom:25px;
                "
            >

                <h3>
                    ▶️ YouTube Resources
                </h3>

                ${
                    youtube.length
                        ? `
                            <div
                                style="
                                    display:flex;
                                    flex-direction:column;
                                    gap:10px;
                                "
                            >

                                ${youtube
                                    .map(
                                        resource => `
                                            <a
                                                href="${escapeHTML(
                                                    resource.url
                                                )}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style="
                                                    display:block;
                                                    padding:12px 15px;
                                                    border-radius:10px;
                                                    background:#ffffff;
                                                    text-decoration:none;
                                                    font-weight:600;
                                                "
                                            >
                                                ▶
                                                ${escapeHTML(
                                                    resource.title
                                                )}
                                            </a>
                                        `
                                    )
                                    .join("")}

                            </div>
                        `
                        : `
                            <p>
                                No YouTube resources available.
                            </p>
                        `
                }

            </div>


            <!-- =================================================
                 PRACTICE
                 ================================================= -->

            <div
                style="
                    margin-bottom:25px;
                "
            >

                <h3>
                    📝 Practice Exercises
                </h3>

                ${
                    practice.length
                        ? `
                            <ol>
                                ${practice
                                    .map(
                                        exercise => `
                                            <li>
                                                ${escapeHTML(
                                                    exercise
                                                )}
                                            </li>
                                        `
                                    )
                                    .join("")}
                            </ol>
                        `
                        : `
                            <p>
                                No practice exercises available.
                            </p>
                        `
                }

            </div>


            <!-- =================================================
                 ASSESSMENT
                 ================================================= -->

            <div>

                <h3>
                    🎯 Assessment
                </h3>

                ${
                    assessment.length
                        ? buildAssessmentHTML(
                            assessment
                        )
                        : `
                            <p>
                                No assessment available.
                            </p>
                        `
                }

            </div>

        </div>
    `;
}


/* =========================================================
   BUILD ASSESSMENT
   ========================================================= */

function buildAssessmentHTML(
    assessment
) {

    return `

        <div
            class="assessment-container"
        >

            ${assessment
                .map(
                    (question, index) => `

                        <div
                            class="assessment-question"
                            data-answer="${question.answer}"
                            style="
                                margin-bottom:20px;
                                padding:16px;
                                border-radius:12px;
                                background:#ffffff;
                            "
                        >

                            <p>
                                <strong>
                                    Q${index + 1}.
                                    ${escapeHTML(
                                        question.question
                                    )}
                                </strong>
                            </p>

                            <div>

                                ${question.options
                                    .map(
                                        (option, optionIndex) => `

                                            <label
                                                style="
                                                    display:block;
                                                    margin:8px 0;
                                                    cursor:pointer;
                                                "
                                            >

                                                <input
                                                    type="radio"
                                                    name="question-${index}-${Date.now()}"
                                                    value="${optionIndex}"
                                                >

                                                ${escapeHTML(
                                                    option
                                                )}

                                            </label>

                                        `
                                    )
                                    .join("")}

                            </div>

                        </div>

                    `
                )
                .join("")}


            <button
                type="button"
                class="assessment-submit"
                style="
                    padding:11px 18px;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                Submit Assessment
            </button>


            <div
                class="assessment-result"
                style="
                    margin-top:15px;
                    font-weight:600;
                "
            ></div>

        </div>
    `;
}


/* =========================================================
   ASSESSMENT FUNCTIONALITY
   ========================================================= */

function setupAssessment(
    panel,
    assessment
) {

    const submitButton =
        panel.querySelector(
            ".assessment-submit"
        );


    const result =
        panel.querySelector(
            ".assessment-result"
        );


    if (
        !submitButton ||
        !result
    ) {
        return;
    }


    submitButton.addEventListener(
        "click",
        () => {

            let score = 0;
            let answered = 0;


            const questions =
                panel.querySelectorAll(
                    ".assessment-question"
                );


            questions.forEach(
                question => {

                    const selected =
                        question.querySelector(
                            "input[type='radio']:checked"
                        );


                    if (!selected) {
                        return;
                    }


                    answered++;


                    const correctAnswer =
                        Number(
                            question.dataset.answer
                        );


                    if (
                        Number(
                            selected.value
                        ) ===
                        correctAnswer
                    ) {

                        score++;
                    }
                }
            );


            if (
                answered <
                questions.length
            ) {

                result.textContent =
                    `Please answer all ${questions.length} questions before submitting.`;

                return;
            }


            const percentage =
                Math.round(
                    (
                        score /
                        questions.length
                    ) * 100
                );


            result.textContent =
                `Assessment Score: ${score}/${questions.length} (${percentage}%)`;
        }
    );
}


/* =========================================================
   TOP AI RECOMMENDATIONS
   ========================================================= */

function displayTopRecommendations(
    learningPath
) {

    const recommendationContainer =
        document.getElementById(
            "recommendationContainer"
        );


    if (
        !recommendationContainer
    ) {
        return;
    }


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
                    ? course.skills.join(", ")
                    : course.skills || "N/A";


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


                <button
                    type="button"
                    class="recommendation-details-button"
                >
                    📚 View Details
                </button>

            `;


            const button =
                card.querySelector(
                    ".recommendation-details-button"
                );


            if (button) {

                button.addEventListener(
                    "click",
                    () => {

                        /*
                         * Scroll to the corresponding
                         * roadmap step.
                         */

                        const roadmapSteps =
                            document.querySelectorAll(
                                ".roadmap-step"
                            );


                        const index =
                            learningPath.indexOf(
                                course
                            );


                        if (
                            roadmapSteps[index]
                        ) {

                            roadmapSteps[index]
                                .scrollIntoView({
                                    behavior:
                                        "smooth",
                                    block:
                                        "center"
                                });


                            const title =
                                roadmapSteps[index]
                                    .querySelector(
                                        ".course-title-clickable"
                                    );


                            if (title) {

                                title.click();
                            }
                        }
                    }
                );
            }


            recommendationContainer.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   MARK COURSE COMPLETE
   ========================================================= */

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
        recommendation.learning_path ||
        [];


    const course =
        learningPath[index];


    if (!course) {

        alert(
            "Unable to identify this course."
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
        course.title ||
        `Course ${index + 1}`;


    /*
     * Store ONLY the course itself.
     *
     * No skill-wide completion is performed here.
     */

    const alreadyCompleted =
        completed.some(
            item => {

                if (
                    typeof item ===
                    "object" &&
                    item !== null
                ) {

                    return (
                        item.title ===
                        courseName
                    );
                }


                return (
                    item ===
                    courseName
                );
            }
        );


    if (
        !alreadyCompleted
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


/* =========================================================
   GIVE FEEDBACK
   ========================================================= */

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
                course,
                feedback
            }
        );


        alert(
            "Thank you for your feedback! ❤️"
        );
    }
}


/* =========================================================
   SHOW LOADING
   ========================================================= */

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


/* =========================================================
   SHOW BACKEND ERROR
   ========================================================= */

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

    } else if (
        typeof error === "object"
    ) {

        try {

            message =
                JSON.stringify(
                    error,
                    null,
                    2
                );

        } catch (
            stringifyError
        ) {

            message =
                String(error);
        }

    } else {

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
                        white-space:pre-wrap;
                        word-break:break-word;
                        font-family:monospace;
                    "
                >${escapeHTML(
                    message
                )}</pre>

                <p>
                    Make sure the FastAPI backend
                    is running.
                </p>

                <p>
                    Backend:
                    http://127.0.0.1:8000
                </p>

            </div>

        `;
    }
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value
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