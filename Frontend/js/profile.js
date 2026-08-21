// =========================================================
// LEARNPATH AI - PROFILE
// Multi-profile + Personalized Roadmap
// =========================================================

const API_URL = "http://127.0.0.1:8000/recommend";

const profileForm =
    document.getElementById("profileForm");


if (!profileForm) {

    console.error(
        "profileForm not found."
    );

} else {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =================================================
            // CREATE UNIQUE PROFILE ID
            // =================================================

            const profileId =
                "profile_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 8);


            // =================================================
            // COLLECT CURRENT FORM DATA
            // =================================================

            const profileData = {

                id:
                    profileId,

                name:
                    document
                        .getElementById("name")
                        .value
                        .trim(),

                email:
                    document
                        .getElementById("email")
                        .value
                        .trim(),

                goal:
                    document
                        .getElementById("career")
                        .value
                        .trim(),

                experience:
                    document
                        .getElementById("experience")
                        .value
                        .trim(),

                skills:
                    document
                        .getElementById("skills")
                        .value
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean),

                interests:
                    document
                        .getElementById("interests")
                        .value
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean),

                completed:
                    document
                        .getElementById("completed")
                        .value
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean),


                // ---------------------------------------------
                // IMPORTANT:
                // These names match schemas.py
                // ---------------------------------------------

                learning_style:
                    document
                        .getElementById(
                            "learningStyle"
                        )
                        .value
                        .trim(),

                study_time:
                    document
                        .getElementById("hours")
                        .value
                        .toString()
                        .trim(),

                target_months:
                    parseInt(
                        document
                            .getElementById("months")
                            .value,
                        10
                    ),


                // ---------------------------------------------
                // Backward compatibility
                // ---------------------------------------------

                learningStyle:
                    document
                        .getElementById(
                            "learningStyle"
                        )
                        .value
                        .trim(),

                months:
                    parseInt(
                        document
                            .getElementById("months")
                            .value,
                        10
                    ),


                recommendation:
                    null,

                createdAt:
                    new Date().toISOString()

            };


            // =================================================
            // VALIDATION
            // =================================================

            if (!profileData.name) {

                alert(
                    "Please enter your name."
                );

                return;
            }


            if (!profileData.email) {

                alert(
                    "Please enter your email."
                );

                return;
            }


            if (!profileData.goal) {

                alert(
                    "Please select a career goal."
                );

                return;
            }


            if (!profileData.study_time) {

                alert(
                    "Please enter your study hours."
                );

                return;
            }


            if (
                !Number.isInteger(
                    profileData.target_months
                ) ||
                profileData.target_months < 1
            ) {

                alert(
                    "Please enter a valid target duration."
                );

                return;
            }


            // =================================================
            // BUTTON
            // =================================================

            const btn =
                document.querySelector(
                    ".generate-btn"
                );


            const originalText =
                btn
                    ? btn.textContent
                    : "Generate Roadmap";


            if (btn) {

                btn.textContent =
                    "Generating your AI Roadmap...";

                btn.disabled = true;
            }


            // =================================================
            // CLEAR OLD CURRENT-SESSION ROADMAP
            // =================================================

            sessionStorage.removeItem(
                "learnPathRoadmap"
            );

            sessionStorage.removeItem(
                "lastProfile"
            );


            // =================================================
            // SAVE CURRENT PROFILE
            // =================================================

            sessionStorage.setItem(
                "learnPathProfile",
                JSON.stringify(
                    profileData
                )
            );


            console.log(
                "================================"
            );

            console.log(
                "CREATING NEW PROFILE"
            );

            console.log(
                profileData
            );

            console.log(
                "================================"
            );


            // =================================================
            // SEND TO BACKEND
            // =================================================

            try {

                const response =
                    await fetch(
                        API_URL,
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
                        `Server returned status ${response.status}`;


                    try {

                        const errorData =
                            await response.json();


                        if (
                            errorData &&
                            errorData.detail
                        ) {

                            message =
                                typeof errorData.detail ===
                                "string"

                                    ? errorData.detail

                                    : JSON.stringify(
                                        errorData.detail,
                                        null,
                                        2
                                    );
                        }

                    } catch (parseError) {

                        console.error(
                            "Could not parse backend error:",
                            parseError
                        );
                    }


                    throw new Error(
                        message
                    );
                }


                // =================================================
                // RECEIVE ROADMAP
                // =================================================

                const roadmapData =
                    await response.json();


                console.log(
                    "================================"
                );

                console.log(
                    "ROADMAP RECEIVED"
                );

                console.log(
                    roadmapData
                );

                console.log(
                    "================================"
                );


                // =================================================
                // ATTACH RECOMMENDATION TO THIS PROFILE
                // =================================================

                profileData.recommendation =
                    roadmapData;

                profileData.recommendationUpdatedAt =
                    new Date().toISOString();


                // =================================================
                // GET EXISTING PROFILES
                // =================================================

                let profiles = [];


                try {

                    const stored =
                        localStorage.getItem(
                            "learnPathProfiles"
                        );


                    if (stored) {

                        const parsed =
                            JSON.parse(
                                stored
                            );


                        if (
                            Array.isArray(
                                parsed
                            )
                        ) {

                            profiles =
                                parsed;
                        }
                    }

                } catch (error) {

                    console.warn(
                        "Could not read existing profiles.",
                        error
                    );

                    profiles = [];
                }


                // =================================================
                // ADD THIS PROFILE
                // =================================================

                profiles.push(
                    profileData
                );


                // =================================================
                // SAVE ALL PROFILES
                // =================================================

                localStorage.setItem(
                    "learnPathProfiles",
                    JSON.stringify(
                        profiles
                    )
                );


                // =================================================
                // SELECT THIS PROFILE
                // =================================================

                localStorage.setItem(
                    "selectedProfileId",
                    profileId
                );


                // =================================================
                // BACKWARD COMPATIBILITY
                // =================================================

                localStorage.setItem(
                    "learnPathProfile",
                    JSON.stringify(
                        profileData
                    )
                );


                localStorage.setItem(
                    "recommendation",
                    JSON.stringify(
                        roadmapData
                    )
                );


                localStorage.setItem(
                    "recommendationUpdatedAt",
                    new Date().toISOString()
                );


                // =================================================
                // SESSION STORAGE
                // =================================================

                sessionStorage.setItem(
                    "learnPathProfile",
                    JSON.stringify(
                        profileData
                    )
                );


                sessionStorage.setItem(
                    "learnPathRoadmap",
                    JSON.stringify(
                        roadmapData
                    )
                );


                sessionStorage.setItem(
                    "lastProfile",
                    JSON.stringify(
                        profileData
                    )
                );


                console.log(
                    "Profile saved successfully:",
                    profileId
                );


                // =================================================
                // GO TO ROADMAP
                // =================================================

                window.location.href =
                    "roadmap.html";


            } catch (error) {

                console.error(
                    "ROADMAP GENERATION ERROR:",
                    error
                );


                alert(
                    "Failed to generate the roadmap.\n\n" +
                    error.message
                );


                if (btn) {

                    btn.textContent =
                        originalText;

                    btn.disabled = false;
                }
            }
        }
    );
}