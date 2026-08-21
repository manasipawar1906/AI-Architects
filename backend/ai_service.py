import os
from dotenv import load_dotenv
from groq import Groq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# GROQ CONFIGURATION
# =========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing. "
        "Please add it to your .env file."
    )


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================================
# MODEL
# =========================================================

MODEL_NAME = "openai/gpt-oss-20b"


# =========================================================
# SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are the AI Learning Assistant for My LearnPath AI.

Your role is to act as a personalized learning mentor.

You help students with:

1. Understanding concepts
2. Understanding their learning roadmap
3. Identifying skill gaps
4. Deciding what to learn next
5. Creating realistic study plans
6. Explaining recommended courses
7. Preparing for assessments
8. Suggesting projects
9. Improving learning strategies
10. Answering questions about their career goal

IMPORTANT RULES:

- Personalize your answer using the student's profile.
- Consider the student's current skills.
- Consider their experience level.
- Consider their interests.
- Consider their completed courses.
- Consider their current roadmap when it is provided.
- Do not invent courses and claim that they exist in the student's roadmap.
- If information is not available, clearly say that it is not available.
- Do not pretend that you have access to information that was not provided.
- Give practical and actionable advice.
- Explain technical concepts at the student's experience level.
- Prefer structured answers when useful.
- Keep responses reasonably concise unless the student asks for a detailed explanation.
- Be encouraging but do not make unrealistic promises.

FORMATTING RULES:

- Use Markdown formatting.
- Use ## or ### headings for sections.
- Use bullet lists for multiple points.
- Use numbered lists for sequential steps.
- Use Markdown tables only when a comparison is genuinely useful.
- Put each table row on its own line.
- Do not use HTML tags such as <br>.
- Do not put a table on the same line as a heading.
- Leave a blank line between sections.
- Keep answers easy to scan.

You are part of the My LearnPath AI application.
You are NOT a generic chatbot.
Your purpose is to help the student make progress toward their learning goal.
"""


# =========================================================
# BUILD STUDENT CONTEXT
# =========================================================

def build_student_context(
    profile,
    roadmap=None
):

    profile_data = {
        "name": profile.name,
        "email": profile.email,
        "goal": profile.goal,
        "experience": profile.experience,
        "skills": profile.skills,
        "interests": profile.interests,
        "completed_courses": profile.completed,
        "learning_style": profile.learning_style,
        "study_time": profile.study_time,
        "target_months": profile.target_months
    }


    context = f"""
STUDENT PROFILE
---------------

Name:
{profile_data["name"]}

Career Goal:
{profile_data["goal"]}

Experience Level:
{profile_data["experience"]}

Current Skills:
{", ".join(profile_data["skills"]) if profile_data["skills"] else "None provided"}

Interests:
{", ".join(profile_data["interests"]) if profile_data["interests"] else "None provided"}

Completed Courses:
{", ".join(profile_data["completed_courses"]) if profile_data["completed_courses"] else "None provided"}

Learning Style:
{profile_data["learning_style"]}

Available Study Time:
{profile_data["study_time"]}

Target Completion Time:
{profile_data["target_months"]} months
"""


    # =====================================================
    # ROADMAP CONTEXT
    # =====================================================

    if roadmap:

        context += """

CURRENT LEARNING ROADMAP
------------------------
"""

        context += f"""
Goal:
{roadmap.goal}

Readiness:
{roadmap.readiness_percentage}%

Skill Gaps:
{", ".join(roadmap.skill_gaps) if roadmap.skill_gaps else "None identified"}

Learning Path:
"""


        for index, course in enumerate(
            roadmap.learning_path,
            start=1
        ):

            context += f"""
{index}. {course.title}
   Level: {course.level}
   Duration: {course.duration}
   Skills: {", ".join(course.skills)}
   Description: {course.description}
   Project: {course.project}
   Mastery Before: {course.mastery_before}%
   Mastery Gain: {course.mastery_gain}%
   Mastery After: {course.mastery_after}%
"""


        if roadmap.projects:

            context += """

Suggested Projects:
"""

            for project in roadmap.projects:

                context += f"- {project}\n"


        if roadmap.assessments:

            context += """

Suggested Assessments:
"""

            for assessment in roadmap.assessments:

                context += f"- {assessment}\n"


    return context


# =========================================================
# ASK GROQ
# =========================================================

def ask_groq(
    question,
    profile,
    roadmap=None,
    history=None
):

    student_context = build_student_context(
        profile=profile,
        roadmap=roadmap
    )


    # =====================================================
    # BUILD MESSAGES
    # =====================================================

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]


    # =====================================================
    # PREVIOUS CONVERSATION
    # =====================================================

    if history:

        for message in history:

            if message.role not in {
                "user",
                "assistant"
            }:

                continue


            messages.append(
                {
                    "role": message.role,
                    "content": message.content
                }
            )


    # =====================================================
    # CURRENT QUESTION
    # =====================================================

    user_message = f"""
Here is the student's current learning context:

{student_context}

Now answer the student's question.

Student Question:
{question}
"""


    messages.append(
        {
            "role": "user",
            "content": user_message
        }
    )


    # =====================================================
    # CALL GROQ
    # =====================================================

    response = client.chat.completions.create(

        model=MODEL_NAME,

        messages=messages,

        temperature=0.4,

        max_completion_tokens=800,

        include_reasoning=False
    )


    # =====================================================
    # EXTRACT RESPONSE
    # =====================================================

    answer = response.choices[0].message.content


    if not answer:

        return (
            "I couldn't generate a response right now. "
            "Please try asking your question again."
        )


    return answer