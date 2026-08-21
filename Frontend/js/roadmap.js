// =========================================================
// LEARNPATH AI - ROADMAP
// Multi-profile + Dynamic ML Roadmap + Skill Achievement
// =========================================================

const BACKEND_URL =
    "http://127.0.0.1:8000";


document.addEventListener(
    "DOMContentLoaded",
    loadRoadmap
);


// =========================================================
// LOAD ROADMAP
// =========================================================

async function loadRoadmap() {

    console.log(
        "================================"
    );

    console.log(
        "LEARNPATH AI - LOADING ROADMAP"
    );

    console.log(
        "================================"
    );


    // ---------------------------------------------------------
    // GET SELECTED PROFILE
    // ---------------------------------------------------------

    let profileData =
        getSelectedProfile();


    // ---------------------------------------------------------
    // FALLBACK TO SESSION PROFILE
    // ---------------------------------------------------------

    if (!profileData) {

        try {

            const stored =
                sessionStorage.getItem(
                    "learnPathProfile"
                );


            if (stored) {

                profileData =
                    JSON.parse(
                        stored
                    );
            }

        } catch (error) {

            console.error(
                "Session profile error:",
                error
            );
        }
    }


    // ---------------------------------------------------------
    // PROFILE CHECK
    // ---------------------------------------------------------

    if (
        !profileData ||
        !profileData.name
    ) {

        alert(
            "Please select or create a learning profile first."
        );

        window.location.href =
            "profile.html";

        return;
    }


    console.log(
        "Selected profile:",
        profileData
    );


    updateStudentName(
        profileData
    );


    updateRoadmapHeader(
        profileData
    );


    showLoading();


    // ---------------------------------------------------------
    // USE RECOMMENDATION STORED FOR THIS PROFILE
    // ---------------------------------------------------------

    if (
        profileData.recommendation &&
        typeof profileData.recommendation ===
            "object"
    ) {

        console.log(
            "Using recommendation stored for this profile."
        );


        displayRoadmap(
            profileData,
            profileData.recommendation
        );


        return;
    }


    // ---------------------------------------------------------
    // USE CURRENT SESSION ROADMAP
    // ---------------------------------------------------------

    try {

        const sessionRoadmap =
            sessionStorage.getItem(
                "learnPathRoadmap"
            );


        const lastProfile =
            sessionStorage.getItem(
                "lastProfile"
            );


        if (
            sessionRoadmap &&
            lastProfile
        ) {

            const savedProfile =
                JSON.parse(
                    lastProfile
                );


            const roadmapData =
                JSON.parse(
                    sessionRoadmap
                );


            const sameProfile =
                profileData.id &&
                savedProfile.id &&
                profileData.id ===
                    savedProfile.id;


            if (
                sameProfile ||
                !profileData.id
            ) {

                console.log(
                    "Using current-session roadmap."
                );


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


    // ---------------------------------------------------------
    // GENERATE NEW RECOMMENDATION
    // ---------------------------------------------------------

    await generateRecommendation(
        profileData
    );
}


// =========================================================
// GENERATE RECOMMENDATION
// =========================================================

async function generateRecommendation(
    profileData
) {

    try {

        console.log(
            "Sending selected profile to backend..."
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
                        typeof errorData.detail ===
                        "object"

                            ? JSON.stringify(
                                errorData.detail,
                                null,
                                2
                            )

                            : String(
                                errorData.detail
                            );
                }


            } catch (error) {

                console.error(
                    "Could not parse backend error:",
                    error
                );
            }


            throw new Error(
                errorMessage
            );
        }


        const recommendationData =
            await response.json();


        if (
            !recommendationData ||
            typeof recommendationData !==
                "object"
        ) {

            throw new Error(
                "Backend returned an invalid recommendation."
            );
        }


        console.log(
            "ML recommendation:",
            recommendationData
        );


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

                recommendation:
                    recommendationData,

                totalRoadmapCourses:
                    totalRoadmapCourses,

                recommendationUpdatedAt:
                    new Date().toISOString()

            });


        const profileForDisplay =
            updatedProfile ||
            {
                ...profileData,

                recommendation:
                    recommendationData,

                totalRoadmapCourses:
                    totalRoadmapCourses
            };


        // -----------------------------------------------------
        // BACKWARD COMPATIBILITY
        // -----------------------------------------------------

        localStorage.setItem(
            "recommendation",
            JSON.stringify(
                recommendationData
            )
        );


        sessionStorage.setItem(
            "learnPathRoadmap",
            JSON.stringify(
                recommendationData
            )
        );


        sessionStorage.setItem(
            "lastProfile",
            JSON.stringify(
                profileForDisplay
            )
        );


        sessionStorage.setItem(
            "learnPathProfile",
            JSON.stringify(
                profileForDisplay
            )
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


        showBackendError(
            error
        );
    }
}


