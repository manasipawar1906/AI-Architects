const profileForm =
    document.getElementById("profileForm");


profileForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const profileData = {

            name:
                document.getElementById("name").value,

            email:
                document.getElementById("email").value,

            career:
                document.getElementById("career").value,

            experience:
                document.getElementById("experience").value,

            skills:
                document.getElementById("skills")
                    .value
                    .split(",")
                    .map(x => x.trim()),

            interests:
                document.getElementById("interests")
                    .value
                    .split(",")
                    .map(x => x.trim()),

            completed:
                document.getElementById("completed")
                    .value
                    .split(",")
                    .map(x => x.trim()),

            learningStyle:
                document.getElementById("learningStyle")
                    .value,

            hours:
                Number(
                    document.getElementById("hours").value
                ),

            months:
                Number(
                    document.getElementById("months").value
                )

        };


        /*
            Temporary frontend storage.

            Later your team can replace this
            with a POST API request.
        */

        localStorage.setItem(
            "learnPathProfile",
            JSON.stringify(profileData)
        );


        window.location.href =
            "roadmap.html";

    }
);