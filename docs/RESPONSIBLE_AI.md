# Responsible AI And Ethics

## Main Risks

### Privacy

CogniFlow handles sensitive notes, deadlines, and emotional signals. If mishandled, this could expose academic struggles or mental health patterns.

Mitigation:

- Demo data stays in browser localStorage.
- No cloud database.
- No third-party analytics.
- User can clear tasks and overwrite notes.
- Submission discloses all data sources.

### Misclassification

The cognitive state detector can incorrectly classify a calm student as stressed or an overwhelmed student as focused.

Mitigation:

- Show confidence and detected signals.
- Avoid hidden scoring.
- Allow the student to reject or edit the plan.
- Do not present state detection as diagnosis.

### Hallucination Or Bad Advice

An AI system could recommend actions not supported by the student's notes or deadlines.

Mitigation:

- Demo planner uses explicit task and note inputs.
- Retrieved notes are shown separately.
- Recommendations stay practical and limited.
- Human approval is required.

### Over-Reliance

Students may trust the system too much and stop making their own decisions.

Mitigation:

- CogniFlow is framed as decision support.
- The interface requires accept, edit, or reject.
- Important academic and personal decisions remain with the student.

### Bias And Exclusion

Keyword-based stress detection may work worse for students who write in other languages, use slang, or express stress differently.

Mitigation:

- Production version should support multilingual calibration.
- Users should be able to correct the detected state.
- The classifier should be tested across regions and writing styles.

## Non-Medical Boundary

CogniFlow is not therapy, diagnosis, crisis counseling, or medical advice. It helps organize workload and study decisions. A production version should show crisis support messaging when users express self-harm or emergency risk.

## Data Disclosure

The demo uses:

- User input.
- Synthetic sample task scenario created for demonstration.
- No public datasets.
- No proprietary data.
- No scraped data.

## AI Tool Disclosure

AI coding assistance was used to help create project code and documentation. This must be disclosed in the hackathon submission.