// =========================================================
// GET SELECTED PROFILE
// =========================================================

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
        // BACKWARD COMPATIBILITY
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
            "Unable to load selected profile:",
            error
        );
    }


    return null;
}


// =========================================================
// UPDATE SELECTED PROFILE
// =========================================================

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

            console.warn(
                "No selected multi-profile found."
            );


            return null;
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

            return null;
        }


        const index =
            profiles.findIndex(
                profile =>
                    profile.id ===
                    selectedId
            );


        if (
            index === -1
        ) {

            return null;
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


        // -----------------------------------------------------
        // BACKWARD COMPATIBILITY
        // -----------------------------------------------------

        localStorage.setItem(
            "learnPathProfile",
            JSON.stringify(
                profiles[index]
            )
        );


        if (
            updates.recommendation
        ) {

            localStorage.setItem(
                "recommendation",
                JSON.stringify(
                    updates.recommendation
                )
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


// =========================================================
// DISPLAY ROADMAP
// =========================================================

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


    // ---------------------------------------------------------
    // MAKE SURE ROADMAP TOTAL IS STORED
    // ---------------------------------------------------------

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

            profileData =
                updated;
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


    renderRoadmapCourses(
        learningPath,
        profileData
    );


    renderTopRecommendations(
        learningPath
    );


    console.log(
        "================================"
    );

    console.log(
        "PERSONALIZED ROADMAP READY"
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
        recommendationData
            .readiness_percentage
    );

    console.log(
        "================================"
    );
}


// =========================================================
// BACKEND / PROFILE SKILLS
// =========================================================

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
        typeof recommendationData.skill_mastery ===
            "object"
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
                    ([skill]) =>
                        skill
                );


        if (
            skills.length > 0
        ) {

            return uniqueSkills(
                skills
            );
        }
    }


    return getCurrentSkills(
        profileData
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
            Array.isArray(
                value
            )
        ) {

            return uniqueSkills(
                value
                    .map(
                        skill =>
                            extractSkillName(
                                skill
                            )
                    )
                    .filter(Boolean)
            );
        }


        if (
            typeof value ===
            "string"
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


// =========================================================
// EXTRACT SKILL NAME
// =========================================================

function extractSkillName(
    skill
) {

    if (
        typeof skill ===
        "string"
    ) {

        return skill.trim();
    }


    if (
        skill &&
        typeof skill ===
            "object"
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
// SUMMARY CARDS
// =========================================================

function updateSummaryCards(
    recommendationData,
    userSkills,
    skillGaps,
    learningPath
) {

    // -----------------------------------------------------
    // REMOVE DUPLICATE GAPS THAT ARE ALREADY SKILLS
    // -----------------------------------------------------

    const remainingGaps =
        uniqueSkills(
            skillGaps
        ).filter(
            gap => {

                return !userSkills.some(
                    skill =>
                        normalizeText(
                            skill
                        ) ===
                        normalizeText(
                            gap
                        )
                );
            }
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


    // -----------------------------------------------------
    // GOAL READINESS
    // -----------------------------------------------------

    let readiness =
        Number(
            recommendationData
                .readiness_percentage
        );


    // Fallback calculation
    if (
        !Number.isFinite(
            readiness
        )
    ) {

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


// =========================================================
// SKILL MAP
// =========================================================

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


    skillTags.innerHTML =
        "";


    // -----------------------------------------------------
    // ACHIEVED SKILLS
    // -----------------------------------------------------

    uniqueSkills(
        userSkills
    ).forEach(
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


    // -----------------------------------------------------
    // REMAINING SKILLS
    // -----------------------------------------------------

    uniqueSkills(
        skillGaps
    ).forEach(
        skill => {

            const alreadyHave =
                userSkills.some(
                    existing =>
                        normalizeText(
                            existing
                        ) ===
                        normalizeText(
                            skill
                        )
                );


            if (
                alreadyHave
            ) {

                return;
            }


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


    if (
        userSkills.length === 0 &&
        skillGaps.length === 0
    ) {

        const tag =
            document.createElement(
                "span"
            );


        tag.className =
            "skill-needed";


        tag.textContent =
            "No skill information available.";


        skillTags.appendChild(
            tag
        );
    }
}


// =========================================================
// ROADMAP COURSES
// =========================================================

function renderRoadmapCourses(
    learningPath,
    profileData
) {

    const container =
        document.getElementById(
            "roadmapContainer"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


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


    const completed =
        Array.isArray(
            profileData.completed
        )
            ? profileData.completed
            : [];


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
                getCourseSkills(
                    course
                );


            const mastery =
                getMasteryValues(
                    course
                );


            const predictedSuccess =
                getPredictedSuccess(
                    course
                );


            const courseName =
                course.title ||
                `Course ${index + 1}`;


            const isCompleted =
                completed.some(
                    item => {

                        const itemName =
                            typeof item ===
                                "string"

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
                            normalizeText(
                                itemName
                            ) ===
                            normalizeText(
                                courseName
                            )
                        );
                    }
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
                                "N/A"
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
                            courseName
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


                    <div class="course-project">

                        ${
                            isCompleted
                                ? "✅ Completed"
                                : "🏆 Complete"
                        }

                        ${escapeHTML(
                            courseName
                        )}

                        ${
                            isCompleted
                                ? ""
                                : " and finish the project"
                        }

                    </div>


                    <div class="course-buttons">

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


                        <button
                            onclick="
                                giveFeedback(
                                    '${escapeJS(
                                        courseName
                                    )}'
                                )
                            "
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


    container.innerHTML =
        "";


    if (
        learningPath.length === 0
    ) {

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
                document.createElement(
                    "div"
                );


            card.className =
                "recommendation-card";


            const skills =
                getCourseSkills(
                    course
                );


            const mastery =
                getMasteryValues(
                    course
                );


            const predictedSuccess =
                getPredictedSuccess(
                    course
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

            `;


            container.appendChild(
                card
            );
        }
    );
}


// =========================================================
// COURSE SKILLS
// =========================================================

function getCourseSkills(
    course
) {

    if (
        Array.isArray(
            course.skills
        )
    ) {

        return course.skills.join(
            ", "
        );
    }


    if (
        typeof course.skills ===
        "string"
    ) {

        return course.skills;
    }


    if (
        course.skill
    ) {

        return String(
            course.skill
        );
    }


    return "N/A";
}


// =========================================================
// MASTERY VALUES
// =========================================================

function getMasteryValues(
    course
) {

    let before =
        course.current_mastery;


    let after =
        course.expected_mastery;


    let gain =
        course.mastery_gain;


    if (
        before === undefined
    ) {

        before =
            course.mastery_before;
    }


    if (
        after === undefined
    ) {

        after =
            course.mastery_after;
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


    before =
        Number(
            before
        );


    after =
        Number(
            after
        );


    gain =
        Number(
            gain
        );


    if (
        !Number.isFinite(
            before
        )
    ) {

        before = 0;
    }


    if (
        !Number.isFinite(
            after
        )
    ) {

        after = before;
    }


    if (
        !Number.isFinite(
            gain
        )
    ) {

        gain =
            after -
            before;
    }


    return {

        before,

        gain,

        after

    };
}


// =========================================================
// PREDICTED SUCCESS
// =========================================================

function getPredictedSuccess(
    course
) {

    const value =
        Number(
            course.predicted_success
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return null;
    }


    return value;
}


// =========================================================
// COMPLETE COURSE + ACHIEVE SKILL
// =========================================================

async function completeCourse(
    index
) {

    // ---------------------------------------------------------
    // GET SELECTED PROFILE
    // ---------------------------------------------------------

    const profile =
        getSelectedProfile();


    if (!profile) {

        alert(
            "No learning profile selected."
        );

        return;
    }


    // ---------------------------------------------------------
    // GET RECOMMENDATION
    // ---------------------------------------------------------

    const recommendation =
        profile.recommendation;


    if (
        !recommendation ||
        typeof recommendation !==
            "object"
    ) {

        alert(
            "Recommendation data is not available."
        );

        return;
    }


    // ---------------------------------------------------------
    // GET LEARNING PATH
    // ---------------------------------------------------------

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


    // ---------------------------------------------------------
    // GET COURSE SKILLS
    // ---------------------------------------------------------

    let courseSkills = [];


    if (
        Array.isArray(
            course.skills
        )
    ) {

        courseSkills =
            course.skills
                .map(
                    skill =>
                        extractSkillName(
                            skill
                        )
                )
                .filter(Boolean);

    } else if (
        typeof course.skills ===
        "string"
    ) {

        courseSkills =
            course.skills
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(Boolean);

    } else if (
        course.skill
    ) {

        courseSkills = [
            String(
                course.skill
            ).trim()
        ];
    }


    // ---------------------------------------------------------
    // CURRENT SKILLS
    // ---------------------------------------------------------

    const currentSkills =
        Array.isArray(
            profile.skills
        )
            ? [
                ...profile.skills
            ]
            : [];


    // ---------------------------------------------------------
    // ADD ACHIEVED SKILLS
    // ---------------------------------------------------------

    for (
        const skill of courseSkills
    ) {

        const alreadyHasSkill =
            currentSkills.some(
                existing =>
                    normalizeText(
                        existing
                    ) ===
                    normalizeText(
                        skill
                    )
            );


        if (
            !alreadyHasSkill
        ) {

            currentSkills.push(
                skill
            );
        }
    }


    // ---------------------------------------------------------
    // COMPLETED COURSES
    // ---------------------------------------------------------

    const completed =
        Array.isArray(
            profile.completed
        )
            ? [
                ...profile.completed
            ]
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
                    normalizeText(
                        existingName
                    ) ===
                    normalizeText(
                        courseName
                    )
                );
            }
        );


    if (
        alreadyCompleted
    ) {

        alert(
            "This course is already completed."
        );

        return;
    }


    completed.push(
        courseName
    );


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
    // SAVE UPDATED PROFILE
    // ---------------------------------------------------------

    const updatedProfile =
        updateSelectedProfile({

            skills:
                currentSkills,

            completed:
                completed,

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


    // ---------------------------------------------------------
    // LEGACY STORAGE
    // ---------------------------------------------------------

    localStorage.setItem(
        "completedCourses",
        JSON.stringify(
            completed
        )
    );


    sessionStorage.setItem(
        "learnPathProfile",
        JSON.stringify(
            updatedProfile
        )
    );


    sessionStorage.setItem(
        "lastProfile",
        JSON.stringify(
            updatedProfile
        )
    );


    console.log(
        "================================"
    );

    console.log(
        "SKILL ACHIEVEMENT"
    );

    console.log(
        "Completed Course:",
        courseName
    );

    console.log(
        "Achieved Skills:",
        courseSkills
    );

    console.log(
        "Updated Skills:",
        currentSkills
    );

    console.log(
        "================================"
    );


    // ---------------------------------------------------------
    // SHOW LOADING
    // ---------------------------------------------------------

    showLoading();


    // ---------------------------------------------------------
    // REGENERATE ROADMAP
    // ---------------------------------------------------------

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


        if (
            !response.ok
        ) {

            const errorText =
                await response.text();


            throw new Error(
                `Backend returned ${response.status}: ${errorText}`
            );
        }


        const newRecommendation =
            await response.json();


        // -----------------------------------------------------
        // SAVE NEW RECOMMENDATION
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // SHOW UPDATED ROADMAP
        // -----------------------------------------------------

        displayRoadmap(
            profileToUse,
            newRecommendation
        );


        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        const skillText =
            courseSkills.length > 0

                ? courseSkills.join(
                    ", "
                )

                : "the course skill";


        alert(
            `Great! ${skillText} ` +
            `has been added to your achieved skills. 🎉`
        );


    } catch (error) {

        console.error(
            "Could not regenerate roadmap:",
            error
        );


        // Keep the skill/course completion saved
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


// =========================================================
// ROADMAP HEADER
// =========================================================

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
            `${hours} hours/week • ` +
            `${months} month target`;
    }


    if (hiddenGoal) {

        hiddenGoal.textContent =
            selectedGoal;
    }
}


// =========================================================
// STUDENT NAME
// =========================================================

function updateStudentName(
    profile
) {

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


// =========================================================
// LOADING
// =========================================================

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

        skillTags.innerHTML =
            "";
    }
}


// =========================================================
// ERROR
// =========================================================

function showBackendError(
    error
) {

    const container =
        document.getElementById(
            "roadmapContainer"
        );


    const message =
        error instanceof Error

            ? error.message

            : String(
                error
            );


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
                >${escapeHTML(
                    message
                )}</pre>


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


// =========================================================
// SET TEXT
// =========================================================

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


// =========================================================
// UNIQUE SKILLS
// =========================================================

function uniqueSkills(
    skills
) {

    const seen =
        new Set();


    const result =
        [];


    for (
        const skill of (
            skills || []
        )
    ) {

        const value =
            String(
                skill
            ).trim();


        const key =
            value.toLowerCase();


        if (
            value &&
            !seen.has(
                key
            )
        ) {

            seen.add(
                key
            );


            result.push(
                value
            );
        }
    }


    return result;
}


// =========================================================
// CLAMP
// =========================================================

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


// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();
}


// =========================================================
// ESCAPE HTML
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
// ESCAPE JAVASCRIPT
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