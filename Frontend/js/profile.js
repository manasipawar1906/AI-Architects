// Pointing to your local FastAPI server
const API_URL = "http://127.0.0.1:8000/recommend";

document.getElementById("profileForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Stop page from reloading

    // 1. Gather all the data from the form
    const profileData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        goal: document.getElementById("career").value, 
        experience: document.getElementById("experience").value,
        
        skills: document.getElementById("skills").value.split(',').map(item => item.trim()).filter(item => item),
        interests: document.getElementById("interests").value.split(',').map(item => item.trim()).filter(item => item),
        completed: document.getElementById("completed").value.split(',').map(item => item.trim()).filter(item => item),
        
        learningStyle: document.getElementById("learningStyle").value,
        
        // FORCED AS A STRING TO MATCH BACKEND MODEL
        study_time: document.getElementById("hours").value.toString().trim(),
        
        months: parseInt(document.getElementById("months").value)
    };

    // 2. Save profile to the current session
    sessionStorage.setItem("learnPathProfile", JSON.stringify(profileData));

    // 3. Update button state
    const btn = document.querySelector(".generate-btn");
    const originalText = btn.textContent;
    btn.textContent = "Generating your AI Roadmap...";
    btn.disabled = true;

    try {
        // 4. Send data to Python backend
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const roadmapData = await response.json();

        // 5. Save roadmap and redirect to the clean UI roadmap page
        sessionStorage.setItem("learnPathRoadmap", JSON.stringify(roadmapData));
        window.location.href = "roadmap.html";

    } catch (error) {
        console.error("Error generating roadmap:", error);
        alert("Failed to connect to the backend. Make sure your Python server is running.");
        
        btn.textContent = originalText;
        btn.disabled = false;
    }
});