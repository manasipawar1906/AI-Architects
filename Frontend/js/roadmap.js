const courses = [

    {
        title: "Python Programming Fundamentals",
        level: "BEGINNER",
        hours: 15,
        skills: "Python",
        prerequisites: "None",
        project: "Build a CLI expense tracker"
    },

    {
        title: "Statistics for Data Science",
        level: "BEGINNER",
        hours: 15,
        skills: "Statistics",
        prerequisites: "Python",
        project: "Analyze a real-world dataset statistically"
    },

    {
        title: "Machine Learning Fundamentals",
        level: "INTERMEDIATE",
        hours: 25,
        skills: "Machine Learning",
        prerequisites: "Python, Statistics, Pandas",
        project: "House price prediction"
    },

    {
        title: "Deep Learning with Neural Networks",
        level: "ADVANCED",
        hours: 30,
        skills: "Deep Learning",
        prerequisites: "Machine Learning, Python",
        project: "Build a neural network classifier"
    },

    {
        title: "Natural Language Processing",
        level: "ADVANCED",
        hours: 25,
        skills: "NLP",
        prerequisites: "Machine Learning",
        project: "Build a sentiment classifier"
    },

    {
        title: "Transformers and Modern NLP",
        level: "ADVANCED",
        hours: 28,
        skills: "Transformers",
        prerequisites: "NLP, Deep Learning",
        project: "Build a document Q&A prototype"
    },

    {
        title: "NumPy for Data Science",
        level: "BEGINNER",
        hours: 8,
        skills: "NumPy",
        prerequisites: "Python",
        project: "Analyze a numerical dataset"
    },

    {
        title: "Machine Learning Model Evaluation",
        level: "INTERMEDIATE",
        hours: 10,
        skills: "Model Evaluation",
        prerequisites: "Machine Learning",
        project: "Compare multiple classifiers"
    },

    {
        title: "Flask API Development",
        level: "INTERMEDIATE",
        hours: 12,
        skills: "Flask",
        prerequisites: "Python",
        project: "Deploy an ML prediction API"
    },

    {
        title: "Generative AI Fundamentals",
        level: "INTERMEDIATE",
        hours: 15,
        skills: "Generative AI",
        prerequisites: "Python",
        project: "Build a document assistant"
    }

];


const roadmapContainer =
    document.getElementById(
        "roadmapContainer"
    );


courses.forEach(
    (course, index) => {

        const step =
            document.createElement("div");

        step.className =
            "roadmap-step";


        step.innerHTML = `

            <div class="step-number">
                ${index + 1}
            </div>


            <div class="course-card">

                <div class="course-top">

                    <span class="level">
                        ${course.level}
                    </span>

                    <span class="hours">
                        ${course.hours}h
                    </span>

                </div>


                <h3>
                    ${course.title}
                </h3>


                <div class="course-info">

                    <p>
                        <strong>Skills:</strong>
                        ${course.skills}
                    </p>

                    <p>
                        <strong>Prerequisites:</strong>
                        ${course.prerequisites}
                    </p>

                    <p>
                        <strong>Project:</strong>
                        ${course.project}
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
                        onclick="giveFeedback('${course.title}')"
                    >
                        Give Feedback
                    </button>

                </div>

            </div>

        `;


        roadmapContainer.appendChild(step);

    }
);


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


/* ================= RECOMMENDATIONS ================= */

const recommendations = [

    {
        title: "Machine Learning Fundamentals",
        score: "65.3%",
        description:
            "Learn supervised and unsupervised learning, training and prediction."
    },

    {
        title: "Python Programming Fundamentals",
        score: "56.7%",
        description:
            "Learn Python syntax, functions, collections, OOP and problem solving."
    },

    {
        title: "Natural Language Processing",
        score: "49.2%",
        description:
            "Learn text preprocessing, embeddings, classification and NLP pipelines."
    },

    {
        title: "Transformers and Modern NLP",
        score: "48.4%",
        description:
            "Understand attention, transformers and modern language-model workflows."
    },

    {
        title: "Deep Learning with Neural Networks",
        score: "48.1%",
        description:
            "Understand perceptrons, backpropagation, optimizers and neural networks."
    },

    {
        title: "NumPy for Data Science",
        score: "34.7%",
        description:
            "Learn arrays, vectorization and numerical operations."
    },

    {
        title: "Statistics for Data Science",
        score: "33.2%",
        description:
            "Learn probability, distributions, hypothesis testing and regression."
    },

    {
        title: "Machine Learning Model Evaluation",
        score: "31.2%",
        description:
            "Learn cross-validation, precision, recall, F1 and ROC-AUC."
    },

    {
        title: "Flask API Development",
        score: "30.6%",
        description:
            "Build REST APIs and serve machine learning models."
    },

    {
        title: "Generative AI Fundamentals",
        score: "28.1%",
        description:
            "Learn LLM concepts, prompting, embeddings and AI application patterns."
    },

    {
        title: "Pandas for Data Analysis",
        score: "27.5%",
        description:
            "Clean, transform, analyze and visualize tabular data."
    },

    {
        title: "Data Visualization with Python",
        score: "25.5%",
        description:
            "Create meaningful visualizations using Python."
    }

];


const recommendationContainer =
    document.getElementById(
        "recommendationContainer"
    );


recommendations.forEach(item => {

    const card =
        document.createElement("div");

    card.className =
        "recommendation-card";


    card.innerHTML = `

        <span class="recommendation-score">
            ${item.score}
        </span>

        <h3>
            ${item.title}
        </h3>

        <p>
            ${item.description}
        </p>

        <p>
            <strong>
                Why:
            </strong>
            fits your learning profile
        </p>

    `;


    recommendationContainer.appendChild(card);

});