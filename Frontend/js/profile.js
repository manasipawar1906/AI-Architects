const profileForm = document.getElementById("profileForm");

profileForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const profileData = {

        name: document.getElementById("name").value,

        goal: document.getElementById("career").value,

        experience: document.getElementById("experience").value,

        study_time:
            document.getElementById("hours").value +
            " hours/day for " +
            document.getElementById("months").value +
            " months",

        interests:
            document.getElementById("interests")
                .value
                .split(",")
                .map(x => x.trim())
                .filter(x => x !== ""),

        skills:
            document.getElementById("skills")
                .value
                .split(",")
                .map(x => x.trim())
                .filter(x => x !== ""),

        previous_courses:
            document.getElementById("completed").value,

        learning_style:
            document.getElementById("learningStyle").value
    };

    console.log("Sending profile to backend:", profileData);

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/recommend",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(profileData)
            }
        );

        if (!response.ok) {
            throw new Error(
                "Backend returned status " + response.status
            );
        }

        const result = await response.json();

        console.log("Backend response:", result);

        // Save profile
        localStorage.setItem(
            "learnPathProfile",
            JSON.stringify(profileData)
        );

        // Save recommendation returned by backend
        localStorage.setItem(
            "recommendation",
            JSON.stringify(result)
        );

        // Go to roadmap
        window.location.href = "roadmap.html";

    } catch (error) {

        console.error("Backend connection error:", error);

        alert(
            "Could not connect to the backend. " +
            "Make sure FastAPI is running on port 8000."
        );
    }
});