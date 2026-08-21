// =========================================================
// MY LEARNPATH AI - GROQ ASSISTANT
// =========================================================


// =========================================================
// BACKEND CONFIGURATION
// =========================================================

const BACKEND_URL = "http://127.0.0.1:8000";


// =========================================================
// DOM ELEMENTS
// =========================================================

const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const messages =
    document.getElementById("messages");


// =========================================================
// CONVERSATION HISTORY
// =========================================================

let conversationHistory = [];


// =========================================================
// STORAGE HELPER
// =========================================================

function getStoredData(key) {

    let data = null;


    // -----------------------------------------------------
    // Try sessionStorage first
    // -----------------------------------------------------

    try {

        const sessionData =
            sessionStorage.getItem(key);

        if (sessionData) {

            data = JSON.parse(
                sessionData
            );

            return data;
        }

    } catch (error) {

        console.warn(
            `Could not read ${key} from sessionStorage`,
            error
        );

    }


    // -----------------------------------------------------
    // Try localStorage
    // -----------------------------------------------------

    try {

        const localData =
            localStorage.getItem(key);

        if (localData) {

            data = JSON.parse(
                localData
            );

            return data;
        }

    } catch (error) {

        console.warn(
            `Could not read ${key} from localStorage`,
            error
        );

    }


    return null;
}


// =========================================================
// GET STUDENT PROFILE
// =========================================================

function getStudentProfile() {

    const profile =
        getStoredData(
            "learnPathProfile"
        );


    if (!profile) {

        return {
            name: "",
            email: "",
            goal: "",
            experience: "Beginner",
            skills: [],
            interests: [],
            completed: [],
            learning_style: "Mixed",
            study_time: "4",
            target_months: 6
        };

    }


    return {

        name:
            profile.name || "",

        email:
            profile.email || "",

        goal:
            profile.goal || "",

        experience:
            profile.experience || "Beginner",

        skills:
            Array.isArray(profile.skills)
                ? profile.skills
                : [],

        interests:
            Array.isArray(profile.interests)
                ? profile.interests
                : [],

        completed:
            Array.isArray(profile.completed)
                ? profile.completed
                : [],

        learning_style:
            profile.learning_style ||
            "Mixed",

        study_time:
            profile.study_time ||
            "4",

        target_months:
            Number(
                profile.target_months || 6
            )

    };

}


// =========================================================
// GET CURRENT ROADMAP
// =========================================================

function getCurrentRoadmap() {

    const roadmap =
        getStoredData(
            "recommendation"
        );


    if (!roadmap) {

        return null;

    }


    return roadmap;

}


// =========================================================
// FORM SUBMISSION
// =========================================================

chatForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const text =
            chatInput.value.trim();


        if (!text) {

            return;

        }


        // -------------------------------------------------
        // Display user message
        // -------------------------------------------------

        addMessage(
            text,
            "user"
        );


        // -------------------------------------------------
        // Clear input
        // -------------------------------------------------

        chatInput.value = "";


        // -------------------------------------------------
        // Disable input while processing
        // -------------------------------------------------

        setChatEnabled(false);


        // -------------------------------------------------
        // Show typing message
        // -------------------------------------------------

        const typingMessage =
            addMessage(
                "Thinking...",
                "ai"
            );


        try {

            // ---------------------------------------------
            // GET USER DATA
            // ---------------------------------------------

            const profile =
                getStudentProfile();


            const roadmap =
                getCurrentRoadmap();


            // ---------------------------------------------
            // SEND REQUEST TO FASTAPI
            // ---------------------------------------------

            const response =
                await fetch(
                    `${BACKEND_URL}/chat`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question: text,

                            profile: profile,

                            roadmap: roadmap,

                            history:
                                conversationHistory

                        })

                    }
                );


            // ---------------------------------------------
            // HANDLE HTTP ERROR
            // ---------------------------------------------

            if (!response.ok) {

                let errorMessage =
                    "The AI Assistant could not respond.";

                try {

                    const errorData =
                        await response.json();

                    if (errorData.detail) {

                        errorMessage =
                            errorData.detail;

                    }

                } catch (error) {

                    console.warn(
                        "Could not read backend error.",
                        error
                    );

                }


                throw new Error(
                    errorMessage
                );

            }


            // ---------------------------------------------
            // READ RESPONSE
            // ---------------------------------------------

            const data =
                await response.json();


            const answer =
                data.answer ||
                "I couldn't generate a response.";


            // ---------------------------------------------
            // Replace typing message
            // ---------------------------------------------

            typingMessage.innerHTML =
            formatAIResponse(answer);


            // ---------------------------------------------
            // SAVE CONVERSATION
            // ---------------------------------------------

            conversationHistory.push({

                role: "user",

                content: text

            });


            conversationHistory.push({

                role: "assistant",

                content: answer

            });


            // ---------------------------------------------
            // Keep history manageable
            // ---------------------------------------------

            if (
                conversationHistory.length > 10
            ) {

                conversationHistory =
                    conversationHistory.slice(-10);

            }


        } catch (error) {

            console.error(
                "AI Assistant Error:",
                error
            );


            typingMessage.textContent =
                "Sorry, I couldn't connect to the AI Assistant. " +
                "Please make sure the FastAPI backend is running and try again.";

        } finally {

            setChatEnabled(true);

            chatInput.focus();

        }

    }
);


