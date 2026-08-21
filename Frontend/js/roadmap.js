// ============================================================
// LEARNPATH AI - ROADMAP
// Dynamic ML + Backend Connected Version
// MULTI-PROFILE SAFE VERSION
// ============================================================

const BACKEND_URL =
    "http://127.0.0.1:8000";


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadRoadmap
);


// ============================================================
// LOAD ROADMAP
// ============================================================

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

    const profileData =
        getSelectedProfile();


    if (!profileData) {

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


    // ---------------------------------------------------------
    // UPDATE NAVIGATION
    // ---------------------------------------------------------

    updateStudentName(
        profileData
    );


    updateRoadmapHeader(
        profileData
    );


    // ---------------------------------------------------------
    // SHOW LOADING
    // ---------------------------------------------------------

    showLoading();


    // ---------------------------------------------------------
    // USE EXISTING RECOMMENDATION IF AVAILABLE
    // ---------------------------------------------------------

    if (
        profileData.recommendation &&
        typeof profileData.recommendation === "object"
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
    // GENERATE NEW RECOMMENDATION
    // ---------------------------------------------------------

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


        // -----------------------------------------------------
        // READ ML RESPONSE
        // -----------------------------------------------------

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


        console.log(
            "ML recommendation:",
            recommendationData
        );


        // =====================================================
        // SAVE RECOMMENDATION INSIDE THIS PROFILE
        // =====================================================

        updateSelectedProfile({
            recommendation:
                recommendationData,

            recommendationUpdatedAt:
                new Date().toISOString()
        });


        // -----------------------------------------------------
        // Display
        // -----------------------------------------------------

        displayRoadmap(
            {
                ...profileData,
                recommendation:
                    recommendationData
            },
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
                Array.isArray(profiles)
            ) {

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


        // -----------------------------------------------------
        // Backward compatibility with old storage
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

            return null;
        }


        const profiles =
            JSON.parse(
                profilesRaw
            );


        if (
            !Array.isArray(profiles)
        ) {

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


        // Backward compatibility
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


// ============================================================
// DISPLAY ROADMAP
// ============================================================

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
            ? recommendationData.skill_gaps
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
        learningPath
    );


    renderTopRecommendations(
        learningPath
    );


    updateRoadmapHeader(
        profileData,
        goal
    );


    console.log(
        "Personalized roadmap ready.",
        {
            profileId:
                profileData.id,

            goal,

            skills:
                userSkills,

            skillGaps,

            learningPath,

            readiness:
                recommendationData
                    .readiness_percentage
        }
    );
}


// ============================================================
// BACKEND SKILLS
// ============================================================

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


// ============================================================
// SUMMARY CARDS
// ============================================================

function updateSummaryCards(
    recommendationData,
    userSkills,
    skillGaps,
    learningPath
) {

    setText(
        "skillsHave",
        userSkills.length
    );


    setText(
        "skillsToLearn",
        uniqueSkills(
            skillGaps
        ).length
    );


    setText(
        "recommendedSteps",
        learningPath.length
    );


    let readiness = 0;


    // Backend is the source of truth
    if (
        recommendationData &&
        Number.isFinite(
            Number(
                recommendationData
                    .readiness_percentage
            )
        )
    ) {

        readiness =
            Number(
                recommendationData
                    .readiness_percentage
            );

    } else {

        const total =
            userSkills.length +
            skillGaps.length;


        if (
            total > 0
        ) {

            readiness =
                Math.round(
                    (
                        userSkills.length /
                        total
                    ) * 100
                );
        }
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


    console.log(
        "Summary:",
        {
            readiness,

            skillsHave:
                userSkills.length,

            skillsToLearn:
                uniqueSkills(
                    skillGaps
                ).length,

            recommendedSteps:
                learningPath.length
        }
    );
}


// ============================================================
// SKILL MAP
// ============================================================

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


    uniqueSkills(
        skillGaps
    ).forEach(
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
            "No skill information available";


        skillTags.appendChild(
            tag
        );
    }
}


// ============================================================
// ROADMAP COURSES
// ============================================================

function renderRoadmapCourses(
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
                    The AI recommendation engine
                    did not return any new courses
                    for this profile.
                </p>
            </div>
        `;

        return;
    }


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

                        🏆 Complete

                        ${escapeHTML(
                            course.title ||
                            "this course"
                        )}

                        and finish the project

                    </div>


                    <div class="course-buttons">

                        <button
                            onclick="
                                completeCourse(${index})
                            "
                        >
                            Mark Complete
                        </button>


                        <button
                            onclick="
                                giveFeedback(
                                    '${escapeJS(
                                        course.title ||
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


            container.appendChild(
                step
            );
        }
    );
}


// ============================================================
// TOP RECOMMENDATIONS
// ============================================================

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


// ============================================================
// COURSE SKILLS
// ============================================================

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


// ============================================================
// MASTERY VALUES
// ============================================================

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
        after === undefined &&
        before !== undefined &&
        gain !== undefined
    ) {

        after =
            Number(before) +
            Number(gain);
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
        Number.isFinite(
            Number(before)
        )
            ? Number(before)
            : 0;


    after =
        Number.isFinite(
            Number(after)
        )
            ? Number(after)
            : before;


    gain =
        Number.isFinite(
            Number(gain)
        )
            ? Number(gain)
            : Math.max(
                0,
                after - before
            );


    before =
        clamp(
            Math.round(before),
            0,
            100
        );


    after =
        clamp(
            Math.round(after),
            0,
            100
        );


    gain =
        clamp(
            Math.round(gain),
            0,
            100
        );


    return {
        before,
        after,
        gain
    };
}


// ============================================================
// PREDICTED SUCCESS
// ============================================================

function getPredictedSuccess(
    course
) {

    const values = [

        course.predicted_success,

        course.success_probability,

        course.successProbability
    ];


    for (
        const value of values
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            let number =
                Number(value);


            if (
                Number.isFinite(number)
            ) {

                if (
                    number >= 0 &&
                    number <= 1
                ) {

                    number *= 100;
                }


                return clamp(
                    Math.round(number),
                    0,
                    100
                );
            }
        }
    }


    return null;
}


// ============================================================
// CURRENT PROFILE SKILLS
// ============================================================

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

    const result = [];

    const seen =
        new Set();


    if (
        !Array.isArray(skills)
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
// UPDATE ROADMAP HEADER
// ============================================================

function updateRoadmapHeader(
    profileData,
    goal = null
) {

    const subtitle =
        document.getElementById(
            "roadmapSubtitle"
        );


    if (!subtitle) {

        return;
    }


    const selectedGoal =
        goal ||
        profileData.goal ||
        "your learning goal";


    const hours =
        profileData.study_time ||
        profileData.studyTime;


    const months =
        profileData.months;


    let text =
        `Personalized for ${selectedGoal}`;


    if (hours) {

        text +=
            ` • ${hours} hours/week`;
    }


    if (months) {

        text +=
            ` • ${months} month target`;
    }


    subtitle.textContent =
        text;


    const goalElement =
        document.getElementById(
            "roadmapGoal"
        );


    if (goalElement) {

        goalElement.textContent =
            `${selectedGoal} Journey`;
    }
}


// ============================================================
// UPDATE STUDENT NAME
// ============================================================

function updateStudentName(
    profileData
) {

    const element =
        document.getElementById(
            "topNavName"
        );


    if (
        !element ||
        !profileData ||
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


// ============================================================
// COMPLETE COURSE
// ============================================================

async function completeCourse(
    index
) {

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
        !recommendation
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


    // ---------------------------------------------------------
    // Update completed courses for THIS profile
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
            item =>
                normalizeText(
                    typeof item === "string"
                        ? item
                        : (
                            item.title ||
                            item.name ||
                            ""
                        )
                ) ===
                normalizeText(
                    courseName
                )
        );


    if (
        !alreadyCompleted
    ) {

        completed.push(
            courseName
        );
    }


    // ---------------------------------------------------------
    // Save completed courses inside selected profile
    // ---------------------------------------------------------

    updateSelectedProfile({
        completed
    });


    // ---------------------------------------------------------
    // Also maintain old key for compatibility
    // ---------------------------------------------------------

    localStorage.setItem(
        "completedCourses",
        JSON.stringify(
            completed
        )
    );


    alert(
        "Course marked as completed! 🎉"
    );


    // ---------------------------------------------------------
    // Regenerate recommendation for THIS profile
    // ---------------------------------------------------------

    const updatedProfile =
        getSelectedProfile();


    if (!updatedProfile) {

        return;
    }


    try {

        showLoading();


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

            throw new Error(
                `Backend returned ${response.status}`
            );
        }


        const newRecommendation =
            await response.json();


        updateSelectedProfile({
            recommendation:
                newRecommendation,

            recommendationUpdatedAt:
                new Date().toISOString()
        });


        const finalProfile =
            getSelectedProfile();


        displayRoadmap(
            finalProfile,
            newRecommendation
        );


    } catch (error) {

        console.error(
            "Could not regenerate roadmap:",
            error
        );


        showBackendError(
            error
        );
    }
}


// ============================================================
// FEEDBACK
// ============================================================

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


// ============================================================
// LOADING
// ============================================================

function showLoading() {

    const container =
        document.getElementById(
            "roadmapContainer"
        );


    if (container) {

        container.innerHTML = `
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


// ============================================================
// ERROR
// ============================================================

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
                >${escapeHTML(
                    message
                )}</pre>

                <p>
                    Make sure your FastAPI
                    backend is running.
                </p>

                <p>
                    Backend:
                    http://127.0.0.1:8000
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


// ============================================================
// GENERIC HELPERS
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


function normalizeText(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
}


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