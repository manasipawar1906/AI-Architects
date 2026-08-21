// ============================================================
// LEARNPATH AI - PROFILE
// Multiple Learning Profiles / Entries
// ============================================================

const API_URL = "http://127.0.0.1:8000/recommend";


// ============================================================
// FORM SUBMISSION
// ============================================================

document
    .getElementById("profileForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        // ------------------------------------------------------
        // Create a unique ID for this entry
        // ------------------------------------------------------

        const profileId =
            "profile_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8);


        // ------------------------------------------------------
        // Gather form data
        // ------------------------------------------------------

        const profileData = {

            id: profileId,

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
                    .value,

            experience:
                document
                    .getElementById("experience")
                    .value,

            skills:
                document
                    .getElementById("skills")
                    .value
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean),

            interests:
                document
                    .getElementById("interests")
                    .value
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean),

            completed:
                document
                    .getElementById("completed")
                    .value
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean),

            learningStyle:
                document
                    .getElementById("learningStyle")
                    .value,

            study_time:
                document
                    .getElementById("hours")
                    .value
                    .toString()
                    .trim(),

            months:
                parseInt(
                    document
                        .getElementById("months")
                        .value,
                    10
                ),

            recommendation: null,

            createdAt:
                new Date().toISOString()
        };


        console.log(
            "Creating new learning entry:",
            profileData
        );


        // ------------------------------------------------------
        // Button state
        // ------------------------------------------------------

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


        // ======================================================
        // SEND PROFILE TO FASTAPI
        // ======================================================

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

                const errorText =
                    await response.text();

                throw new Error(
                    `Server returned ${response.status}: ${errorText}`
                );
            }


            // --------------------------------------------------
            // Receive ML recommendation
            // --------------------------------------------------

            const roadmapData =
                await response.json();


            console.log(
                "ML recommendation received:",
                roadmapData
            );


            // --------------------------------------------------
            // Attach recommendation to THIS profile
            // --------------------------------------------------

            profileData.recommendation =
                roadmapData;


            // ==================================================
            // GET EXISTING PROFILES
            // ==================================================

            let profiles = [];


            try {

                const stored =
                    localStorage.getItem(
                        "learnPathProfiles"
                    );


                if (stored) {

                    const parsed =
                        JSON.parse(stored);


                    if (
                        Array.isArray(parsed)
                    ) {

                        profiles = parsed;
                    }
                }

            } catch (error) {

                console.warn(
                    "Could not read existing profiles.",
                    error
                );

                profiles = [];
            }


            // ==================================================
            // ADD THIS NEW PROFILE
            // ==================================================

            profiles.push(
                profileData
            );


            // ==================================================
            // SAVE ALL PROFILES
            // ==================================================

            localStorage.setItem(
                "learnPathProfiles",
                JSON.stringify(profiles)
            );


            // ==================================================
            // SELECT THIS PROFILE
            // ==================================================

            localStorage.setItem(
                "selectedProfileId",
                profileId
            );


            // ==================================================
            // BACKWARD COMPATIBILITY
            // ==================================================
            //
            // These keys are kept temporarily because other
            // parts of the old project may still reference them.
            //
            // The NEW source of truth is learnPathProfiles.
            //

            localStorage.setItem(
                "learnPathProfile",
                JSON.stringify(profileData)
            );


            localStorage.setItem(
                "recommendation",
                JSON.stringify(roadmapData)
            );


            localStorage.setItem(
                "recommendationUpdatedAt",
                new Date().toISOString()
            );


            console.log(
                "Profile saved successfully:",
                profileId
            );


            // --------------------------------------------------
            // Go to roadmap
            // --------------------------------------------------

            window.location.href =
                "roadmap.html";


        } catch (error) {

            console.error(
                "Error generating roadmap:",
                error
            );


            alert(
                "Failed to connect to the backend. Make sure your Python server is running."
            );


            if (btn) {

                btn.textContent =
                    originalText;

                btn.disabled = false;
            }
        }
    });