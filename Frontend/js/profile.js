// =========================================================
// LEARNPATH AI - PROFILE
// =========================================================

const API_URL = "http://127.0.0.1:8000/recommend";

const profileForm = document.getElementById("profileForm");

if (!profileForm) {
    console.error("profileForm not found.");
} else {

    profileForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // -----------------------------------------------------
        // COLLECT CURRENT FORM DATA
        // -----------------------------------------------------

        const profileData = {
            name: document.getElementById("name").value.trim(),

            email: document.getElementById("email").value.trim(),

            goal: document.getElementById("career").value.trim(),

            experience: document.getElementById("experience").value.trim(),

            skills: document
                .getElementById("skills")
                .value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),

            interests: document
                .getElementById("interests")
                .value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),

            completed: document
                .getElementById("completed")
                .value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),

            // Match backend schema exactly
            learning_style:
                document.getElementById("learningStyle").value.trim(),

            study_time:
                document.getElementById("hours").value
                    .toString()
                    .trim(),

            target_months:
                parseInt(
                    document.getElementById("months").value,
                    10
                )
        };

        // -----------------------------------------------------
        // VALIDATE
        // -----------------------------------------------------

        if (!profileData.name) {
            alert("Please enter your name.");
            return;
        }

        if (!profileData.email) {
            alert("Please enter your email.");
            return;
        }

        if (!profileData.goal) {
            alert("Please select a career goal.");
            return;
        }

        if (!profileData.study_time) {
            alert("Please enter your study hours per week.");
            return;
        }

        if (
            !Number.isInteger(profileData.target_months) ||
            profileData.target_months < 1
        ) {
            alert("Please enter a valid target duration.");
            return;
        }

        // -----------------------------------------------------
        // CLEAR OLD SESSION DATA
        // -----------------------------------------------------

        sessionStorage.removeItem("learnPathRoadmap");
        sessionStorage.removeItem("lastProfile");

        // Save the CURRENT profile immediately
        sessionStorage.setItem(
            "learnPathProfile",
            JSON.stringify(profileData)
        );

        console.log("=================================");
        console.log("NEW PROFILE SAVED");
        console.log(profileData);
        console.log("=================================");

        // -----------------------------------------------------
        // BUTTON
        // -----------------------------------------------------

        const btn =
            document.querySelector(".generate-btn");

        const originalText =
            btn
                ? btn.textContent
                : "Generate Personalized Roadmap →";

        if (btn) {
            btn.textContent =
                "Generating your AI Roadmap...";

            btn.disabled = true;
        }

        // -----------------------------------------------------
        // CALL BACKEND
        // -----------------------------------------------------

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

            console.log(
                "Backend response status:",
                response.status
            );

            if (!response.ok) {

                let errorMessage =
                    `Server returned status ${response.status}`;

                try {

                    const errorData =
                        await response.json();

                    if (errorData?.detail) {

                        errorMessage =
                            typeof errorData.detail === "string"
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
                    errorMessage
                );
            }

            const roadmapData =
                await response.json();

            console.log(
                "================================="
            );

            console.log(
                "NEW ROADMAP RECEIVED"
            );

            console.log(
                roadmapData
            );

            console.log(
                "================================="
            );

            // -------------------------------------------------
            // SAVE ONLY THIS PROFILE'S ROADMAP
            // -------------------------------------------------

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

            // Keep legacy completion cache isolated
            localStorage.setItem(
                "recommendation",
                JSON.stringify(
                    roadmapData
                )
            );

            // -------------------------------------------------
            // REDIRECT
            // -------------------------------------------------

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
    });
}