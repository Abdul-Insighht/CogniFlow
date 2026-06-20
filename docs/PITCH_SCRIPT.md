# 3-5 Minute Pitch Script

## Opening

Students today are not failing because they lack information. They are overloaded by it. A university student may have six courses, assignments, exams, family responsibilities, part-time work, and career anxiety at the same time. Existing tools store tasks or answer questions, but they do not understand whether the student is calm, stressed, or overwhelmed.

CogniFlow solves this decision problem.

## Solution

CogniFlow is an emotionally aware second brain. A student enters tasks, notes, deadlines, and a short check-in. The system analyzes their language and workload, detects their cognitive state, retrieves relevant notes, and creates an adaptive plan.

If the student is overwhelmed, CogniFlow collapses the day into only the most critical next actions. If the student is focused, it recommends deeper work. The goal is not to add another productivity dashboard. The goal is to help the student decide what to do next.

## Demo

In the demo, I load a sample student scenario: a database quiz tomorrow, an AI assignment tonight, and a family event. The student says they feel overwhelmed and have weak coverage in normalization.

CogniFlow detects high cognitive load, shows the signals behind that result, retrieves the relevant DBMS note, and recommends a small plan: start with normalization, complete one part of the AI assignment, use the saved memory note, and hide low-priority work until the critical tasks are done.

The student can accept, edit, or reject the plan. This is important because CogniFlow is decision support, not an authority.

## Architecture

The architecture has three layers.

First, the memory engine stores tasks and notes locally. In this prototype, retrieval uses local term similarity. In production, this can become an embedding-based RAG system.

Second, the cognitive state detector uses natural language and workload signals to classify the student as focused, neutral, stressed, or overwhelmed.

Third, the adaptive action engine ranks tasks by priority, urgency, and effort, then reshapes the plan based on the detected state.

## Responsible AI

The biggest risk is privacy. Student notes and emotional signals are sensitive. This demo stores data locally in the browser and uses no cloud database. The system also shows its detected signals and confidence, avoids diagnosis, and keeps the student in control.

CogniFlow does not replace therapy, teachers, or human judgment. It helps students organize workload decisions when they are overloaded.

## Closing

CogniFlow is the world's first emotionally intelligent second brain for students. It does not just remember what you need to do. It understands how overloaded you are and helps you choose the next step you can actually take.

