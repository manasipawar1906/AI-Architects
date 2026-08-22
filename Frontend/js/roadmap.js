/* =========================================================
   LEARNPATH AI - ROADMAP
   Dynamic ML Roadmap + Course Details + Assessments
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
                `Unable to load course_details.json (${response.status})`
            );
        }

        courseContent = await response.json();

        console.log("Course content loaded:", courseContent);

    } catch (error) {
        console.warn("Course content loading error:", error);
        courseContent = {};
    }
}


/* =========================================================
   LOAD ROADMAP
   ========================================================= */

async function loadRoadmap() {

    await loadCourseContent();

    let profileData = getSelectedProfile();

    if (!profileData) {
        try {
            const stored = sessionStorage.getItem("learnPathProfile");

            if (stored) {
                profileData = JSON.parse(stored);
            }
        } catch (error) {
            console.error("Session profile error:", error);
        }
    }

    if (!profileData || !profileData.name) {
        alert("Please select or create a learning profile first.");
        window.location.href = "profile.html";
        return;
    }

    updateStudentName(profileData);
    updateRoadmapHeader(profileData);
    showLoading();

    /*
     * IMPORTANT:
     * If this profile already contains a recommendation,
     * use it instead of unnecessarily replacing it.
     */
    if (
        profileData.recommendation &&
        typeof profileData.recommendation === "object"
    ) {
        displayRoadmap(
            profileData,
            profileData.recommendation
        );
        return;
    }

    try {
        const sessionRoadmap =
            sessionStorage.getItem("learnPathRoadmap");

        const lastProfile =
            sessionStorage.getItem("lastProfile");

        if (sessionRoadmap && lastProfile) {

            const savedProfile =
                JSON.parse(lastProfile);

            const roadmapData =
                JSON.parse(sessionRoadmap);

            const sameProfile =
                profileData.id &&
                savedProfile.id &&
                profileData.id === savedProfile.id;

            if (sameProfile || !profileData.id) {

                displayRoadmap(
                    profileData,
                    roadmapData
                );

                return;
            }
        }

    } catch (error) {
        console.warn(
            "Could not load session roadmap:",
            error
        );
    }

    await generateRecommendation(profileData);
}


/* =========================================================
   GENERATE RECOMMENDATION
   ========================================================= */

