const chatForm =
    document.getElementById("chatForm");


const chatInput =
    document.getElementById("chatInput");


const messages =
    document.getElementById("messages");


chatForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const text =
            chatInput.value.trim();


        if (!text) return;


        addMessage(
            text,
            "user"
        );


        chatInput.value = "";


        setTimeout(
            () => {

                const response =
                    getAIResponse(text);


                addMessage(
                    response,
                    "ai"
                );

            },
            600
        );

    }
);


function addMessage(
    text,
    type
) {

    const message =
        document.createElement("div");


    message.className =
        `message ${type}`;


    message.textContent =
        text;


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;

}


function getAIResponse(question) {

    const text =
        question.toLowerCase();


    if (
        text.includes("machine learning") ||
        text.includes("ml")
    ) {

        return `
        Machine Learning is placed early in your
        roadmap because it is an important
        prerequisite for Deep Learning and NLP.
        `;

    }


    if (
        text.includes("skill gap") ||
        text.includes("skills")
    ) {

        return `
        Your current skill gap includes Machine
        Learning, Deep Learning and Transformers.
        Python and NLP are already part of your
        existing skill set.
        `;

    }


    if (
        text.includes("transformer")
    ) {

        return `
        Transformers are recommended after NLP
        and Deep Learning because understanding
        those concepts makes attention mechanisms
        and modern language models easier to learn.
        `;

    }


    return `
    I can help you understand your roadmap,
    skill gaps, recommended courses and study plan.
    Try asking me about Machine Learning,
    Transformers or your skill gap.
    `;

}