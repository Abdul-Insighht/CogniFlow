# CogniFlow Submission Answers

## Project Description

CogniFlow is an AI-powered second brain for university students facing academic overload. Students enter notes, tasks, deadlines, and a short check-in. The system detects whether they appear focused, neutral, stressed, or overwhelmed, retrieves relevant saved notes, and recommends an adaptive daily plan. The student can accept, edit, or reject the plan.

## Track And Challenge Selection

Recommended track: AI assistant or decision-support tool.

Recommended challenge framing: Responsible AI for student productivity, cognitive overload, and education access.

## Problem Understanding

Students do not only need more information. They need help deciding what to do next when overloaded. The decision context includes deadlines, task effort, academic importance, mental state, privacy, low-resource devices, and limited access to coaching or therapy.

## AI And Analytics Reasoning

CogniFlow uses natural language processing to analyze check-ins and pattern detection to estimate cognitive state. It then uses retrieval over stored notes and task scoring to recommend the next actions. The analytics matter because the same task list produces different plans depending on whether the student is focused, stressed, or overwhelmed.

## Solution Design

```text
User input
  -> local task and note storage
  -> cognitive state detector
  -> memory retrieval
  -> adaptive task planner
  -> transparent recommendation
  -> human accept/edit/reject
```

The demo runs in the browser and stores data locally. It uses transparent rules for state detection and planning so judges can inspect the decision process.

## Impact And Decision Value

CogniFlow changes the student's immediate decision. Instead of seeing a long, stressful task list, an overwhelmed student receives only the most critical next actions. A focused student receives a deep-work plan. This reduces decision friction and helps students act sooner.

## Human In The Loop

Students remain responsible for final decisions. CogniFlow recommends priorities and study actions, but students must accept, edit, or reject the plan. The AI never forces scheduling, deletes tasks automatically, or makes academic choices on the student's behalf.

## Responsible AI Guardrail

The main guardrail is local-first, transparent decision support. Sensitive notes and emotional signals stay in the browser demo. The system shows why it detected a state, avoids diagnosis, and requires user approval before a recommendation becomes an accepted plan.

## Tools And Data Disclosure

Tools:

- HTML, CSS, JavaScript.
- Browser localStorage.
- AI coding assistant used during development.

Data:

- User input.
- Synthetic sample scenario created for the demo.
- No external datasets.
- No proprietary data.
- No scraped website data.

## Build Requirement Statement

Substantial project work was produced for the hackathon build period of June 14-21, 2026. Open-source or standard browser technologies are used with attribution. No pre-built product, unauthorized proprietary data, or third-party personal data is included.