async function generateRecommendation(profileData) {

    try {

        const response = await fetch(
            `${BACKEND_URL}/recommend`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(profileData)
            }
        );

        if (!response.ok) {

            let errorMessage =
                `Backend error ${response.status}`;

            try {
                const errorData =
                    await response.json();

                if (errorData && errorData.detail) {

                    errorMessage =
                        typeof errorData.detail === "object"
                            ? JSON.stringify(
                                errorData.detail,
                                null,
                                2
                            )
                            : String(errorData.detail);
                }

            } catch (parseError) {
                console.error(
                    "Could not parse backend error:",
                    parseError
                );
            }

            throw new Error(errorMessage);
        }

        const recommendationData =
            await response.json();

        if (
            !recommendationData ||
            typeof recommendationData !== "object"
        ) {
            throw new Error(
                "Backend returned an invalid recommendation."
            );
        }

        const learningPath =
            Array.isArray(
                recommendationData.learning_path
            )
                ? recommendationData.learning_path
                : [];

        const totalRoadmapCourses =
            learningPath.length;

        const updatedProfile =
            updateSelectedProfile({
                recommendation: recommendationData,
                totalRoadmapCourses: totalRoadmapCourses,
                recommendationUpdatedAt:
                    new Date().toISOString()
            });

        const profileForDisplay =
            updatedProfile ||
            {
                ...profileData,
                recommendation: recommendationData,
                totalRoadmapCourses: totalRoadmapCourses
            };

        localStorage.setItem(
            "recommendation",
            JSON.stringify(recommendationData)
        );

        sessionStorage.setItem(
            "learnPathRoadmap",
            JSON.stringify(recommendationData)
        );

        sessionStorage.setItem(
            "lastProfile",
            JSON.stringify(profileForDisplay)
        );

        sessionStorage.setItem(
            "learnPathProfile",
            JSON.stringify(profileForDisplay)
        );

        displayRoadmap(
            profileForDisplay,
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
   GET SELECTED PROFILE
   ========================================================= */

function getSelectedProfile() {

    try {

        const profilesRaw =
            localStorage.getItem("learnPathProfiles");

        const selectedId =
            localStorage.getItem("selectedProfileId");

        if (profilesRaw && selectedId) {

            const profiles =
                JSON.parse(profilesRaw);

            if (Array.isArray(profiles)) {

                const selected =
                    profiles.find(
                        profile =>
                            profile.id === selectedId
                    );

                if (selected) {
                    return selected;
                }
            }
        }

        const oldProfile =
            localStorage.getItem("learnPathProfile");

        if (oldProfile) {
            return JSON.parse(oldProfile);
        }

    } catch (error) {

        console.error(
            "Unable to load selected profile:",
            error
        );
    }

    return null;
}


/* =========================================================
   UPDATE SELECTED PROFILE
   ========================================================= */

function updateSelectedProfile(updates) {

    try {

        const profilesRaw =
            localStorage.getItem("learnPathProfiles");

        const selectedId =
            localStorage.getItem("selectedProfileId");

        if (!profilesRaw || !selectedId) {
            return null;
        }

        const profiles =
            JSON.parse(profilesRaw);

        if (!Array.isArray(profiles)) {
            return null;
        }

        const index =
            profiles.findIndex(
                profile =>
                    profile.id === selectedId
            );

        if (index === -1) {
            return null;
        }

        profiles[index] = {
            ...profiles[index],
            ...updates
        };

        localStorage.setItem(
            "learnPathProfiles",
            JSON.stringify(profiles)
        );

        localStorage.setItem(
            "learnPathProfile",
            JSON.stringify(profiles[index])
        );

        if (updates.recommendation) {
            localStorage.setItem(
                "recommendation",
                JSON.stringify(updates.recommendation)
            );
        }

        return profiles[index];

    } catch (error) {

        console.error(
            "Could not update selected profile:",
            error
        );

        return null;
    }
}


/* =========================================================
   DISPLAY ROADMAP
   ========================================================= */

function displayRoadmap(
    profileData,
    recommendationData
) {

    const learningPath =
        Array.isArray(
            recommendationData.learning_path
        )
            ? recommendationData.learning_path
            : [];

    const skillGaps =
        Array.isArray(
            recommendationData.skill_gaps
        )
            ? uniqueSkills(
                recommendationData.skill_gaps
            )
            : [];

    const userSkills =
        getBackendSkills(
            recommendationData,
            profileData
        );

    const goal =
        recommendationData.goal ||
        profileData.goal ||
        "Learning";

    if (
        !profileData.totalRoadmapCourses &&
        learningPath.length > 0
    ) {

        const updated =
            updateSelectedProfile({
                totalRoadmapCourses:
                    learningPath.length
            });

        if (updated) {
            profileData = updated;
        }
    }

    updateRoadmapHeader(
        profileData,
        goal
    );

    updateSummaryCards(
        recommendationData,
        userSkills,
        skillGaps,
        learningPath
    );

    renderSkillMap(
        userSkills,
        skillGaps
    );

    /*
     * IMPORTANT:
     * renderRoadmapCourses() renders:
     * - course information
     * - Skill Progress
     * - Skills
     * - course Project
     * - View Course Details
     * - Mark Complete
     * - Give Feedback
     *
     * AND at the end:
     * - Project Work Recommendation
     */
    renderRoadmapCourses(
        learningPath,
        profileData,
        goal
    );

    renderTopRecommendations(
        learningPath
    );
}


/* =========================================================
   BACKEND SKILLS
   ========================================================= */

function getBackendSkills(
    recommendationData,
    profileData
) {

    if (
        Array.isArray(
            recommendationData.current_skills
        )
    ) {
        return uniqueSkills(
            recommendationData.current_skills
        );
    }

    if (
        recommendationData.skill_mastery &&
        typeof recommendationData.skill_mastery === "object"
    ) {

        const skills =
            Object.entries(
                recommendationData.skill_mastery
            )
                .filter(
                    ([skill, mastery]) =>
                        Number(mastery) > 0
                )
                .map(
                    ([skill]) => skill
                );

        if (skills.length > 0) {
            return uniqueSkills(skills);
        }
    }

    return getCurrentSkills(profileData);
}


/* =========================================================
   CURRENT SKILLS
   ========================================================= */

function getCurrentSkills(profile) {

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

    for (const field of fields) {

        const value = profile[field];

        if (Array.isArray(value)) {

            return uniqueSkills(
                value
                    .map(
                        skill =>
                            extractSkillName(skill)
                    )
                    .filter(Boolean)
            );
        }

        if (typeof value === "string") {

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


/* =========================================================
   EXTRACT SKILL NAME
   ========================================================= */

function extractSkillName(skill) {

    if (typeof skill === "string") {
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


/* =========================================================
   SUMMARY CARDS
   ========================================================= */

function updateSummaryCards(
    recommendationData,
    userSkills,
    skillGaps,
    learningPath
) {

    const remainingGaps =
        uniqueSkills(skillGaps)
            .filter(
                gap =>
                    !userSkills.some(
                        skill =>
                            normalizeText(skill) ===
                            normalizeText(gap)
                    )
            );

    setText(
        "skillsHave",
        userSkills.length
    );

    setText(
        "skillsToLearn",
        remainingGaps.length
    );

    setText(
        "recommendedSteps",
        learningPath.length
    );

    let readiness =
        Number(
            recommendationData.readiness_percentage
        );

    if (!Number.isFinite(readiness)) {

        const total =
            userSkills.length +
            remainingGaps.length;

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
        clamp(
            readiness,
            0,
            100
        );

    setText(
        "readinessPercentage",
        `${readiness}%`
    );
}


/* =========================================================
   SKILL MAP
   ========================================================= */

function renderSkillMap(
    userSkills,
    skillGaps
) {

    const skillTags =
        document.getElementById(
            "skillTags"
        );

    if (!skillTags) {
        return;
    }

    skillTags.innerHTML = "";

    uniqueSkills(userSkills).forEach(
        skill => {

            const tag =
                document.createElement("span");

            tag.className = "skill-have";
            tag.textContent = `✓ ${skill}`;

            skillTags.appendChild(tag);
        }
    );

    uniqueSkills(skillGaps).forEach(
        skill => {

            const alreadyHave =
                userSkills.some(
                    existing =>
                        normalizeText(existing) ===
                        normalizeText(skill)
                );

            if (alreadyHave) {
                return;
            }

            const tag =
                document.createElement("span");

            tag.className = "skill-needed";
            tag.textContent = `→ ${skill}`;

            skillTags.appendChild(tag);
        }
    );

    if (
        userSkills.length === 0 &&
        skillGaps.length === 0
    ) {

        const tag =
            document.createElement("span");

        tag.className = "skill-needed";
        tag.textContent =
            "No skill information available.";

        skillTags.appendChild(tag);
    }
}


/* =========================================================
   CAREER PROJECT RECOMMENDATION
   ========================================================= */

function getCareerProject(goal) {

    const normalizedGoal =
        String(goal || "")
            .trim()
            .toLowerCase();

    if (normalizedGoal.includes("nlp")) {

        return {
            title: "Domain-Specific NLP Assistant",

            description:
                "Build an intelligent NLP assistant that understands and answers questions from domain-specific documents. Use text preprocessing, embeddings, semantic search, Transformers, and Hugging Face models to create a practical natural-language application."
        };
    }

    if (
        normalizedGoal.includes("machine learning")
    ) {

        return {
            title:
                "End-to-End Machine Learning Prediction System",

            description:
                "Build and deploy a complete machine-learning application that performs data preprocessing, feature engineering, model training, evaluation, and real-time prediction through a user-friendly application or API."
        };
    }

    if (
        normalizedGoal.includes("data scientist") ||
        normalizedGoal.includes("data science")
    ) {

        return {
            title:
                "Customer Churn Analysis and Prediction Dashboard",

            description:
                "Build a data-science application that analyzes customer behavior, discovers important business patterns, visualizes insights, and predicts customers who are likely to leave a service using statistical analysis and machine learning."
        };
    }

    if (
        normalizedGoal.includes("ai engineer") ||
        normalizedGoal === "ai"
    ) {

        return {
            title:
                "AI-Powered Intelligent Assistant",

            description:
                "Build an intelligent assistant that combines NLP, deep learning, and Transformer-based models to understand user requests and provide useful responses. The project should demonstrate model integration, inference, data processing, and deployment as a complete AI application."
        };
    }

    return null;
}


/* =========================================================
   FINAL PROJECT WORK RECOMMENDATION
   ========================================================= */

function renderCareerProject(
    container,
    goal
) {

    if (!container) {
        return;
    }

    const project =
        getCareerProject(goal);

    if (!project) {
        return;
    }

    const projectSection =
        document.createElement("div");

    projectSection.className =
        "project-recommendation";

    projectSection.innerHTML = `
        <div
            class="course-card"
            style="
                margin-top:30px;
                border:1px solid rgba(124,58,237,0.35);
                background:linear-gradient(
                    135deg,
                    rgba(124,58,237,0.12),
                    rgba(30,30,45,0.95)
                );
            "
        >

            <div style="margin-bottom:14px;">

                <span
                    style="
                        display:inline-block;
                        padding:6px 12px;
                        border-radius:20px;
                        font-size:13px;
                        font-weight:600;
                        background:rgba(124,58,237,0.18);
                        color:#b98cff;
                    "
                >
                    Project Work Recommendation
                </span>

            </div>

            <h3>
                ${escapeHTML(project.title)}
            </h3>

            <div class="course-info">

                <p>
                    <strong>Description:</strong>
                    ${escapeHTML(project.description)}
                </p>

            </div>

        </div>
    `;

    container.appendChild(
        projectSection
    );
}


/* =========================================================
   ROADMAP COURSES
   ========================================================= */

function renderRoadmapCourses(
    learningPath,
    profileData,
    goal
) {

    const container =
        document.getElementById(
            "roadmapContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (learningPath.length === 0) {

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

        /*
         * Still show the career project if
         * a project exists for the selected goal.
         */
        renderCareerProject(
            container,
            goal
        );

        return;
    }

    const completed =
        Array.isArray(profileData.completed)
            ? profileData.completed
            : [];

    learningPath.forEach(
        (course, index) => {

            const step =
                document.createElement("div");

            step.className =
                "roadmap-step";

            const skills =
                getCourseSkills(course);

            const mastery =
                getMasteryValues(course);

            const predictedSuccess =
                getPredictedSuccess(course);

            const courseName =
                course.title ||
                `Course ${index + 1}`;

            const isCompleted =
                completed.some(
                    item => {

                        const itemName =
                            typeof item === "string"
                                ? item
                                : (
                                    item &&
                                    (
                                        item.title ||
                                        item.name ||
                                        item.course ||
                                        ""
                                    )
                                );

                        return (
                            normalizeText(itemName) ===
                            normalizeText(courseName)
                        );
                    }
                );

            /*
             * IMPORTANT:
             * The course project recommendation
             * and View Course Details button are
             * both inside every course card.
             */
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


                    <h3>
                        ${escapeHTML(courseName)}
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


                        <div
                            class="mastery-box"
                            style="
                                margin:18px 0;
                                padding:16px;
                                border-radius:10px;
                                background:rgba(
                                    124,
                                    58,
                                    237,
                                    0.10
                                );
                                border:1px solid rgba(
                                    124,
                                    58,
                                    237,
                                    0.25
                                );
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
                                    ${mastery.before}%
                                    →
                                    ${mastery.after}%
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
                                        width:${mastery.after}%;
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
                                    +${mastery.gain}%
                                </strong>

                            </p>

                        </div>


                        <p>

                            <strong>
                                Skills:
                            </strong>

                            ${escapeHTML(skills)}

                        </p>


                        <p>

                            <strong>
                                Project:
                            </strong>

                            ${escapeHTML(
                                course.project ||
                                "Complete a practical project related to this course."
                            )}

                        </p>


                        ${
                            predictedSuccess !== null
                                ? `
                                    <p>
                                        <strong>
                                            Predicted Success:
                                        </strong>

                                        ${predictedSuccess}%
                                    </p>
                                `
                                : ""
                        }

                    </div>


                    <!-- =====================================
                         COURSE PROJECT RECOMMENDATION
                         ===================================== -->

                    <div class="course-project">

                        ${
                            isCompleted
                                ? "✅ Completed"
                                : "🏆 Complete"
                        }

                        ${escapeHTML(courseName)}

                        ${
                            isCompleted
                                ? ""
                                : " and finish the project"
                        }

                    </div>


                    <!-- =====================================
                         COURSE BUTTONS
                         ===================================== -->

                    <div class="course-buttons">

                        <!-- VIEW COURSE DETAILS -->
                        <button
                            type="button"
                            class="course-details-button"
                        >
                            📚 View Course Details
                        </button>


                        <!-- MARK COMPLETE -->
                        ${
                            isCompleted
                                ? `
                                    <button
                                        disabled
                                        style="
                                            opacity:0.6;
                                            cursor:not-allowed;
                                        "
                                    >
                                        ✓ Completed
                                    </button>
                                `
                                : `
                                    <button
                                        onclick="
                                            completeCourse(
                                                ${index}
                                            )
                                        "
                                    >
                                        Mark Complete
                                    </button>
                                `
                        }


                        <!-- FEEDBACK -->
                        <button
                            onclick="
                                giveFeedback(
                                    '${escapeJS(courseName)}'
                                )
                            "
                        >
                            Give Feedback
                        </button>

                    </div>


                    <!-- =====================================
                         COURSE DETAILS PANEL
                         ===================================== -->

                    <div
                        class="course-details-panel"
                        style="display:none;"
                    ></div>

                </div>
            `;


            /*
             * VIEW COURSE DETAILS BUTTON
             */
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


            /*
             * Course title can also open
             * course details.
             */
            const titleElement =
                step.querySelector("h3");

            if (titleElement) {

                titleElement.style.cursor =
                    "pointer";

                titleElement.title =
                    "Click to view course details";

                titleElement.addEventListener(
                    "click",
                    () => {

                        toggleCourseDetails(
                            step,
                            course
                        );
                    }
                );
            }


            container.appendChild(step);
        }
    );


    /*
     * IMPORTANT:
     * Keep the separate career-level
     * Project Work Recommendation AFTER
     * all roadmap courses.
     */
    renderCareerProject(
        container,
        goal
    );
}


/* =========================================================
   TOGGLE COURSE DETAILS
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

    if (panel.style.display !== "none") {

        panel.style.display = "none";
        panel.innerHTML = "";

        return;
    }


    /*
     * Close other open course-detail panels.
     */
    document
        .querySelectorAll(
            ".course-details-panel"
        )
        .forEach(
            otherPanel => {

                if (otherPanel !== panel) {

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
        findCourseContent(title);


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

        panel.style.display = "block";

        return;
    }


    panel.innerHTML =
        buildCourseDetailsHTML(
            title,
            content
        );

    panel.style.display = "block";


    setupAssessment(
        panel,
        content.assessment || []
    );
}


/* =========================================================
   FIND COURSE CONTENT
   ========================================================= */

function findCourseContent(courseTitle) {

    if (
        !courseContent ||
        typeof courseContent !== "object"
    ) {
        return null;
    }

    if (courseContent[courseTitle]) {
        return courseContent[courseTitle];
    }

    const normalized =
        normalizeText(courseTitle);

    const key =
        Object.keys(courseContent).find(
            item =>
                normalizeText(item) ===
                normalized
        );

    if (key) {
        return courseContent[key];
    }

    return null;
}


/* =========================================================
   BUILD COURSE DETAILS
   ========================================================= */

function buildCourseDetailsHTML(
    title,
    content
) {

    const topics =
        Array.isArray(content.topics)
            ? content.topics
            : [];

    const youtube =
        Array.isArray(content.youtube)
            ? content.youtube
            : [];

    const practice =
        Array.isArray(content.practice)
            ? content.practice
            : [];

    const assessment =
        Array.isArray(content.assessment)
            ? content.assessment
            : [];


    return `

        <div
            class="course-details-content"
            style="
                margin-top:22px;
                padding:24px;
                border-radius:18px;
                background:rgba(
                    67,
                    97,
                    238,
                    0.06
                );
                border:1px solid rgba(
                    67,
                    97,
                    238,
                    0.15
                );
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

                <h2 style="margin:0;">
                    📖 ${escapeHTML(title)}
                </h2>


                <span
                    style="
                        padding:7px 12px;
                        border-radius:20px;
                        background:rgba(
                            67,
                            97,
                            238,
                            0.12
                        );
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    Course Details
                </span>

            </div>


            <!-- TOPICS -->

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
                                    .join("")
                                }
                            </ul>
                        `
                        : `
                            <p>
                                No topics available.
                            </p>
                        `
                }

            </div>


            <!-- YOUTUBE -->

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
                                    .join("")
                                }

                            </div>
                        `
                        : `
                            <p>
                                No YouTube resources available.
                            </p>
                        `
                }

            </div>


            <!-- PRACTICE -->

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
                                    .join("")
                                }
                            </ol>
                        `
                        : `
                            <p>
                                No practice exercises available.
                            </p>
                        `
                }

            </div>


            <!-- ASSESSMENT -->

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

    const uniqueId =
        Date.now() +
        Math.random()
            .toString(36)
            .substring(2, 8);

    return `

        <div class="assessment-container">

            ${assessment
                .map(
                    (question, index) => `

                        <div
                            class="assessment-question"
                            data-answer="${question.answer}"
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
                                        (
                                            option,
                                            optionIndex
                                        ) => `

                                            <label
                                                style="
                                                    display:block;
                                                    margin:8px 0;
                                                    cursor:pointer;
                                                "
                                            >

                                                <input
                                                    type="radio"
                                                    name="question-${uniqueId}-${index}"
                                                    value="${optionIndex}"
                                                >

                                                ${escapeHTML(
                                                    option
                                                )}

                                            </label>
                                        `
                                    )
                                    .join("")
                                }

                            </div>

                        </div>
                    `
                )
                .join("")
            }


            <button
                type="button"
                class="assessment-submit"
            >
                Submit Assessment
            </button>


            <div
                class="assessment-result"
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
                        Number(selected.value) ===
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
                questions.length
                    ? Math.round(
                        (
                            score /
                            questions.length
                        ) * 100
                    )
                    : 0;

            result.textContent =
                `Assessment Score: ${score}/${questions.length} (${percentage}%)`;
        }
    );
}


/* =========================================================
   TOP AI RECOMMENDATIONS
   ========================================================= */

function renderTopRecommendations(
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

    if (learningPath.length === 0) {

        container.innerHTML = `
            <div class="recommendation-card">
                <p>
                    No additional recommendations
                    are available.
                </p>
            </div>
        `;

        return;
    }

    learningPath.forEach(
        course => {

            const card =
                document.createElement("div");

            card.className =
                "recommendation-card";

            const skills =
                getCourseSkills(course);

            const mastery =
                getMasteryValues(course);

            const predictedSuccess =
                getPredictedSuccess(course);

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

                    ${escapeHTML(skills)}
                </p>

                <p>
                    <strong>
                        Skill Progress:
                    </strong>

                    ${mastery.before}%
                    →
                    ${mastery.after}%
                    (+${mastery.gain}%)
                </p>

                ${
                    predictedSuccess !== null
                        ? `
                            <p>
                                <strong>
                                    Predicted Success:
                                </strong>

                                ${predictedSuccess}%
                            </p>
                        `
                        : ""
                }

                <p>
                    ${escapeHTML(
                        course.description ||
                        ""
                    )}
                </p>

                <button
                    type="button"
                    onclick="
                        showRecommendationDetails(
                            '${escapeJS(
                                course.title ||
                                "Recommended Course"
                            )}'
                        )
                    "
                >
                    📚 View Details
                </button>
            `;

            container.appendChild(card);
        }
    );
}


/* =========================================================
   TOP RECOMMENDATION DETAILS
   ========================================================= */

function showRecommendationDetails(
    courseTitle
) {

    const course =
        (Array.isArray(courseContent)
            ? courseContent
            : courseContent[courseTitle]);

    if (!course) {

        alert(
            `Details for ${courseTitle} are not available.`
        );

        return;
    }

    const content =
        findCourseContent(courseTitle);

    if (!content) {

        alert(
            `Details for ${courseTitle} are not available.`
        );

        return;
    }

    const html =
        buildCourseDetailsHTML(
            courseTitle,
            content
        );

    const wrapper =
        document.createElement("div");

    wrapper.innerHTML = html;

    const panel =
        wrapper.firstElementChild;

    const overlay =
        document.createElement("div");

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:9999;
        background:rgba(0,0,0,0.75);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:30px;
        overflow:auto;
    `;

    const modal =
        document.createElement("div");

    modal.style.cssText = `
        width:min(900px,100%);
        max-height:90vh;
        overflow:auto;
        background:#161927;
        border-radius:18px;
        padding:20px;
        position:relative;
    `;

    const close =
        document.createElement("button");

    close.textContent = "✕";

    close.style.cssText = `
        position:absolute;
        right:15px;
        top:15px;
        border:none;
        border-radius:8px;
        padding:8px 12px;
        cursor:pointer;
    `;

    close.onclick = () =>
        document.body.removeChild(overlay);

    modal.appendChild(close);

    if (panel) {
        modal.appendChild(panel);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}


/* =========================================================
   COURSE SKILLS
   ========================================================= */

function getCourseSkills(course) {

    if (Array.isArray(course.skills)) {

        return course.skills.join(", ");
    }

    if (typeof course.skills === "string") {

        return course.skills;
    }

    if (course.skill) {

        return String(course.skill);
    }

    return "N/A";
}


/* =========================================================
   MASTERY VALUES
   ========================================================= */

function getMasteryValues(course) {

    let before =
        course.current_mastery;

    let after =
        course.expected_mastery;

    let gain =
        course.mastery_gain;

    if (before === undefined) {
        before = course.mastery_before;
    }

    if (after === undefined) {
        after = course.mastery_after;
    }

    if (
        gain === undefined &&
        before !== undefined &&
        after !== undefined
    ) {

        gain =
            Number(after) -
            Number(before);
    }

    before = Number(before);
    after = Number(after);
    gain = Number(gain);

    if (!Number.isFinite(before)) {
        before = 0;
    }

    if (!Number.isFinite(after)) {
        after = before;
    }

    if (!Number.isFinite(gain)) {
        gain = after - before;
    }

    return {
        before,
        gain,
        after
    };
}


/* =========================================================
   PREDICTED SUCCESS
   ========================================================= */

function getPredictedSuccess(course) {

    const value =
        Number(
            course.predicted_success
        );

    if (!Number.isFinite(value)) {
        return null;
    }

    return value;
}


/* =========================================================
   COMPLETE COURSE + ACHIEVE SKILL
   ========================================================= */

async function completeCourse(index) {

    const profile =
        getSelectedProfile();

    if (!profile) {

        alert(
            "No learning profile selected."
        );

        return;
    }

    const recommendation =
        profile.recommendation;

    if (
        !recommendation ||
        typeof recommendation !== "object"
    ) {

        alert(
            "Recommendation data is not available."
        );

        return;
    }

    const learningPath =
        Array.isArray(
            recommendation.learning_path
        )
            ? recommendation.learning_path
            : [];

    const course =
        learningPath[index];

    if (!course) {

        alert(
            "Course not found."
        );

        return;
    }

    const courseName =
        course.title ||
        `Course ${index + 1}`;

    let courseSkills = [];

    if (Array.isArray(course.skills)) {

        courseSkills =
            course.skills
                .map(
                    skill =>
                        extractSkillName(skill)
                )
                .filter(Boolean);

    } else if (
        typeof course.skills === "string"
    ) {

        courseSkills =
            course.skills
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(Boolean);

    } else if (course.skill) {

        courseSkills = [
            String(course.skill).trim()
        ];
    }

    const currentSkills =
        Array.isArray(profile.skills)
            ? [...profile.skills]
            : [];

    for (const skill of courseSkills) {

        const alreadyHasSkill =
            currentSkills.some(
                existing =>
                    normalizeText(existing) ===
                    normalizeText(skill)
            );

        if (!alreadyHasSkill) {
            currentSkills.push(skill);
        }
    }

    const completed =
        Array.isArray(profile.completed)
            ? [...profile.completed]
            : [];

    const alreadyCompleted =
        completed.some(
            item => {

                const existingName =
                    typeof item === "string"
                        ? item
                        : (
                            item &&
                            (
                                item.title ||
                                item.name ||
                                item.course ||
                                ""
                            )
                        );

                return (
                    normalizeText(existingName) ===
                    normalizeText(courseName)
                );
            }
        );

    if (alreadyCompleted) {

        alert(
            "This course is already completed."
        );

        return;
    }

    completed.push(courseName);

    const totalRoadmapCourses =
        Number(profile.totalRoadmapCourses) > 0
            ? Number(profile.totalRoadmapCourses)
            : learningPath.length;

    const updatedProfile =
        updateSelectedProfile({

            skills: currentSkills,

            completed: completed,

            totalRoadmapCourses:
                totalRoadmapCourses,

            lastCompletedCourse:
                courseName,

            lastCompletedSkills:
                courseSkills,

            lastCompletedAt:
                new Date().toISOString()
        });

    if (!updatedProfile) {

        alert(
            "Unable to update the selected profile."
        );

        return;
    }

    localStorage.setItem(
        "completedCourses",
        JSON.stringify(completed)
    );

    sessionStorage.setItem(
        "learnPathProfile",
        JSON.stringify(updatedProfile)
    );

    sessionStorage.setItem(
        "lastProfile",
        JSON.stringify(updatedProfile)
    );

    showLoading();

    try {

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
                            updatedProfile
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

        const newRecommendation =
            await response.json();

        const finalProfile =
            updateSelectedProfile({

                skills:
                    currentSkills,

                completed:
                    completed,

                recommendation:
                    newRecommendation,

                totalRoadmapCourses:
                    totalRoadmapCourses,

                recommendationUpdatedAt:
                    new Date().toISOString()
            });

        const profileToUse =
            finalProfile ||
            {
                ...updatedProfile,

                skills:
                    currentSkills,

                completed:
                    completed,

                recommendation:
                    newRecommendation,

                totalRoadmapCourses:
                    totalRoadmapCourses
            };

        localStorage.setItem(
            "recommendation",
            JSON.stringify(
                newRecommendation
            )
        );

        sessionStorage.setItem(
            "learnPathRoadmap",
            JSON.stringify(
                newRecommendation
            )
        );

        sessionStorage.setItem(
            "learnPathProfile",
            JSON.stringify(
                profileToUse
            )
        );

        sessionStorage.setItem(
            "lastProfile",
            JSON.stringify(
                profileToUse
            )
        );

        displayRoadmap(
            profileToUse,
            newRecommendation
        );

        const skillText =
            courseSkills.length > 0
                ? courseSkills.join(", ")
                : "the course skill";

        alert(
            `Great! ${skillText} has been added to your achieved skills. 🎉`
        );

    } catch (error) {

        console.error(
            "Could not regenerate roadmap:",
            error
        );

        displayRoadmap(
            updatedProfile,
            recommendation
        );

        alert(
            "The course was marked as completed, " +
            "but the roadmap could not be refreshed.\n\n" +
            error.message
        );
    }
}


/* =========================================================
   FEEDBACK
   ========================================================= */

function giveFeedback(course) {

    const feedback =
        prompt(
            `Give feedback for ${course}:`
        );

    if (
        feedback &&
        feedback.trim()
    ) {

        console.log(
            "Course feedback:",
            {
                course,
                feedback:
                    feedback.trim()
            }
        );

        alert(
            "Thank you for your feedback! ❤️"
        );
    }
}


/* =========================================================
   ROADMAP HEADER
   ========================================================= */

function updateRoadmapHeader(
    profile,
    goal
) {

    const title =
        document.getElementById(
            "roadmapTitle"
        );

    const subtitle =
        document.getElementById(
            "roadmapSubtitle"
        );

    const hiddenGoal =
        document.getElementById(
            "roadmapGoal"
        );

    const selectedGoal =
        goal ||
        profile.goal ||
        "Learning";

    if (title) {

        title.textContent =
            `${selectedGoal} Journey`;
    }

    if (subtitle) {

        const hours =
            profile.study_time ||
            "0";

        const months =
            profile.target_months ||
            profile.months ||
            6;

        subtitle.textContent =
            `${hours} hours/week • ${months} month target`;
    }

    if (hiddenGoal) {

        hiddenGoal.textContent =
            selectedGoal;
    }
}


/* =========================================================
   STUDENT NAME
   ========================================================= */

function updateStudentName(profile) {

    const element =
        document.getElementById(
            "topNavName"
        );

    if (
        !element ||
        !profile ||
        !profile.name
    ) {
        return;
    }

    element.textContent =
        profile.name
            .trim()
            .split(/\s+/)[0];
}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    const container =
        document.getElementById(
            "roadmapContainer"
        );

    if (container) {

        container.innerHTML = `
            <div class="course-card">

                <h3>
                    🤖 Updating your
                    personalized learning path...
                </h3>

                <p>
                    Your newly achieved skill is
                    being added to your learning profile.
                </p>

            </div>
        `;
    }

    setText(
        "readinessPercentage",
        "..."
    );

    setText(
        "skillsHave",
        "..."
    );

    setText(
        "skillsToLearn",
        "..."
    );

    setText(
        "recommendedSteps",
        "..."
    );

    const skillTags =
        document.getElementById(
            "skillTags"
        );

    if (skillTags) {
        skillTags.innerHTML = "";
    }
}


/* =========================================================
   ERROR
   ========================================================= */

function showBackendError(error) {

    const container =
        document.getElementById(
            "roadmapContainer"
        );

    const message =
        error instanceof Error
            ? error.message
            : String(error);

    console.error(
        "Roadmap error:",
        message
    );

    if (container) {

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
                        font-family:monospace;
                    "
                >${escapeHTML(message)}</pre>

                <p>
                    Make sure your FastAPI
                    backend and ML service
                    are running.
                </p>

            </div>
        `;
    }

    setText(
        "readinessPercentage",
        "—"
    );

    setText(
        "skillsHave",
        "—"
    );

    setText(
        "skillsToLearn",
        "—"
    );

    setText(
        "recommendedSteps",
        "—"
    );
}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   UNIQUE SKILLS
   ========================================================= */

function uniqueSkills(skills) {

    const seen =
        new Set();

    const result = [];

    for (
        const skill of (
            skills || []
        )
    ) {

        const value =
            String(skill).trim();

        const key =
            value.toLowerCase();

        if (
            value &&
            !seen.has(key)
        ) {

            seen.add(key);
            result.push(value);
        }
    }

    return result;
}


/* =========================================================
   CLAMP
   ========================================================= */

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


/* =========================================================
   NORMALIZE TEXT
   ========================================================= */

function normalizeText(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

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


/* =========================================================
   ESCAPE JAVASCRIPT
   ========================================================= */

function escapeJS(value) {

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