// =========================================================
// ADD MESSAGE TO CHAT
// =========================================================

function addMessage(
    text,
    type
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${type}`;


    message.textContent =
        text;


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;


    return message;

}


// =========================================================
// ENABLE / DISABLE CHAT
// =========================================================

function setChatEnabled(enabled) {

    chatInput.disabled =
        !enabled;

    const sendButton =
        chatForm.querySelector(
            "button"
        );


    if (sendButton) {

        sendButton.disabled =
            !enabled;

    }

}

// =========================================================
// FORMAT AI MARKDOWN RESPONSE
// =========================================================

function formatAIResponse(text) {

    if (!text) {
        return "";
    }


    // -----------------------------------------------------
    // Convert HTML line breaks returned by the AI
    // -----------------------------------------------------

    text = text.replace(
        /<br\s*\/?>/gi,
        "\n"
    );


    // -----------------------------------------------------
    // Escape HTML first for security
    // -----------------------------------------------------

    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    // -----------------------------------------------------
    // Code blocks
    // -----------------------------------------------------

    const codeBlocks = [];

    text = text.replace(
        /```([\s\S]*?)```/g,
        function(match, code) {

            const index =
                codeBlocks.length;

            codeBlocks.push(
                code.trim()
            );

            return `@@CODEBLOCK${index}@@`;

        }
    );


    // -----------------------------------------------------
    // Tables
    // -----------------------------------------------------

    const lines =
        text.split("\n");

    const output = [];

    let i = 0;


    while (i < lines.length) {

        const currentLine =
            lines[i].trim();


        // -------------------------------------------------
        // Detect markdown table
        // -------------------------------------------------

        if (
            currentLine.includes("|") &&
            i + 1 < lines.length &&
            isMarkdownSeparator(
                lines[i + 1]
            )
        ) {

            const tableLines = [];

            tableLines.push(
                currentLine
            );

            i += 2;


            while (
                i < lines.length &&
                lines[i].includes("|")
            ) {

                tableLines.push(
                    lines[i].trim()
                );

                i++;

            }


            output.push(
                convertTable(
                    tableLines
                )
            );

            continue;

        }


        output.push(
            lines[i]
        );

        i++;

    }


    text =
        output.join("\n");


    // -----------------------------------------------------
    // Headings
    // -----------------------------------------------------

    text = text.replace(
        /^### (.+)$/gm,
        "<h3>$1</h3>"
    );

    text = text.replace(
        /^## (.+)$/gm,
        "<h2>$1</h2>"
    );

    text = text.replace(
        /^# (.+)$/gm,
        "<h1>$1</h1>"
    );


    // -----------------------------------------------------
    // Horizontal rules
    // -----------------------------------------------------

    text = text.replace(
        /^---+$/gm,
        "<hr>"
    );


    // -----------------------------------------------------
    // Bold
    // -----------------------------------------------------

    text = text.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );


    // -----------------------------------------------------
    // Italic
    // -----------------------------------------------------

    text = text.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    // -----------------------------------------------------
    // Inline code
    // -----------------------------------------------------

    text = text.replace(
        /`([^`\n]+)`/g,
        "<code>$1</code>"
    );


    // -----------------------------------------------------
    // Numbered lists
    // -----------------------------------------------------

    text = text.replace(
        /^\s*(\d+)\.\s+(.+)$/gm,
        "<li>$2</li>"
    );


    // -----------------------------------------------------
    // Bullet lists
    // -----------------------------------------------------

    text = text.replace(
        /^\s*[-*]\s+(.+)$/gm,
        "<li>$1</li>"
    );


    // -----------------------------------------------------
    // Wrap consecutive list items
    // -----------------------------------------------------

    text = text.replace(
        /(<li>.*?<\/li>\n?)+/g,
        function(match) {

            const items =
                match
                    .trim();

            return `<ul>${items}</ul>`;

        }
    );


    // -----------------------------------------------------
    // Restore code blocks
    // -----------------------------------------------------

    text = text.replace(
        /@@CODEBLOCK(\d+)@@/g,
        function(match, index) {

            return `
                <pre class="ai-code">
                    <code>${escapeHTML(
                        codeBlocks[index]
                    )}</code>
                </pre>
            `;

        }
    );


    // -----------------------------------------------------
    // Convert remaining line breaks
    // -----------------------------------------------------

    text = text.replace(
        /\n{2,}/g,
        "<br><br>"
    );

    text = text.replace(
        /\n/g,
        "<br>"
    );


    // -----------------------------------------------------
    // Clean up breaks around block elements
    // -----------------------------------------------------

    text = text.replace(
        /<br>\s*<(h[1-3]|ul|pre|hr|table)/g,
        "<$1"
    );

    text = text.replace(
        /(<\/(h[1-3]|ul|pre|table)>)\s*<br>/g,
        "$1"
    );

    text = text.replace(
        /<br>\s*<hr>/g,
        "<hr>"
    );


    return text;
}


// =========================================================
// CHECK MARKDOWN TABLE SEPARATOR
// =========================================================

function isMarkdownSeparator(line) {

    const cells =
        line
            .split("|")
            .map(
                cell =>
                    cell.trim()
            )
            .filter(
                cell =>
                    cell.length > 0
            );


    if (cells.length === 0) {
        return false;
    }


    return cells.every(
        cell =>
            /^:?-{3,}:?$/.test(
                cell
            )
    );

}


// =========================================================
// CONVERT MARKDOWN TABLE TO HTML
// =========================================================

function convertTable(lines) {

    if (lines.length < 2) {
        return "";
    }


    const headers =
        parseTableRow(
            lines[0]
        );


    let html =
        '<div class="ai-table-wrapper">';

    html += "<table>";

    html += "<thead>";

    html += "<tr>";


    headers.forEach(
        header => {

            html +=
                `<th>${header}</th>`;

        }
    );


    html += "</tr>";

    html += "</thead>";

    html += "<tbody>";


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const cells =
            parseTableRow(
                lines[i]
            );


        if (
            cells.length === 0
        ) {
            continue;
        }


        html += "<tr>";


        cells.forEach(
            cell => {

                html +=
                    `<td>${cell}</td>`;

            }
        );


        html += "</tr>";

    }


    html += "</tbody>";

    html += "</table>";

    html += "</div>";


    return html;

}


// =========================================================
// PARSE TABLE ROW
// =========================================================

function parseTableRow(line) {

    return line
        .split("|")
        .map(
            cell =>
                cell.trim()
        )
        .filter(
            (cell, index, array) => {

                if (
                    index === 0 &&
                    cell === ""
                ) {
                    return false;
                }

                if (
                    index ===
                        array.length - 1 &&
                    cell === ""
                ) {
                    return false;
                }

                return true;

            }
        );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}