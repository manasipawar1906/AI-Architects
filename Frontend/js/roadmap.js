// ======================================================
// GET BACKEND RESPONSE
// ======================================================

const recommendationData =
    JSON.parse(
        localStorage.getItem("recommendation")
    );


if (!recommendationData) {

    alert(
        "No recommendation found. Please complete your profile first."
    );

    window.location.href = "profile.html";

}


// ======================================================
// GET PROFILE DATA
// ======================================================

const profileData =
    JSON.parse(
        localStorage.getItem("learnPathProfile")
    ) || {};


// ======================================================
// DATA FROM BACKEND
// ======================================================

const skillGaps =
    recommendationData.skill_gaps || [];

const learningPath =
    recommendationData.learning_path || [];

const goal =
    recommendationData.goal || "Your Learning Journey";


// ======================================================
// CALCULATE USER SKILLS
// ======================================================

const userSkills =
    profileData.skills || [];


// ======================================================
// GOAL
// ======================================================

const roadmapGoal =
    document.getElementById(
        "roadmapGoal"
    );

roadmapGoal.textContent =
    goal + " Journey";


// ======================================================
// SUMMARY
// ======================================================

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


// Number of skills user already has

skillsHave.textContent =
    userSkills.length;


// Number of missing skills

skillsToLearn.textContent =
    skillGaps.length;


// Number of recommended courses

recommendedSteps.textContent =
    learningPath.length;


// ======================================================
// READINESS PERCENTAGE
// ======================================================

// Simple readiness calculation

const totalSkills =
    userSkills.length +
    skillGaps.length;

let readiness = 100;

if (totalSkills > 0) {

    readiness =
        Math.round(
            (userSkills.length / totalSkills) * 100
        );

}


// Display readiness

document.getElementById(
    "readinessPercentage"
).textContent =
    readiness + "%";


document.getElementById(
    "readinessText"
).textContent =
    readiness + "% ready";


// ======================================================
// SKILL TAGS
// ======================================================

const skillTags =
    document.getElementById(
        "skillTags"
    );


// Skills user already has

userSkills.forEach(skill => {

    const tag =
        document.createElement("span");

    tag.className =
        "skill-have";

    tag.textContent =
        "✓ " + skill;

    skillTags.appendChild(tag);

});


// Skills user needs

skillGaps.forEach(skill => {

    const tag =
        document.createElement("span");

    tag.className =
        "skill-needed";

    tag.textContent =
        "→ " + skill;

    skillTags.appendChild(tag);

});


// ======================================================
// ROADMAP
// ======================================================

const roadmapContainer =
    document.getElementById(
        "roadmapContainer"
    );


learningPath.forEach(
    (course, index) => {

        const step =
            document.createElement("div");

        step.className =
            "roadmap-step";


        const skills =
            Array.isArray(course.skills)
                ? course.skills.join(", ")
                : course.skills || "N/A";


        step.innerHTML = `

            <div class="step-number">
                ${index + 1}
            </div>


            <div class="course-card">

                <div class="course-top">

                    <span class="level">
                        ${course.level || "N/A"}
                    </span>

                    <span class="hours">
                        ${course.duration || "N/A"}
                    </span>

                </div>


                <h3>
                    ${course.title}
                </h3>


                <div class="course-info">

                    <p>
                        <strong>
                            Description:
                        </strong>

                        ${course.description || ""}
                    </p>


                    <p>
                        <strong>
                            Skills:
                        </strong>

                        ${skills}
                    </p>


                    <p>
                        <strong>
                            Project:
                        </strong>

                        ${course.project || ""}
                    </p>

                </div>


                <div class="course-project">

                    🏆 Complete
                    ${course.title}
                    and finish the project

                </div>


                <div class="course-buttons">

                    <button
                        onclick="completeCourse(${index})"
                    >
                        Mark Complete
                    </button>


                    <button
                        onclick="giveFeedback('${course.title.replace(/'/g, "\\'")}')"
                    >
                        Give Feedback
                    </button>

                </div>

            </div>

        `;


        roadmapContainer.appendChild(step);

    }
);


// ======================================================
// COMPLETE COURSE
// ======================================================

function completeCourse(index) {

    const completed =
        JSON.parse(
            localStorage.getItem(
                "completedCourses"
            )
        ) || [];


    if (!completed.includes(index)) {

        completed.push(index);

    }


    localStorage.setItem(
        "completedCourses",
        JSON.stringify(completed)
    );


    alert(
        "Course marked as completed! 🎉"
    );

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

        alert(
            "Thank you for your feedback! ❤️"
        );

    }

}


// ======================================================
// RECOMMENDATIONS
// ======================================================

const recommendationContainer =
    document.getElementById(
        "recommendationContainer"
    );


learningPath.forEach(course => {

    const card =
        document.createElement("div");

    card.className =
        "recommendation-card";


    const skills =
        Array.isArray(course.skills)
            ? course.skills.join(", ")
            : course.skills || "N/A";


    card.innerHTML = `

        <h3>
            ${course.title}
        </h3>


        <p>
            <strong>
                Level:
            </strong>

            ${course.level || "N/A"}
        </p>


        <p>
            <strong>
                Duration:
            </strong>

            ${course.duration || "N/A"}
        </p>


        <p>
            <strong>
                Skills:
            </strong>

            ${skills}
        </p>


        <p>
            ${course.description || ""}
        </p>


        <p>
            <strong>
                Why:
            </strong>

            Recommended based on your learning profile.
        </p>

    `;


    recommendationContainer.appendChild(card);

});


// ======================================================
// DEBUG
// ======================================================

console.log(
    "PROFILE:",
    profileData
);

console.log(
    "BACKEND RESPONSE:",
    recommendationData
);

console.log(
    "SKILL GAPS:",
    skillGaps
);

console.log(
    "LEARNING PATH:",
    learningPath
);