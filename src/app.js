const STORAGE_KEY = "cogniflow-demo-v3";
const MIN_CHECKIN_WORDS = 3;

// Language keyword dictionaries
const langKeywords = {
  en: {
    stress: ["stressed", "stress", "panic", "panicked", "overwhelmed", "anxious", "confused", "tired", "exhausted", "burnout", "burned", "late", "deadline", "deadlines", "missed", "cannot", "can't", "stuck", "afraid", "worried", "pressure", "fail", "crying", "lost"],
    focus: ["focused", "ready", "clear", "confident", "prepared", "calm", "flow", "productive", "revised", "finished", "planned", "understand", "motivated"],
    weak: ["weak", "confused", "stuck", "hard", "difficult", "need", "again", "forgot", "unclear"]
  },
  ur: {
    stress: ["پریشان", "تناؤ", "گھبراہٹ", "تھکاوٹ", "تھکا", "الجھن", "پریشانی", "دباؤ", "فیل", "رونا", "کھو", "اخری تاریخ", "آخری تاریخ", "مشکل", "ناکام", "ڈر", "خوف"],
    focus: ["پرسکون", "متوجہ", "تیار", "واضح", "بھروسہ", "مکمل", "فائدہ", "منصوبہ", "سمجھ", "اعتماد", "مطمئن"],
    weak: ["کمزور", "الجھن", "پھنس", "مشکل", "ضرورت", "دوبارہ", "بھول", "غیر واضح"]
  },
  hi: {
    stress: ["तनाव", "परेशान", "घबराहट", "थकान", "थका", "उलझन", "दबाव", "फेल", "डेडलाइन", "मुश्किल", "असमर्थ", "डर", "रोया", "खोया"],
    focus: ["शांत", "तैयार", "स्पष्ट", "भरोसा", "आत्मविश्वास", "सफल", "योजना", "समझ", "एकाग्र", "सीखा"],
    weak: ["कमजोर", "उलझन", "फंसा", "मुश्किल", "ज़रूरत", "दोबारा", "भूल", "अस्पष्ट"]
  },
  bn: {
    stress: ["উদ্বিগ্ন", "চাপ", "আতঙ্ক", "ক্লান্তি", "বিভ্রান্ত", "হতাশ", "ব্যর্থ", "ডেডলাইন", "কঠিন", "ভয়", "কান্না", "হারানো"],
    focus: ["শান্ত", "মনোযোগী", "প্রস্তুত", "স্পষ্ট", "আত্মবিশ্বাসী", "পরিকল্পনা", "সফল", "বোঝা", "অনুপ্রাণিত"],
    weak: ["দুর্বল", "বিভ্রান্ত", "আটকে", "কঠিন", "প্রয়োজন", "আবার", "ভুলে", "অস্পষ্ট"]
  }
};

// Synthetic training dataset for Naive Bayes classifier
const trainingCases = [
  // English Cases
  { checkIn: "I am calm and focused. I finished the reading and want to start the hardest assignment now.", label: "focused" },
  { checkIn: "I feel prepared for the quiz and have a clear plan for revision.", label: "focused" },
  { checkIn: "I completed my notes and feel productive. I can do deep work now.", label: "focused" },
  { checkIn: "My mind is clear and I already know the next two steps for my project.", label: "focused" },
  { checkIn: "I revised yesterday and feel confident about today's practice session.", label: "focused" },
  { checkIn: "I have two tasks this week and I need to decide the order.", label: "neutral" },
  { checkIn: "I need help organizing tasks for next week.", label: "neutral" },
  { checkIn: "I have normal workload today and want a simple study order.", label: "neutral" },
  { checkIn: "Nothing is urgent, but I want to plan revision before the weekend.", label: "neutral" },
  { checkIn: "I am not panicking but I have a deadline tomorrow and need a schedule.", label: "stressed" },
  { checkIn: "I am stressed because the assignment is late and I am confused about the rubric.", label: "stressed" },
  { checkIn: "I have a deadline and some pressure, but I know the next step.", label: "stressed" },
  { checkIn: "I am worried about tomorrow's quiz and need a fast revision plan.", label: "stressed" },
  { checkIn: "I feel tense because my project demo is soon and I still need to test it.", label: "stressed" },
  { checkIn: "I feel overwhelmed, exhausted, and stuck. There are too many deadlines and I cannot prioritize.", label: "overwhelmed" },
  { checkIn: "I have no idea what to study. I am panicked, tired, and afraid I will fail tomorrow.", label: "overwhelmed" },
  { checkIn: "I am exhausted and confused because I have three deadlines tomorrow and cannot decide what to do first.", label: "overwhelmed" },
  { checkIn: "I feel burned out and stuck because every subject looks urgent right now.", label: "overwhelmed" },

  // Urdu Cases
  { checkIn: "میں پرسکون اور متوجہ ہوں۔ میں نے پڑھائی ختم کر لی ہے اور اب سب سے مشکل کام شروع کرنا چاہتا ہوں۔", label: "focused" },
  { checkIn: "میں امتحان کے لیے تیار محسوس کرتا ہوں اور نظر ثانی کے لیے واضح منصوبہ رکھتا ہوں۔", label: "focused" },
  { checkIn: "میں نے اپنے نوٹس مکمل کر لیے ہیں اور پیداواری محسوس کر رہا ہوں۔ اب میں گہرا کام کر سکتا ہوں۔", label: "focused" },
  { checkIn: "اس ہفتے میرے پاس دو کام ہیں اور مجھے ترتیب طے کرنی ہے۔", label: "neutral" },
  { checkIn: "مجھے اگلے ہفتے کے کاموں کو ترتیب دینے میں مدد کی ضرورت ہے۔", label: "neutral" },
  { checkIn: "آج میرا کام معمول کے مطابق ہے اور میں ایک سادہ مطالعہ کا شیڈول چاہتا ہوں۔", label: "neutral" },
  { checkIn: "میں گھبرا نہیں رہا ہوں لیکن کل آخری تاریخ ہے اور مجھے ایک ٹائم ٹیبل کی ضرورت ہے۔", label: "stressed" },
  { checkIn: "میں پریشان ہوں کیونکہ اسائنمنٹ لیٹ ہو گئی ہے اور میں الجھن کا شکار ہوں۔", label: "stressed" },
  { checkIn: "کل کے کوئز کی وجہ سے میں تھوڑا تناؤ میں ہوں اور جلدی دہرائی کرنی ہے۔", label: "stressed" },
  { checkIn: "میں بہت زیادہ دباؤ، تھکاوٹ اور الجھن محسوس کر رہا ہوں۔ بہت سی آخری تاریخیں ہیں اور میں فیصلہ نہیں کر پا رہا۔", label: "overwhelmed" },
  { checkIn: "مجھے بالکل سمجھ نہیں آ رہی کہ کیا پڑھوں۔ میں گھبرا گیا ہوں اور مجھے ڈر ہے کہ میں فیل ہو جاؤں گا۔", label: "overwhelmed" },
  { checkIn: "تھکاوٹ اور پریشانی سے میرا برا حال ہے، تین اسائنمنٹس کل جمع کرانی ہیں اور میں ہمت ہار رہا ہوں۔", label: "overwhelmed" },

  // Hindi Cases
  { checkIn: "मैं शांत और ध्यान केंद्रित महसूस कर रहा हूँ। मैंने पढ़ाई पूरी कर ली है और अब सबसे कठिन काम शुरू करना चाहता हूँ।", label: "focused" },
  { checkIn: "मैं परीक्षा के लिए तैयार हूँ और मेरे पास रिवीजन की स्पष्ट योजना है।", label: "focused" },
  { checkIn: "मैंने अपने नोट्स पूरे कर लिए हैं और बहुत अच्छा महसूस कर रहा हूँ।", label: "focused" },
  { checkIn: "इस सप्ताह मेरे पास दो काम हैं और मुझे तय करना है कि क्या पहले करूँ।", label: "neutral" },
  { checkIn: "मुझे अगले सप्ताह के काम व्यवस्थित करने में मदद चाहिए।", label: "neutral" },
  { checkIn: "आज सामान्य काम है और मुझे एक आसान स्टडी प्लान चाहिए।", label: "neutral" },
  { checkIn: "मैं घबरा नहीं रहा हूँ लेकिन कल डेडलाइन है और मुझे एक शेड्यूल चाहिए।", label: "stressed" },
  { checkIn: "मैं तनाव में हूँ क्योंकि असाइनमेंट लेट हो गया है और मैं उलझन में हूँ।", label: "stressed" },
  { checkIn: "कल के टेस्ट को लेकर मैं थोड़ा परेशान हूँ और मुझे जल्दी से रिवीजन करना है।", label: "stressed" },
  { checkIn: "मैं बहुत अधिक तनाव, थकान और उलझन महसूस कर रहा हूँ। बहुत सारी डेडलाइन्स हैं और समझ नहीं आ रहा क्या करूँ।", label: "overwhelmed" },
  { checkIn: "मुझे बिल्कुल समझ नहीं आ रहा कि क्या पढ़ना है। मैं घबराया हुआ हूँ और फेल होने का डर है।", label: "overwhelmed" },
  { checkIn: "मैं पूरी तरह से थक गया हूँ, कल तीन काम जमा करने हैं और मुझसे अब और नहीं हो रहा।", label: "overwhelmed" },

  // Bengali Cases
  { checkIn: "আমি শান্ত এবং মনোযোগী। আমি পড়া শেষ করেছি এবং এখন সবচেয়ে কঠিন কাজটি শুরু করতে চাই।", label: "focused" },
  { checkIn: "আমি পরীক্ষার জন্য প্রস্তুত এবং আমার কাছে রিভিশনের স্পষ্ট পরিকল্পনা আছে।", label: "focused" },
  { checkIn: "আমার নোটগুলো সম্পূর্ণ হয়েছে এবং আমি এখন গভীর মনোযোগ দিয়ে কাজ করতে পারি।", label: "focused" },
  { checkIn: "এই সপ্তাহে আমার দুটি কাজ আছে এবং আমাকে অগ্রাধিকার ঠিক করতে হবে।", label: "neutral" },
  { checkIn: "সামনের সপ্তাহের কাজগুলো সাজাতে আমার সাহায্য লাগবে।", label: "neutral" },
  { checkIn: "আমি আতঙ্কিত নই তবে কাল ডেডলাইন আছে এবং আমার একটি পড়ার রুটিন দরকার।", label: "stressed" },
  { checkIn: "অ্যাসাইনমেন্ট জমা দেওয়ার সময় চলে যাচ্ছে বলে আমি চিন্তিত এবং বিভ্রান্ত।", label: "stressed" },
  { checkIn: "আমি চরম চাপ, ক্লান্তি এবং বিভ্রান্তি অনুভব করছি। অনেকগুলো ডেডলাইন একসাথে আসায় কিছুই বুঝতে পারছি না।", label: "overwhelmed" },
  { checkIn: "কী পড়ব তা বুঝতে পারছি না। আমি আতঙ্কিত এবং আমার ভয় হচ্ছে যে আমি ফেল করব।", label: "overwhelmed" },
  { checkIn: "আমি সম্পূর্ণ ক্লান্ত, কাল তিনটি অ্যাসাইনমেন্ট জমা দিতে হবে এবং আমার মাথা কাজ করছে না।", label: "overwhelmed" }
];

// UI Localization dictionary
const translations = {
  en: {
    "brand-title": "CogniFlow",
    "brand-subtitle": "Emotion-aware second brain",
    "select-lang": "Language:",
    "theme-dark": "Dark Mode",
    "theme-light": "Light Mode",
    "nav-home": "Home",
    "nav-demo": "Demo Guide",
    "nav-dashboard": "Dashboard",
    "nav-tasks": "Tasks",
    "nav-memory": "Memory",
    "nav-history": "Study History",
    "nav-data": "Data",
    "nav-ethics": "AI Guardrails",
    "privacy-title": "Local demo mode",
    "privacy-desc": "Inputs stay in this browser through localStorage. No server is used.",
    "eyebrow": "Student workload assistant",
    "title-home": "Project Overview",
    "title-demo": "Demo Guide",
    "title-dashboard": "Adaptive Daily Plan",
    "title-tasks": "Task Manager",
    "title-memory": "Second Brain Memory",
    "title-history": "Study History",
    "title-data": "Data Controls",
    "title-ethics": "Responsible AI Design",
    "state-neutral": "Neutral",
    "state-focused": "Focused",
    "state-stressed": "Stressed",
    "state-overwhelmed": "Overwhelmed",
    "state-waiting": "Waiting",
    "hero-eyebrow": "Complete local JavaScript system",
    "hero-heading": "CogniFlow helps students decide what to study next when work feels scattered or stressful.",
    "hero-desc": "Students add tasks, notes, study logs, and a short check-in. CogniFlow reads the workload, detects stress/focus signals, finds relevant saved notes, and builds a practical plan that the student can accept, edit, or reject.",
    "btn-see-steps": "See demo steps",
    "btn-use-system": "Use system",
    "sample-output": "sample output",
    "sample-plan-1": "Work on 'Revise DBMS normalization' for 25 minutes only.",
    "sample-plan-2": "Open memory note 'DBMS revision checklist' before starting.",
    "sample-plan-3": "Hide non-urgent tasks until the first block is complete.",
    "feature-prob-title": "Problem",
    "feature-prob-desc": "Students often have quizzes, assignments, notes, and personal pressure at the same time. The hard part is deciding the next action.",
    "feature-input-title": "Input",
    "feature-input-desc": "The system accepts a check-in sentence, academic tasks, course notes, and study history logs.",
    "feature-ai-title": "AI Logic",
    "feature-ai-desc": "It uses local keyword/NLP signals, task urgency scoring, note retrieval, and weak-topic detection. No paid API is required.",
    "feature-out-title": "Output",
    "feature-out-desc": "It returns a cognitive state, confidence, detected signals, relevant notes, and an adaptive plan.",
    "feature-help-title": "Why Helpful",
    "feature-help-desc": "A stressed student gets a smaller first step instead of a long generic to-do list.",
    "feature-priv-title": "Privacy",
    "feature-priv-desc": "All demo data is stored locally in the browser using localStorage. There is no server upload.",
    "demo-title": "Non-Technical Demo",
    "btn-load-sample": "Load sample demo",
    "demo-desc": "Use this flow to explain CogniFlow to any non-technical person in 2-3 minutes.",
    "demo-step1-title": "1. Student writes a check-in",
    "demo-step1-desc": "Example: I feel stressed because my DBMS quiz is tomorrow and normalization is weak.",
    "demo-step2-title": "2. Student adds tasks",
    "demo-step2-desc": "Example tasks include DBMS revision, AI assignment, and OS reading with priorities and due dates.",
    "demo-step3-title": "3. Student saves notes",
    "demo-step3-desc": "The memory stores useful notes like DBMS weak topics and revision checklists.",
    "demo-step4-title": "4. CogniFlow analyzes the situation",
    "demo-step4-desc": "It detects stress words, urgent deadlines, active task count, and weak topics from study history.",
    "demo-step5-title": "5. CogniFlow gives a plan",
    "demo-step5-desc": "The output is a small action plan, relevant note suggestions, confidence score, and reasons.",
    "demo-step6-title": "6. Student stays in control",
    "demo-step6-desc": "The student can accept, edit, or reject the recommendation.",
    "btn-open-dashboard": "Open generated output",
    "btn-view-guardrails": "View guardrails",
    "expected-output-title": "Expected Demo Output",
    "expected-out-1": "State is high overload because the check-in has stress terms and urgent tasks.",
    "expected-out-2-title": "Retrieved note",
    "expected-out-2-desc": "DBMS notes rank above unrelated AI notes when the active task is DBMS.",
    "expected-out-3-title": "Adaptive plan",
    "expected-out-3-desc": "First action becomes a 25-minute DBMS revision block, not a broad study schedule.",
    "expected-out-4-title": "Helpful result",
    "expected-out-4-desc": "The student knows exactly what to do first and can revise the plan before acting.",
    "checkin-title": "Student Check-In",
    "checkin-label": "How are you feeling and what is happening?",
    "btn-analyze": "Analyze and plan",
    "btn-clear-checkin": "Clear check-in",
    "cognitive-state-title": "Cognitive State",
    "state-details-placeholder": "Add a real check-in sentence to estimate cognitive load.",
    "recom-plan-title": "Recommended Plan",
    "btn-accept": "Accept",
    "btn-edit": "Edit",
    "btn-reject": "Reject",
    "human-loop-note": "The student makes the final decision. CogniFlow only recommends.",
    "workspace-summary-title": "Workspace Summary",
    "summary-tasks": "tasks",
    "summary-notes": "notes",
    "summary-logs": "logs",
    "summary-weak": "weak",
    "stat-avg-session": "Avg / Session",
    "stat-top-course": "Top Course",
    "add-task-title": "Add Task",
    "btn-clear-done": "Clear done",
    "field-task": "Task",
    "field-course": "Course",
    "field-due": "Due Date",
    "field-priority": "Priority",
    "field-effort": "Effort minutes",
    "field-status": "Status",
    "btn-save-task": "Save task",
    "btn-cancel-edit": "Cancel edit",
    "tasks-list-title": "Tasks",
    "btn-clear-all": "Clear all",
    "kb-title": "Knowledge Memory",
    "btn-save-note": "Save note",
    "field-title": "Title",
    "field-note": "Note",
    "ask-sb-title": "Ask Your Second Brain",
    "btn-search": "Search",
    "field-question": "Question",
    "saved-notes-title": "Saved Notes",
    "btn-clear-notes": "Clear notes",
    "add-log-title": "Add Study Log",
    "btn-save-log": "Save log",
    "field-date": "Date",
    "field-topic": "Topic",
    "field-minutes": "Minutes",
    "field-history-q": "History question",
    "field-reflection": "Reflection",
    "btn-answer-q": "Answer question",
    "history-ans-title": "Study History Timeline & Answers",
    "btn-clear-logs": "Clear logs",
    "history-placeholder": "Ask a question or add a study log.",
    "timeline-title": "Study Timeline",
    "data-ctrl-title": "Data Controls",
    "data-ctrl-desc": "Export/import copies your browser-only CogniFlow data. Reset clears this browser workspace.",
    "btn-export": "Export JSON",
    "btn-import": "Import JSON",
    "btn-reset": "Reset app",
    "accepted-plan-title": "Accepted Plan",
    "ethics-title": "Responsible AI Controls",
    "limits-title": "Known Limits",
    "ethics-list-1": "Local browser storage for demo data.",
    "ethics-list-2": "No medical diagnosis or therapy claims.",
    "ethics-list-3": "Transparent stress signals and confidence score.",
    "ethics-list-4": "Student approval required before a plan is adopted.",
    "ethics-list-5": "Delete, reset, export, and import controls for user data.",
    "limits-list-1": "Keyword and pattern-based classifier can be wrong.",
    "limits-list-2": "Recommendations are decision support, not commands.",
    "limits-list-3": "Demo uses synthetic examples and user input only.",
    "limits-list-4": "Users in crisis should contact trusted people or local emergency support.",
    "edit-plan-title": "Edit Accepted Plan",
    "btn-save": "Save",
    "btn-cancel": "Cancel",
    "btn-done": "Done",
    "btn-open": "Reopen",
    "btn-delete": "Delete",
    "btn-update-task": "Update task",
    "btn-update-note": "Update note",
    "btn-update-log": "Update log",
    "meta-overdue": "overdue",
    "meta-due-today": "due today",
    "meta-due-tomorrow": "due tomorrow",
    "meta-due-in": "due in",
    "meta-days": "days",
    "meta-no-tasks": "No tasks yet. Add one above.",
    "meta-no-notes": "No notes saved yet.",
    "meta-no-logs": "No study logs yet.",
    "meta-no-weak": "No weak topics detected.",
    "meta-saved": "Saved",
    "meta-enter-question": "Enter a question to search your notes.",
    "meta-no-match": "No matching notes found.",
    "meta-add-tasks-plan": "Add tasks and write a check-in to generate a plan.",
    "meta-no-accepted": "No plan accepted yet.",
    "err-task-title": "Task title must be at least 3 characters.",
    "err-task-due": "Please select a due date.",
    "err-task-effort": "Effort must be at least 5 minutes.",
    "err-note-title": "Note title must be at least 3 characters.",
    "err-note-body": "Note body must be at least 3 words.",
    "err-log-date": "Please select a study date.",
    "err-log-topic": "Topic must be at least 3 characters.",
    "err-log-minutes": "Minutes must be at least 5.",
    "err-checkin-length": "Check-in must be at least 3 words long.",
    "err-ask-q": "Type a question first.",
    "toast-task-saved": "Task saved.",
    "toast-note-saved": "Note saved.",
    "toast-log-saved": "Study log saved.",
    "toast-done-cleared": "Done tasks cleared.",
    "toast-plan-generated": "Plan generated!",
    "toast-plan-accepted": "Plan accepted.",
    "toast-plan-rejected": "Plan rejected.",
    "toast-edited-saved": "Edited plan saved.",
    "toast-generate-plan": "Generate a plan first.",
    "toast-sample-loaded": "Sample scenario loaded.",
    "toast-export-downloaded": "Data exported.",
    "toast-data-imported": "Data imported.",
    "toast-invalid-json": "Invalid JSON file.",
    "toast-app-reset": "App has been reset.",
    "toast-cleared": "Data cleared.",
    "desc-focused": "You seem focused and ready. Time for deep work.",
    "desc-neutral": "Normal state. You can plan ahead confidently.",
    "desc-stressed": "Moderate stress detected. Focus on the most urgent task first.",
    "desc-overwhelmed": "High overload detected. Start with the smallest urgent step only.",
    "plan-step-add-tasks": "Add tasks to let CogniFlow build a plan.",
    "plan-step-write-checkin": "Write a short check-in describing how you feel.",
    "plan-step-rerun": "Click 'Analyze and plan' to generate recommendations.",
    "plan-open-note": "Open memory note",
    "plan-before-starting": "before starting",
    "plan-use-latest-notes": "Review your latest notes before starting.",
    "plan-rapid-revise": "Rapid revise weak topic",
    "plan-work-on": "Work on",
    "plan-25-min-only": "for 25 minutes only",
    "plan-do-subtask": "Then do a small subtask of",
    "plan-after-reset": "after a short reset",
    "plan-take-reset": "Take a 5-minute reset before the next block.",
    "plan-hide-non-urgent": "Hide non-urgent tasks until the first block is complete.",
    "plan-protect-50": "Protect 50 minutes for",
    "plan-schedule": "Schedule",
    "plan-after-break": "after a break",
    "plan-review-result": "Review your result and adjust if needed.",
    "plan-move-low-priority": "Move low-priority tasks to tomorrow if needed.",
    "plan-start-90": "Start a 90-minute deep work block on",
    "plan-batch-next": "Batch next task",
    "plan-write-summary": "Write a short summary of what you completed.",
    "plan-complete-urgent": "Complete the most urgent task first",
    "plan-prepare-materials": "Prepare materials for",
    "plan-add-concrete": "Add a concrete next task after completing this one.",
    "plan-review-after-block": "Review your progress after one study block.",
    "plan-loop-accepted": "Plan accepted. You are in control.",
    "plan-loop-rejected": "Plan rejected. You can write a new check-in.",
    "plan-loop-edited": "Plan edited and saved.",
    "confirm-reset": "Are you sure you want to reset all data?",
    "confirm-clear": "Are you sure you want to clear",
    "history-not-found-date": "No study records found for",
    "history-not-found": "No matching study records found."
  },
  ur: {
    "brand-title": "کوگنی فلو",
    "brand-subtitle": "جذبات سے باخبر دوسرا دماغ",
    "select-lang": "زبان:",
    "theme-dark": "ڈارک موڈ",
    "theme-light": "لائٹ موڈ",
    "nav-home": "ہوم",
    "nav-demo": "ڈیمو گائیڈ",
    "nav-dashboard": "ڈیش بورڈ",
    "nav-tasks": "ٹاسکس",
    "nav-memory": "میموری",
    "nav-history": "مطالعہ کی تاریخ",
    "nav-data": "ڈیٹا",
    "nav-ethics": "اے آئی اصول",
    "privacy-title": "لوکل ڈیمو موڈ",
    "privacy-desc": "آپ کا ڈیٹا اسی براؤزر میں لوکل اسٹوریج میں رہتا ہے۔ کوئی سرور استعمال نہیں ہوتا۔",
    "eyebrow": "طالب علم کے کام کا معاون",
    "title-home": "پروجیکٹ کا جائزہ",
    "title-demo": "ڈیمو گائیڈ",
    "title-dashboard": "سہولت بخش روزانہ کا منصوبہ",
    "title-tasks": "ٹاسک مینیجر",
    "title-memory": "دوسرا دماغ میموری",
    "title-history": "مطالعہ کی تاریخ",
    "title-data": "ڈیٹا کنٹرولز",
    "title-ethics": "ذمہ دارانہ اے آئی ڈیزائن",
    "state-neutral": "معتدل",
    "state-focused": "پُرسکون / متوجہ",
    "state-stressed": "تناؤ کا شکار",
    "state-overwhelmed": "بہت زیادہ تناؤ",
    "state-waiting": "انتظار",
    "hero-eyebrow": "لوکل جاوا اسکرپٹ سسٹم",
    "hero-heading": "کام بکھرا ہوا یا پریشان کن ہونے پر کوگنی فلو فیصلہ کرنے میں مدد کرتا ہے۔",
    "hero-desc": "طلباء کام، نوٹس، مطالعہ کے لاگز اور اپنا جائزہ لکھتے ہیں۔ کوگنی فلو کام کا بوجھ پڑھتا ہے، تناؤ کے سگنل پکڑتا ہے، متعلقہ نوٹس تلاش کرتا ہے اور ایک ایسا منصوبہ تیار کرتا ہے جسے طالب علم قبول، ترمیم یا مسترد کر سکتا ہے۔",
    "btn-see-steps": "ڈیمو کے مراحل دیکھیں",
    "btn-use-system": "سسٹم استعمال کریں",
    "sample-output": "نمونہ آؤٹ پٹ",
    "sample-plan-1": "صرف 25 منٹ کے لیے 'ڈی بی ایم ایس کی دہرائی' پر کام کریں۔",
    "sample-plan-2": "شروع کرنے سے پہلے میموری نوٹ 'ڈی بی ایم ایس دہرائی کی فہرست' دیکھیں۔",
    "sample-plan-3": "پہلا بلاک مکمل ہونے تک غیر ضروری کاموں کو چھپائیں۔",
    "feature-prob-title": "مسئلہ",
    "feature-prob-desc": "طلباء کو کوئز، اسائنمنٹس، اور ذاتی دباؤ کا بیک وقت سامنا ہوتا ہے۔ سب سے مشکل کام اگلا قدم طے کرنا ہے۔",
    "feature-input-title": "ان پٹ",
    "feature-input-desc": "سسٹم ایک جائزہ جملہ، تعلیمی کام، کورس نوٹس، اور مطالعہ کی تاریخ کے لاگز قبول کرتا ہے۔",
    "feature-ai-title": "اے آئی لاجک",
    "feature-ai-desc": "یہ مقامی کی ورڈ/NLP سگنلز، ٹاسک کی فوری ضرورت اور مطالعہ کی تاریخ پر کام کرتا ہے۔ کسی فیس کی ضرورت نہیں ہے۔",
    "feature-out-title": "آؤٹ پٹ",
    "feature-out-desc": "یہ ذہنی حالت، کارکردگی کا یقین، متعلقہ نوٹس، اور مطابقت پذیر منصوبہ واپس کرتا ہے۔",
    "feature-help-title": "مددگار کیوں ہے؟",
    "feature-help-desc": "پریشان طالب علم کو ایک طویل فہرست کے بجائے ایک چھوٹا اور آسان پہلا قدم ملتا ہے۔",
    "feature-priv-title": "رازداری",
    "feature-priv-desc": "تمام ڈیٹا براؤزر کے لوکل اسٹوریج میں محفوظ ہوتا ہے۔ کوئی سرور اپ لوڈ نہیں ہوتا۔",
    "demo-title": "غیر تکنیکی ڈیمو",
    "btn-load-sample": "نمونہ لوڈ کریں",
    "demo-desc": "کسی بھی غیر تکنیکی شخص کو 2-3 منٹ میں کوگنی فلو سمجھانے کے لیے اس فلو کا استعمال کریں۔",
    "demo-step1-title": "1. طالب علم اپنا حال لکھتا ہے",
    "demo-step1-desc": "مثال: میں تناؤ کا شکار ہوں کیونکہ کل میرا کوئز ہے اور میری تیاری کمزور ہے۔",
    "demo-step2-title": "2. طالب علم کام شامل کرتا ہے",
    "demo-step2-desc": "مثال کے طور پر کوئز کی تیاری، ہوم ورک اور پڑھائی کے مختلف کام شامل ہیں۔",
    "demo-step3-title": "3. طالب علم نوٹس محفوظ کرتا ہے",
    "demo-step3-desc": "میموری میں دہرائی کی فہرست اور اہم نوٹس محفوظ ہوتے ہیں۔",
    "demo-step4-title": "4. کوگنی فلو تجزیہ کرتا ہے",
    "demo-step4-desc": "یہ تناؤ کے الفاظ، آخری تاریخ اور مطالعہ کی تاریخ کا جائزہ لیتا ہے۔",
    "demo-step5-title": "5. کوگنی فلو منصوبہ پیش کرتا ہے",
    "demo-step5-desc": "یہ ایک مختصر منصوبہ، متعلقہ نوٹس کی تجاویز اور وجوہات پیش کرتا ہے۔",
    "demo-step6-title": "6. طالب علم بااختیار رہتا ہے",
    "demo-step6-desc": "طالب علم تجویز کردہ منصوبے کو قبول، ترمیم یا مسترد کر سکتا ہے۔",
    "btn-open-dashboard": "تخلیق شدہ آؤٹ پٹ کھولیں",
    "btn-view-guardrails": "اصول دیکھیں",
    "expected-output-title": "متوقع آؤٹ پٹ",
    "expected-out-1": "ذہنی حالت شدید تناؤ کی ہے کیونکہ طالب علم کے جملے میں پریشانی کے الفاظ اور فوری کام موجود ہیں۔",
    "expected-out-2-title": "حاصل کردہ نوٹ",
    "expected-out-2-desc": "جب سرگرم کام ڈی بی ایم ایس ہو تو ڈی بی ایم ایس کے نوٹس پہلے ظاہر ہوتے ہیں۔",
    "expected-out-3-title": "سہولت بخش منصوبہ",
    "expected-out-3-desc": "پہلا قدم 25 منٹ کا مطالعہ بلاک بن جاتا ہے، نہ کہ کوئی طویل شیڈول۔",
    "expected-out-4-title": "مددگار نتیجہ",
    "expected-out-4-desc": "طالب علم کو معلوم ہوتا ہے کہ پہلے کیا کرنا ہے اور وہ شروع کرنے سے پہلے اس میں تبدیلی کر سکتا ہے۔",
    "checkin-title": "طالب علم کا جائزہ",
    "checkin-label": "آپ کیسا محسوس کر رہے ہیں اور کیا ہو رہا ہے؟",
    "btn-analyze": "تجزیہ کریں اور منصوبہ بنائیں",
    "btn-clear-checkin": "جائزہ صاف کریں",
    "cognitive-state-title": "ذہنی حالت",
    "state-details-placeholder": "ذہنی بوجھ کا اندازہ لگانے کے لیے ایک جائزہ جملہ درج کریں۔",
    "recom-plan-title": "تجویز کردہ منصوبہ",
    "btn-accept": "قبول کریں",
    "btn-edit": "ترمیم کریں",
    "btn-reject": "مسترد کریں",
    "human-loop-note": "آخری فیصلہ طالب علم کا ہوتا ہے۔ کوگنی فلو صرف تجویز پیش کرتا ہے۔",
    "workspace-summary-title": "ورک اسپیس کا خلاصہ",
    "summary-tasks": "ٹاسکس",
    "summary-notes": "نوٹس",
    "summary-logs": "لاگز",
    "summary-weak": "کمزوریاں",
    "stat-avg-session": "اوسط وقت",
    "stat-top-course": "سب سے زیادہ پڑھا",
    "add-task-title": "نیا ٹاسک",
    "btn-clear-done": "مکمل صاف کریں",
    "field-task": "ٹاسک",
    "field-course": "کورس",
    "field-due": "آخری تاریخ",
    "field-priority": "ترجیح",
    "field-effort": "درکار منٹ",
    "field-status": "حالت",
    "btn-save-task": "ٹاسک محفوظ کریں",
    "btn-cancel-edit": "ترمیم منسوخ",
    "tasks-list-title": "ٹاسکس فہرست",
    "btn-clear-all": "سب صاف کریں",
    "kb-title": "علمی یادداشت (میموری)",
    "btn-save-note": "نوٹ محفوظ کریں",
    "field-title": "عنوان",
    "field-note": "تفصیل",
    "ask-sb-title": "دوسرے دماغ سے پوچھیں",
    "btn-search": "تلاش کریں",
    "field-question": "سوال",
    "saved-notes-title": "محفوظ کردہ نوٹس",
    "btn-clear-notes": "نوٹس صاف کریں",
    "add-log-title": "مطالعہ کا لاگ لکھیں",
    "btn-save-log": "لاگ محفوظ کریں",
    "field-date": "تاریخ",
    "field-topic": "موضوع",
    "field-minutes": "منٹ",
    "field-history-q": "تاریخ کا سوال",
    "field-reflection": "تجربہ / رائے",
    "btn-answer-q": "سوال کا جواب دیں",
    "history-ans-title": "ٹائم لائن اور جوابات",
    "btn-clear-logs": "لاگز صاف کریں",
    "history-placeholder": "کوئی سوال پوچھیں یا مطالعہ کا لاگ شامل کریں۔",
    "timeline-title": "مطالعہ کی ٹائم لائن",
    "data-ctrl-title": "ڈیٹا کنٹرولز",
    "data-ctrl-desc": "ڈیٹا ایکسپورٹ یا امپورٹ کریں۔ ری سیٹ کرنے سے تمام لوکل ڈیٹا مٹ جائے گا۔",
    "btn-export": "ایکسپورٹ JSON",
    "btn-import": "امپورٹ JSON",
    "btn-reset": "ری سیٹ کریں",
    "accepted-plan-title": "منظور شدہ منصوبہ",
    "ethics-title": "ذمہ دارانہ اے آئی کنٹرولز",
    "limits-title": "معلوم حدود",
    "ethics-list-1": "ڈیمو ڈیٹا لوکل براؤزر اسٹوریج میں رہتا ہے۔",
    "ethics-list-2": "طبی تشخیص یا تھراپی کا کوئی دعویٰ نہیں ہے۔",
    "ethics-list-3": "تناؤ کے سگنل اور کارکردگی کا یقین واضح دکھایا جاتا ہے۔",
    "ethics-list-4": "منصوبہ لاگو کرنے سے پہلے طالب علم کی منظوری ضروری ہے۔",
    "ethics-list-5": "ڈیٹا کو حذف، ری سیٹ، ایکسپورٹ اور امپورٹ کرنے کا مکمل اختیار۔",
    "limits-list-1": "کی ورڈ اور پیٹرن پر مبنی درجہ بندی غلط ہو سکتی ہے۔",
    "limits-list-2": "سفارشات فیصلے میں مدد کے لیے ہیں، احکامات نہیں ہیں۔",
    "limits-list-3": "ڈیمو صرف فرضی نمونوں اور صارف کے ان پٹ کا استعمال کرتا ہے۔",
    "limits-list-4": "شدید پریشانی کی صورت میں قریبی لوگوں یا ہنگامی مدد سے رابطہ کریں۔",
    "edit-plan-title": "منصوبے میں ترمیم کریں",
    "btn-save": "محفوظ کریں",
    "btn-cancel": "منسوخ",
    "btn-done": "مکمل",
    "btn-open": "دوبارہ کھولیں",
    "btn-delete": "حذف کریں",
    "btn-update-task": "ٹاسک اپ ڈیٹ کریں",
    "btn-update-note": "نوٹ اپ ڈیٹ کریں",
    "btn-update-log": "لاگ اپ ڈیٹ کریں",
    "meta-overdue": "مدت ختم",
    "meta-due-today": "آج واجب الادا",
    "meta-due-tomorrow": "کل واجب الادا",
    "meta-due-in": "باقی",
    "meta-days": "دن",
    "meta-no-tasks": "ابھی تک کوئی ٹاسک نہیں۔ اوپر نیا شامل کریں۔",
    "meta-no-notes": "ابھی تک کوئی نوٹس محفوظ نہیں۔",
    "meta-no-logs": "ابھی تک کوئی مطالعہ لاگ نہیں۔",
    "meta-no-weak": "کوئی کمزور موضوع نہیں ملا۔",
    "meta-saved": "محفوظ کیا گیا",
    "meta-enter-question": "اپنے نوٹس میں تلاش کے لیے سوال لکھیں۔",
    "meta-no-match": "کوئی متعلقہ نوٹ نہیں ملا۔",
    "meta-add-tasks-plan": "منصوبہ بنانے کے لیے ٹاسکس شامل کریں اور جائزہ لکھیں۔",
    "meta-no-accepted": "ابھی تک کوئی منصوبہ قبول نہیں کیا گیا۔",
    "err-task-title": "ٹاسک کا عنوان کم از کم 3 حروف ہونا چاہیے۔",
    "err-task-due": "براہ کرم آخری تاریخ منتخب کریں۔",
    "err-task-effort": "کم از کم 5 منٹ درکار ہیں۔",
    "err-note-title": "نوٹ کا عنوان کم از کم 3 حروف ہونا چاہیے۔",
    "err-note-body": "نوٹ کی تفصیل کم از کم 3 الفاظ ہونی چاہیے۔",
    "err-log-date": "براہ کرم مطالعہ کی تاریخ منتخب کریں۔",
    "err-log-topic": "موضوع کم از کم 3 حروف ہونا چاہیے۔",
    "err-log-minutes": "کم از کم 5 منٹ درج کریں۔",
    "err-checkin-length": "جائزہ کم از کم 3 الفاظ پر مشتمل ہونا چاہیے۔",
    "err-ask-q": "پہلے سوال لکھیں۔",
    "toast-task-saved": "ٹاسک محفوظ ہو گیا۔",
    "toast-note-saved": "نوٹ محفوظ ہو گیا۔",
    "toast-log-saved": "مطالعہ لاگ محفوظ ہو گیا۔",
    "toast-done-cleared": "مکمل ٹاسکس صاف ہو گئے۔",
    "toast-plan-generated": "منصوبہ تیار ہو گیا!",
    "toast-plan-accepted": "منصوبہ قبول کر لیا گیا۔",
    "toast-plan-rejected": "منصوبہ مسترد کر دیا گیا۔",
    "toast-edited-saved": "ترمیم شدہ منصوبہ محفوظ ہو گیا۔",
    "toast-generate-plan": "پہلے منصوبہ تیار کریں۔",
    "toast-sample-loaded": "نمونہ منظرنامہ لوڈ ہو گیا۔",
    "toast-export-downloaded": "ڈیٹا ایکسپورٹ ہو گیا۔",
    "toast-data-imported": "ڈیٹا امپورٹ ہو گیا۔",
    "toast-invalid-json": "غلط JSON فائل۔",
    "toast-app-reset": "ایپ ری سیٹ ہو گئی ہے۔",
    "toast-cleared": "ڈیٹا صاف ہو گیا۔",
    "desc-focused": "آپ متوجہ اور تیار نظر آتے ہیں۔ گہرے کام کا وقت ہے۔",
    "desc-neutral": "معمول کی حالت۔ آپ اعتماد سے منصوبہ بندی کر سکتے ہیں۔",
    "desc-stressed": "درمیانی تناؤ محسوس ہو رہا ہے۔ سب سے اہم کام پہلے کریں۔",
    "desc-overwhelmed": "شدید تناؤ محسوس ہو رہا ہے۔ صرف سب سے چھوٹا فوری قدم اٹھائیں۔",
    "plan-step-add-tasks": "منصوبہ بنانے کے لیے ٹاسکس شامل کریں۔",
    "plan-step-write-checkin": "اپنی حالت بیان کرتے ہوئے ایک مختصر جائزہ لکھیں۔",
    "plan-step-rerun": "تجاویز حاصل کرنے کے لیے 'تجزیہ کریں' پر کلک کریں۔",
    "plan-open-note": "میموری نوٹ کھولیں",
    "plan-before-starting": "شروع کرنے سے پہلے",
    "plan-use-latest-notes": "شروع کرنے سے پہلے اپنے نوٹس دیکھیں۔",
    "plan-rapid-revise": "کمزور موضوع کی فوری دہرائی",
    "plan-work-on": "اس پر کام کریں:",
    "plan-25-min-only": "صرف 25 منٹ کے لیے",
    "plan-do-subtask": "پھر ایک چھوٹا کام کریں",
    "plan-after-reset": "ایک مختصر وقفے کے بعد",
    "plan-take-reset": "اگلے بلاک سے پہلے 5 منٹ کا وقفہ لیں۔",
    "plan-hide-non-urgent": "پہلا بلاک مکمل ہونے تک غیر ضروری کام چھپائیں۔",
    "plan-protect-50": "50 منٹ کا تحفظ کریں",
    "plan-schedule": "شیڈول کریں",
    "plan-after-break": "وقفے کے بعد",
    "plan-review-result": "نتیجے کا جائزہ لیں اور ضرورت ہو تو ایڈجسٹ کریں۔",
    "plan-move-low-priority": "اگر ضرورت ہو تو کم ترجیحی کام کل پر منتقل کریں۔",
    "plan-start-90": "90 منٹ کا گہرے کام کا بلاک شروع کریں",
    "plan-batch-next": "اگلا ٹاسک شامل کریں",
    "plan-write-summary": "آپ نے جو مکمل کیا اس کا مختصر خلاصہ لکھیں۔",
    "plan-complete-urgent": "سب سے اہم ٹاسک پہلے مکمل کریں",
    "plan-prepare-materials": "کے لیے مواد تیار کریں",
    "plan-add-concrete": "یہ مکمل کرنے کے بعد ایک ٹھوس اگلا ٹاسک شامل کریں۔",
    "plan-review-after-block": "ایک مطالعہ بلاک کے بعد اپنی پیشرفت کا جائزہ لیں۔",
    "plan-loop-accepted": "منصوبہ قبول کیا گیا۔ آپ اختیار میں ہیں۔",
    "plan-loop-rejected": "منصوبہ مسترد کر دیا گیا۔ آپ نیا جائزہ لکھ سکتے ہیں۔",
    "plan-loop-edited": "ترمیم شدہ منصوبہ محفوظ ہو گیا۔",
    "confirm-reset": "کیا آپ واقعی تمام ڈیٹا ری سیٹ کرنا چاہتے ہیں؟",
    "confirm-clear": "کیا آپ واقعی صاف کرنا چاہتے ہیں",
    "history-not-found-date": "اس تاریخ کے لیے کوئی ریکارڈ نہیں ملا",
    "history-not-found": "کوئی متعلقہ مطالعہ ریکارڈ نہیں ملا۔"
  },
  hi: {
    "brand-title": "कोग्नीफ्लो",
    "brand-subtitle": "भावना-जागरूक दूसरा दिमाग",
    "select-lang": "भाषा:",
    "theme-dark": "डार्क मोड",
    "theme-light": "लाइट मोड",
    "nav-home": "होम",
    "nav-demo": "डेमो गाइड",
    "nav-dashboard": "डैशबोर्ड",
    "nav-tasks": "कार्य",
    "nav-memory": "मेमोरी",
    "nav-history": "अध्ययन इतिहास",
    "nav-data": "डेटा",
    "nav-ethics": "एआई दिशानिर्देश",
    "privacy-title": "लोकल डेमो मोड",
    "privacy-desc": "आपका डेटा इसी ब्राउज़र के लोकल स्टोरेज में रहता है। कोई सर्वर उपयोग नहीं होता।",
    "eyebrow": "छात्र कार्य सहायक",
    "title-home": "परियोजना अवलोकन",
    "title-demo": "डेमो गाइड",
    "title-dashboard": "अनुकूल दैनिक योजना",
    "title-tasks": "कार्य प्रबंधक",
    "title-memory": "दूसरा दिमाग मेमोरी",
    "title-history": "अध्ययन इतिहास",
    "title-data": "डेटा नियंत्रण",
    "title-ethics": "जिम्मेदार एआई डिजाइन",
    "state-neutral": "सामान्य",
    "state-focused": "एकाग्र / शांत",
    "state-stressed": "तनावग्रस्त",
    "state-overwhelmed": "अत्यधिक तनाव",
    "state-waiting": "प्रतीक्षा",
    "hero-eyebrow": "लोकल जावास्क्रिप्ट सिस्टम",
    "hero-heading": "जब काम बिखरा हुआ या तनावपूर्ण लगे, तो कोग्नीफ्लो अगला कदम तय करने में मदद करता है।",
    "hero-desc": "छात्र कार्य, नोट्स, अध्ययन लॉग और अपना विवरण लिखते हैं। कोग्नीफ्लो कार्यभार का विश्लेषण करता है, तनाव के संकेतों को पहचानता है, प्रासंगिक नोट्स ढूंढता है और एक ऐसा स्टडी प्लान बनाता है जिसे छात्र स्वीकार, संपादित या अस्वीकार कर सकता है।",
    "btn-see-steps": "डेमो चरण देखें",
    "btn-use-system": "सिस्टम का उपयोग करें",
    "sample-output": "नमूना आउटपुट",
    "sample-plan-1": "केवल 25 मिनट के लिए 'डीबीएमएस रिवीजन' पर काम करें।",
    "sample-plan-2": "शुरू करने से पहले मेमोरी नोट 'डीबीएमएस रिवीजन चेकलिस्ट' देखें।",
    "sample-plan-3": "पहला ब्लॉक पूरा होने तक गैर-जरूरी कार्यों को छिपाएं।",
    "feature-prob-title": "समस्या",
    "feature-prob-desc": "छात्रों को परीक्षा, असाइनमेंट और व्यक्तिगत दबाव का एक साथ सामना करना पड़ता है। सबसे कठिन काम अगला कदम तय करना है।",
    "feature-input-title": "इनपुट",
    "feature-input-desc": "सिस्टम एक चेक-इन वाक्य, शैक्षणिक कार्य, कोर्स नोट्स और अध्ययन इतिहास लॉग स्वीकार करता है।",
    "feature-ai-title": "एआई लॉजिक",
    "feature-ai-desc": "यह स्थानीय कीवर्ड/एनएलपी संकेतों, कार्य की तात्कालिकता और अध्ययन इतिहास का उपयोग करता है। किसी भुगतान की आवश्यकता नहीं है।",
    "feature-out-title": "आउटपुट",
    "feature-out-desc": "यह मानसिक स्थिति, आत्मविश्वास स्कोर, प्रासंगिक नोट्स और एक स्टडी प्लान प्रदान करता।",
    "feature-help-title": "मददगार क्यों है",
    "feature-help-desc": "तनावग्रस्त छात्र को एक लंबी सामान्य सूची के बजाय एक छोटा और स्पष्ट पहला कदम मिलता है।",
    "feature-priv-title": "गोपनीयता",
    "feature-priv-desc": "सभी डेमो डेटा ब्राउज़र के लोकल स्टोरेज में सुरक्षित रहता है। कोई सर्वर अपलोड नहीं होता।",
    "demo-title": "गैर-तकनीकी डेमो",
    "btn-load-sample": "नमूना लोड करें",
    "demo-desc": "किसी भी गैर-तकनीकी व्यक्ति को 2-3 मिनट में कोग्नीफ्लो समझाने के लिए इस फ्लो का उपयोग करें।",
    "demo-step1-title": "1. छात्र चेक-इन लिखता है",
    "demo-step1-desc": "उदाहरण: मैं तनाव में हूँ क्योंकि कल मेरा टेस्ट है और मेरी तैयारी कमजोर है।",
    "demo-step2-title": "2. छात्र कार्य जोड़ता है",
    "demo-step2-desc": "उदाहरण कार्यों में रिवीजन, असाइनमेंट और नोट्स बनाना शामिल हैं।",
    "demo-step3-title": "3. छात्र नोट्स सुरक्षित करता है",
    "demo-step3-desc": "मेमोरी में रिवीजन चेकलिस्ट और महत्वपूर्ण नोट्स स्टोर किए जाते हैं।",
    "demo-step4-title": "4. कोग्नीफ्लो विश्लेषण करता है",
    "demo-step4-desc": "यह तनाव के शब्दों, समय सीमा और अध्ययन इतिहास का विश्लेषण करता है।",
    "demo-step5-title": "5. कोग्नीफ्लो प्लान देता है",
    "demo-step5-desc": "यह एक छोटा एक्शन प्लान, प्रासंगिक नोट्स के सुझाव और आत्मविश्वास स्कोर दिखाता है।",
    "demo-step6-title": "6. छात्र नियंत्रण में रहता है",
    "demo-step6-desc": "छात्र सिफारिश को स्वीकार, संपादित या अस्वीकार कर सकता है।",
    "btn-open-dashboard": "बनाया गया आउटपुट खोलें",
    "btn-view-guardrails": "दिशानिर्देश देखें",
    "expected-output-title": "अपेक्षित डेमो आउटपुट",
    "expected-out-1": "स्थिति अत्यधिक तनाव की है क्योंकि चेक-इन में तनाव के शब्द और तत्काल कार्य हैं।",
    "expected-out-2-title": "प्राप्त नोट",
    "expected-out-2-desc": "जब सक्रिय कार्य डीबीएमएस हो तो डीबीएमएस के नोट्स पहले दिखाई देते हैं।",
    "expected-out-3-title": "अनुकूल स्टडी प्लान",
    "expected-out-3-desc": "पहला काम 25 मिनट का स्टडी ब्लॉक बन जाता है, न कि कोई लंबा टाइम-टेबल।",
    "expected-out-4-title": "मददगार परिणाम",
    "expected-out-4-desc": "छात्र को पता चल जाता है कि पहले क्या करना है और वह शुरू करने से पहले बदलाव कर सकता है।",
    "checkin-title": "छात्र चेक-इन",
    "checkin-label": "आप कैसा महसूस कर रहे हैं और क्या हो रहा है?",
    "btn-analyze": "विश्लेषण करें और योजना बनाएं",
    "btn-clear-checkin": "चेक-इन साफ़ करें",
    "cognitive-state-title": "संज्ञानात्मक स्थिति",
    "state-details-placeholder": "मानसिक भार का अनुमान लगाने के लिए एक चेक-इन वाक्य लिखें।",
    "recom-plan-title": "सिफारिश की गई योजना",
    "btn-accept": "स्वीकार करें",
    "btn-edit": "संपादित करें",
    "btn-reject": "अस्वीकार करें",
    "human-loop-note": "अंतिम निर्णय छात्र का होता है। कोग्नीफ्लो केवल सिफारिश करता है।",
    "workspace-summary-title": "कार्यक्षेत्र का सारांश",
    "summary-tasks": "कार्य",
    "summary-notes": "नोट्स",
    "summary-logs": "लॉग्स",
    "summary-weak": "कमजोरियां",
    "stat-avg-session": "औसत समय",
    "stat-top-course": "शीर्ष विषय",
    "add-task-title": "कार्य जोड़ें",
    "btn-clear-done": "पूरा साफ़ करें",
    "field-task": "कार्य",
    "field-course": "कोर्स",
    "field-due": "अंतिम तिथि",
    "field-priority": "प्राथमिकता",
    "field-effort": "आवश्यक मिनट",
    "field-status": "स्थिति",
    "btn-save-task": "कार्य सहेजें",
    "btn-cancel-edit": "संपादन रद्द",
    "tasks-list-title": "कार्य सूची",
    "btn-clear-all": "सभी साफ़ करें",
    "kb-title": "ज्ञान मेमोरी (मेमोरी)",
    "btn-save-note": "नोट सहेजें",
    "field-title": "शीर्षक",
    "field-note": "विवरण",
    "ask-sb-title": "दूसरे दिमाग से पूछें",
    "btn-search": "खोजें",
    "field-question": "प्रश्न",
    "saved-notes-title": "सहेजे गए नोट्स",
    "btn-clear-notes": "नोट्स साफ़ करें",
    "add-log-title": "अध्ययन लॉग जोड़ें",
    "btn-save-log": "लॉग सहेजें",
    "field-date": "तारीख",
    "field-topic": "विषय",
    "field-minutes": "मिनट",
    "field-history-q": "इतिहास का प्रश्न",
    "field-reflection": "विचार / प्रतिक्रिया",
    "btn-answer-q": "प्रश्न का उत्तर दें",
    "history-ans-title": "अध्ययन इतिहास और उत्तर",
    "btn-clear-logs": "लॉग्स साफ़ करें",
    "history-placeholder": "कोई प्रश्न पूछें या अध्ययन लॉग जोड़ें।",
    "timeline-title": "अध्ययन टाइमलाइन",
    "data-ctrl-title": "डेटा नियंत्रण",
    "data-ctrl-desc": "डेटा निर्यात/आयात करें। रीसेट करने से सभी ब्राउज़र डेटा साफ़ हो जाएगा।",
    "btn-export": "निर्यात JSON",
    "btn-import": "आयात JSON",
    "btn-reset": "रीसेट करें",
    "accepted-plan-title": "स्वीकृत योजना",
    "ethics-title": "जिम्मेदार एआई नियंत्रण",
    "limits-title": "ज्ञात सीमाएं",
    "ethics-list-1": "डेमो डेटा लोकल ब्राउज़र स्टोरेज में सुरक्षित रहता है।",
    "ethics-list-2": "चिकित्सीय निदान या उपचार का कोई दावा नहीं है।",
    "ethics-list-3": "तनाव के संकेत और आत्मविश्वास स्कोर स्पष्ट रूप से दिखाई देते हैं।",
    "ethics-list-4": "योजना को स्वीकार करने से पहले छात्र की सहमति आवश्यक है।",
    "ethics-list-5": "डेटा को हटाने, रीसेट, निर्यात और आयात करने का पूर्ण नियंत्रण।",
    "limits-list-1": "कीवर्ड और पैटर्न-आधारित वर्गीकरण गलत हो सकता है।",
    "limits-list-2": "सिफारिशें निर्णय लेने में सहायता के लिए हैं, आदेश नहीं।",
    "limits-list-3": "डेमो केवल कृत्रिम उदाहरणों और उपयोगकर्ता इनपुट का उपयोग करता है।",
    "limits-list-4": "अत्यधिक मानसिक परेशानी की स्थिति में अपने करीबियों या आपातकालीन सहायता से संपर्क करें।",
    "edit-plan-title": "योजना को संपादित करें",
    "btn-save": "सहेजें",
    "btn-cancel": "रद्द करें",
    "btn-done": "पूर्ण",
    "btn-open": "दोबारा खोलें",
    "btn-delete": "हटाएं",
    "btn-update-task": "कार्य अपडेट करें",
    "btn-update-note": "नोट अपडेट करें",
    "btn-update-log": "लॉग अपडेट करें",
    "meta-overdue": "अतिदेय",
    "meta-due-today": "आज देय",
    "meta-due-tomorrow": "कल देय",
    "meta-due-in": "शेष",
    "meta-days": "दिन",
    "meta-no-tasks": "अभी तक कोई कार्य नहीं। ऊपर एक जोड़ें।",
    "meta-no-notes": "अभी तक कोई नोट सहेजा नहीं गया।",
    "meta-no-logs": "अभी तक कोई अध्ययन लॉग नहीं।",
    "meta-no-weak": "कोई कमजोर विषय नहीं मिला।",
    "meta-saved": "सहेजा गया",
    "meta-enter-question": "अपने नोट्स में खोजने के लिए प्रश्न लिखें।",
    "meta-no-match": "कोई मेल खाता नोट नहीं मिला।",
    "meta-add-tasks-plan": "योजना बनाने के लिए कार्य जोड़ें और चेक-इन लिखें।",
    "meta-no-accepted": "अभी तक कोई योजना स्वीकार नहीं की गई।",
    "err-task-title": "कार्य शीर्षक कम से कम 3 अक्षर होना चाहिए।",
    "err-task-due": "कृपया अंतिम तिथि चुनें।",
    "err-task-effort": "कम से कम 5 मिनट आवश्यक हैं।",
    "err-note-title": "नोट शीर्षक कम से कम 3 अक्षर होना चाहिए।",
    "err-note-body": "नोट विवरण कम से कम 3 शब्द होना चाहिए।",
    "err-log-date": "कृपया अध्ययन तिथि चुनें।",
    "err-log-topic": "विषय कम से कम 3 अक्षर होना चाहिए।",
    "err-log-minutes": "कम से कम 5 मिनट दर्ज करें।",
    "err-checkin-length": "चेक-इन कम से कम 3 शब्दों का होना चाहिए।",
    "err-ask-q": "पहले प्रश्न लिखें।",
    "toast-task-saved": "कार्य सहेजा गया।",
    "toast-note-saved": "नोट सहेजा गया।",
    "toast-log-saved": "अध्ययन लॉग सहेजा गया।",
    "toast-done-cleared": "पूर्ण कार्य साफ़ हो गए।",
    "toast-plan-generated": "योजना तैयार हो गई!",
    "toast-plan-accepted": "योजना स्वीकार की गई।",
    "toast-plan-rejected": "योजना अस्वीकार की गई।",
    "toast-edited-saved": "संपादित योजना सहेजी गई।",
    "toast-generate-plan": "पहले योजना तैयार करें।",
    "toast-sample-loaded": "नमूना परिदृश्य लोड हो गया।",
    "toast-export-downloaded": "डेटा निर्यात हो गया।",
    "toast-data-imported": "डेटा आयात हो गया।",
    "toast-invalid-json": "अमान्य JSON फ़ाइल।",
    "toast-app-reset": "ऐप रीसेट हो गई है।",
    "toast-cleared": "डेटा साफ़ हो गया।",
    "desc-focused": "आप एकाग्र और तैयार लग रहे हैं। गहन कार्य का समय है।",
    "desc-neutral": "सामान्य स्थिति। आप आत्मविश्वास से योजना बना सकते हैं।",
    "desc-stressed": "मध्यम तनाव महसूस हो रहा है। सबसे जरूरी काम पहले करें।",
    "desc-overwhelmed": "अत्यधिक तनाव महसूस हो रहा है। केवल सबसे छोटा जरूरी कदम उठाएं।",
    "plan-step-add-tasks": "योजना बनाने के लिए कार्य जोड़ें।",
    "plan-step-write-checkin": "अपनी स्थिति बताते हुए एक संक्षिप्त चेक-इन लिखें।",
    "plan-step-rerun": "सिफारिशें प्राप्त करने के लिए 'विश्लेषण करें' पर क्लिक करें।",
    "plan-open-note": "मेमोरी नोट खोलें",
    "plan-before-starting": "शुरू करने से पहले",
    "plan-use-latest-notes": "शुरू करने से पहले अपने नोट्स देखें।",
    "plan-rapid-revise": "कमजोर विषय की त्वरित समीक्षा",
    "plan-work-on": "इस पर काम करें:",
    "plan-25-min-only": "केवल 25 मिनट के लिए",
    "plan-do-subtask": "फिर एक छोटा उप-कार्य करें",
    "plan-after-reset": "एक छोटे विराम के बाद",
    "plan-take-reset": "अगले ब्लॉक से पहले 5 मिनट का विराम लें।",
    "plan-hide-non-urgent": "पहला ब्लॉक पूरा होने तक गैर-जरूरी कार्य छिपाएं।",
    "plan-protect-50": "50 मिनट सुरक्षित रखें",
    "plan-schedule": "शेड्यूल करें",
    "plan-after-break": "विराम के बाद",
    "plan-review-result": "परिणाम की समीक्षा करें और आवश्यकता हो तो समायोजित करें।",
    "plan-move-low-priority": "यदि आवश्यक हो तो कम प्राथमिकता वाले कार्य कल पर स्थानांतरित करें।",
    "plan-start-90": "90 मिनट का गहन कार्य ब्लॉक शुरू करें",
    "plan-batch-next": "अगला कार्य जोड़ें",
    "plan-write-summary": "आपने जो पूरा किया उसका संक्षिप्त सारांश लिखें।",
    "plan-complete-urgent": "सबसे जरूरी कार्य पहले पूरा करें",
    "plan-prepare-materials": "के लिए सामग्री तैयार करें",
    "plan-add-concrete": "यह पूरा करने के बाद एक ठोस अगला कार्य जोड़ें।",
    "plan-review-after-block": "एक अध्ययन ब्लॉक के बाद अपनी प्रगति की समीक्षा करें।",
    "plan-loop-accepted": "योजना स्वीकार की गई। आप नियंत्रण में हैं।",
    "plan-loop-rejected": "योजना अस्वीकार की गई। आप नया चेक-इन लिख सकते हैं।",
    "plan-loop-edited": "संपादित योजना सहेजी गई।",
    "confirm-reset": "क्या आप वाकई सभी डेटा रीसेट करना चाहते हैं?",
    "confirm-clear": "क्या आप वाकई साफ़ करना चाहते हैं",
    "history-not-found-date": "इस तिथि के लिए कोई रिकॉर्ड नहीं मिला",
    "history-not-found": "कोई मेल खाता अध्ययन रिकॉर्ड नहीं मिला।"
  },
  bn: {
    "brand-title": "কগনিফ্লো",
    "brand-subtitle": "আবেগ-সচেতন দ্বিতীয় মস্তিষ্ক",
    "select-lang": "ভাষা:",
    "theme-dark": "ডার্ক মোড",
    "theme-light": "লাইট মোড",
    "nav-home": "হোম",
    "nav-demo": "ডেমো গাইড",
    "nav-dashboard": "ড্যাশবোর্ড",
    "nav-tasks": "টাস্ক সমূহ",
    "nav-memory": "মেমরি",
    "nav-history": "অধ্যয়ন ইতিহাস",
    "nav-data": "ডেটা",
    "nav-ethics": "এআই নির্দেশিকা",
    "privacy-title": "লোকাল ডেমো মোড",
    "privacy-desc": "আপনার তথ্য ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে। কোনো সার্ভার ব্যবহার করা হয় না।",
    "eyebrow": "শিক্ষার্থী পড়াশোনা সহকারী",
    "title-home": "প্রকল্পের ওভারভিউ",
    "title-demo": "ডেমো গাইড",
    "title-dashboard": "মানানসই পড়ার পরিকল্পনা",
    "title-tasks": "টাস্ক ম্যানেজার",
    "title-memory": "দ্বিতীয় মস্তিষ্ক মেমরি",
    "title-history": "অধ্যয়ন ইতিহাস",
    "title-data": "তথ্য নিয়ন্ত্রণ",
    "title-ethics": "দায়িত্বশীল এআই ডিজাইন",
    "state-neutral": "স্বাভাবিক",
    "state-focused": "মনোযোগী / শান্ত",
    "state-stressed": "চাপগ্রস্ত",
    "state-overwhelmed": "অত্যধিক মানসিক চাপ",
    "state-waiting": "অপেক্ষা",
    "hero-eyebrow": "লোকাল জাভাস্ক্রিপ্ট সিস্টেম",
    "hero-heading": "কাজ যখন খুব কঠিন বা এলোমেলো মনে হয়, কগনিফ্লো আপনাকে পরবর্তী পদক্ষেপ নিতে সাহায্য করে।",
    "hero-desc": "শিক্ষার্থীরা কাজ, নোট, অধ্যয়ন লগ এবং নিজেদের অনুভূতি জমা দেয়। কগনিফ্লো মানসিক অবস্থা বিশ্লেষণ করে, চাপের লক্ষণ খোঁজে, প্রাসঙ্গিক নোট উদ্ধার করে এবং একটি সুবিধাজনক পড়ার পরিকল্পনা তৈরি করে যা শিক্ষার্থী গ্রহণ বা বাতিল করতে পারে।",
    "btn-see-steps": "ডেমো ধাপগুলো দেখুন",
    "btn-use-system": "সিস্টেম ব্যবহার করুন",
    "sample-output": "নমুনা আউটপুট",
    "sample-plan-1": "শুধুমাত্র ২৫ মিনিটের জন্য 'ডিবিএমএস রিভিশন' নিয়ে কাজ করুন।",
    "sample-plan-2": "শুরু করার আগে 'ডিবিএমএস রিভিশন চেকলিস্ট' নোটটি খুলুন।",
    "sample-plan-3": "প্রথম ব্লক শেষ না হওয়া পর্যন্ত কম গুরুত্বপূর্ণ কাজগুলো লুকিয়ে রাখুন।",
    "feature-prob-title": "সমস্যা",
    "feature-prob-desc": "শিক্ষার্থীদের একই সাথে পরীক্ষা, অ্যাসাইনমেন্ট এবং ব্যক্তিগত চাপের মুখোমুখি হতে হয়। সবচেয়ে কঠিন কাজ হলো প্রথম পদক্ষেপটি ঠিক করা।",
    "feature-input-title": "ইনপুট",
    "feature-input-desc": "সিস্টেমটি একটি সংক্ষিপ্ত অনুভূতি বাক্য, একাডেমিক কাজ, কোর্সের নোট এবং অধ্যয়ন ইতিহাস গ্রহণ করে।",
    "feature-ai-title": "এআই লজিক",
    "feature-ai-desc": "এটি লোকাল কিওয়ার্ড/এনএলপি সংকেত, কাজের জরুরি অবস্থা এবং অধ্যয়ন ইতিহাসের ওপর কাজ করে। কোনো অতিরিক্ত চার্জ নেই।",
    "feature-out-title": "আউটপুট",
    "feature-out-desc": "এটি মানসিক অবস্থা, আত্মবিশ্বাসের মাত্রা, প্রাসঙ্গিক নোট এবং একটি মানানসই পড়ার পরিকল্পনা প্রদান করে।",
    "feature-help-title": "কেন সাহায্যকারী",
    "feature-help-desc": "মানসিক চাপে থাকা শিক্ষার্থী একটি দীর্ঘ তালিকার বদলে একটি ছোট এবং সহজ প্রথম পদক্ষেপ পায়।",
    "feature-priv-title": "গোপনীয়তা",
    "feature-priv-desc": "সব ডেমো তথ্য ব্রাউজারের লোকাল স্টোরেজে থাকে। কোনো সার্ভারে আপলোড করা হয় না।",
    "demo-title": "অ-প্রযুক্তিগত ডেমো",
    "btn-load-sample": "নমুনা লোড করুন",
    "demo-desc": "যেকোনো অ-প্রযুক্তিগত ব্যক্তিকে ২-৩ মিনিটে কগনিফ্লো বোঝাতে এই ফ্লোটি ব্যবহার করুন।",
    "demo-step1-title": "১. শিক্ষার্থী চেক-ইন লেখে",
    "demo-step1-desc": "উদাহরণ: আমার কালকে পরীক্ষা আছে এবং আমার প্রস্তুতি খুব দুর্বল, তাই আমি মানসিক চাপে আছি।",
    "demo-step2-title": "২. শিক্ষার্থী কাজ যোগ করে",
    "demo-step2-desc": "উদাহরণ কাজের মধ্যে রিভিশন, অ্যাসাইনমেন্ট এবং পড়া অন্তর্ভুক্ত রয়েছে।",
    "demo-step3-title": "৩. শিক্ষার্থী নোট সেভ করে",
    "demo-step3-desc": "মেমরিতে রিভিশন চেকলিস্ট এবং প্রয়োজনীয় নোট সংরক্ষণ করা হয়।",
    "demo-step4-title": "৪. কগনিফ্লো বিশ্লেষণ করে",
    "demo-step4-desc": "এটি মানসিক চাপের শব্দ, পরীক্ষার সময়সীমা এবং অধ্যয়ন ইতিহাস বিশ্লেষণ করে।",
    "demo-step5-title": "৫. কগনিফ্লো পড়ার প্ল্যান দেয়",
    "demo-step5-desc": "এটি একটি ছোট কর্মপরিকল্পনা, প্রাসঙ্গিক নোটের পরামর্শ এবং আত্মবিশ্বাসের মাত্রা দেখায়।",
    "demo-step6-title": "৬. শিক্ষার্থী নিয়ন্ত্রণে থাকে",
    "demo-step6-desc": "শিক্ষার্থী চাইলে এই পরিকল্পনা গ্রহণ, সংশোধন বা প্রত্যাখ্যান করতে পারে।",
    "btn-open-dashboard": "তৈরিকৃত আউটপুট খুলুন",
    "btn-view-guardrails": "নীতিমালা দেখুন",
    "expected-output-title": "প্রত্যাশিত ডেমো আউটপুট",
    "expected-out-1": "মানসিক চাপ অত্যধিক কারণ চেক-ইন বাক্যে চাপের শব্দ এবং জরুরি কাজ রয়েছে।",
    "expected-out-2-title": "উদ্ধারকৃত নোট",
    "expected-out-2-desc": "সক্রিয় কাজটি ডিবিএমএস হলে ডিবিএমএস সংক্রান্ত নোটগুলো প্রথমে দেখায়।",
    "expected-out-3-title": "মানানসই পরিকল্পনা",
    "expected-out-3-desc": "প্রথম কাজটি ২৫ মিনিটের একটি সংক্ষিপ্ত স্টাডি ব্লক হয়, কোনো দীর্ঘ সময়সূচী নয়।",
    "expected-out-4-title": "সাহায্যকারী ফলাফল",
    "expected-out-4-desc": "শিক্ষার্থী জানতে পারে প্রথমে কী করতে হবে এবং শুরু করার আগে এটি পরিবর্তন করতে পারে।",
    "checkin-title": "শিক্ষার্থীর চেক-ইন",
    "checkin-label": "আপনি কেমন অনুভব করছেন এবং কী ঘটছে?",
    "btn-analyze": "বিশ্লেষণ ও পরিকল্পনা করুন",
    "btn-clear-checkin": "চেক-ইন মুছুন",
    "cognitive-state-title": "মানসিক অবস্থা",
    "state-details-placeholder": "মানসিক চাপ পরিমাপের জন্য একটি অনুভূতি বাক্য লিখুন।",
    "recom-plan-title": "সুপারিশকৃত পরিকল্পনা",
    "btn-accept": "গ্রহণ করুন",
    "btn-edit": "সম্পাদনা করুন",
    "btn-reject": "প্রত্যাখ্যান করুন",
    "human-loop-note": "চূড়ান্ত সিদ্ধান্ত শিক্ষার্থীর। কগনিফ্লো কেবল সুপারিশ করে।",
    "workspace-summary-title": "কাজের সারসংক্ষেপ",
    "summary-tasks": "টাস্ক",
    "summary-notes": "নোট",
    "summary-logs": "লগ",
    "summary-weak": "দুর্বলতা",
    "stat-avg-session": "গড় সময়",
    "stat-top-course": "সেরা কোর্স",
    "add-task-title": "টাস্ক যোগ করুন",
    "btn-clear-done": "সম্পূর্ণ মুছুন",
    "field-task": "টাস্ক",
    "field-course": "কোর্স",
    "field-due": "শেষ তারিখ",
    "field-priority": "অগ্রাধিকার",
    "field-effort": "প্রয়োজনীয় মিনিট",
    "field-status": "অবস্থা",
    "btn-save-task": "টাস্ক সংরক্ষণ করুন",
    "btn-cancel-edit": "সম্পাদনা বাতিল",
    "tasks-list-title": "টাস্ক তালিকা",
    "btn-clear-all": "সব মুছুন",
    "kb-title": "জ্ঞান মেমরি (নোট)",
    "btn-save-note": "নোট সংরক্ষণ করুন",
    "field-title": "শিরোনাম",
    "field-note": "নোট বিবরণ",
    "ask-sb-title": "দ্বিতীয় মস্তিষ্ককে জিজ্ঞাসা করুন",
    "btn-search": "অনুসন্ধান",
    "field-question": "প্রশ্ন",
    "saved-notes-title": "সংরক্ষিত নোট সমূহ",
    "btn-clear-notes": "নোট মুছুন",
    "add-log-title": "অধ্যয়ন লগ যোগ করুন",
    "btn-save-log": "লগ সংরক্ষণ করুন",
    "field-date": "তারিখ",
    "field-topic": "বিষয়",
    "field-minutes": "মিনিট",
    "field-history-q": "ইতিহাসের প্রশ্ন",
    "field-reflection": "অনুভূতি / প্রতিক্রিয়া",
    "btn-answer-q": "প্রশ্নের উত্তর দিন",
    "history-ans-title": "ইতিহাস টাইমলাইন ও উত্তর",
    "btn-clear-logs": "লগ মুছুন",
    "history-placeholder": "যেকোনো প্রশ্ন করুন অথবা স্টাডি লগ যোগ করুন।",
    "timeline-title": "অধ্যয়ন টাইমলাইন",
    "data-ctrl-title": "তথ্য নিয়ন্ত্রণ",
    "data-ctrl-desc": "তথ্য এক্সপোর্ট/ইম্পোর্ট করুন। রিসেট করলে ব্রাউজারের সব তথ্য মুছে যাবে।",
    "btn-export": "JSON এক্সপোর্ট",
    "btn-import": "JSON ইম্পোর্ট",
    "btn-reset": "রিসেট করুন",
    "accepted-plan-title": "গৃহীত পরিকল্পনা",
    "ethics-title": "দায়িত্বশীল এআই নীতিমালা",
    "limits-title": "সীমাবদ্ধতা সমূহ",
    "ethics-list-1": "ডেমো তথ্য শুধুমাত্র লোকাল ব্রাউজার স্টোরেজে সংরক্ষিত থাকে।",
    "ethics-list-2": "কোনো চিকিৎসা সংক্রান্ত বা থেরাপির দাবি করা হয় না।",
    "ethics-list-3": "মানসিক চাপের লক্ষণ ও আত্মবিশ্বাসের মাত্রা স্বচ্ছভাবে প্রদর্শিত হয়।",
    "ethics-list-4": "পরিকল্পনাটি কার্যকর করার আগে শিক্ষার্থীর সম্মতি প্রয়োজন।",
    "ethics-list-5": "তথ্য মুছে ফেলা, রিসেট, এক্সপোর্ট এবং ইম্পোর্ট করার সম্পূর্ণ নিয়ন্ত্রণ রয়েছে।",
    "limits-list-1": "কিওয়ার্ড এবং প্যাটার্ন ভিত্তিক শ্রেণীকরণ ভুল হতে পারে।",
    "limits-list-2": "সুপারিশগুলো সিদ্ধান্ত গ্রহণের সহায়তার জন্য, কোনো নির্দেশ নয়।",
    "limits-list-3": "ডেমোটি শুধুমাত্র কৃত্রিম নমুনা এবং ব্যবহারকারীর তথ্যের ওপর কাজ করে।",
    "limits-list-4": "চরম মানসিক চাপের ক্ষেত্রে কোনো নির্ভরযোগ্য ব্যক্তি বা জরুরি সেবায় যোগাযোগ করুন।",
    "edit-plan-title": "গৃহীত পরিকল্পনা সংশোধন করুন",
    "btn-save": "সংরক্ষণ করুন",
    "btn-cancel": "বাতিল করুন",
    "btn-done": "সম্পূর্ণ",
    "btn-open": "পুনরায় খুলুন",
    "btn-delete": "মুছুন",
    "btn-update-task": "টাস্ক আপডেট করুন",
    "btn-update-note": "নোট আপডেট করুন",
    "btn-update-log": "লগ আপডেট করুন",
    "meta-overdue": "মেয়াদ শেষ",
    "meta-due-today": "আজ শেষ তারিখ",
    "meta-due-tomorrow": "কাল শেষ তারিখ",
    "meta-due-in": "বাকি",
    "meta-days": "দিন",
    "meta-no-tasks": "এখনো কোনো টাস্ক নেই। উপরে একটি যোগ করুন।",
    "meta-no-notes": "এখনো কোনো নোট সংরক্ষণ হয়নি।",
    "meta-no-logs": "এখনো কোনো অধ্যয়ন লগ নেই।",
    "meta-no-weak": "কোনো দুর্বল বিষয় পাওয়া যায়নি।",
    "meta-saved": "সংরক্ষিত",
    "meta-enter-question": "আপনার নোটে খোঁজার জন্য প্রশ্ন লিখুন।",
    "meta-no-match": "কোনো মিলিত নোট পাওয়া যায়নি।",
    "meta-add-tasks-plan": "পরিকল্পনা তৈরি করতে টাস্ক যোগ করুন এবং চেক-ইন লিখুন।",
    "meta-no-accepted": "এখনো কোনো পরিকল্পনা গৃহীত হয়নি।",
    "err-task-title": "টাস্কের শিরোনাম কমপক্ষে ৩ অক্ষর হতে হবে।",
    "err-task-due": "অনুগ্রহ করে শেষ তারিখ নির্বাচন করুন।",
    "err-task-effort": "কমপক্ষে ৫ মিনিট প্রয়োজন।",
    "err-note-title": "নোটের শিরোনাম কমপক্ষে ৩ অক্ষর হতে হবে।",
    "err-note-body": "নোটের বিবরণ কমপক্ষে ৩ শব্দ হতে হবে।",
    "err-log-date": "অনুগ্রহ করে অধ্যয়নের তারিখ নির্বাচন করুন।",
    "err-log-topic": "বিষয় কমপক্ষে ৩ অক্ষর হতে হবে।",
    "err-log-minutes": "কমপক্ষে ৫ মিনিট দিন।",
    "err-checkin-length": "চেক-ইন কমপক্ষে ৩ শব্দের হতে হবে।",
    "err-ask-q": "প্রথমে প্রশ্ন লিখুন।",
    "toast-task-saved": "টাস্ক সংরক্ষিত।",
    "toast-note-saved": "নোট সংরক্ষিত।",
    "toast-log-saved": "অধ্যয়ন লগ সংরক্ষিত।",
    "toast-done-cleared": "সম্পূর্ণ টাস্ক মুছে ফেলা হয়েছে।",
    "toast-plan-generated": "পরিকল্পনা তৈরি হয়েছে!",
    "toast-plan-accepted": "পরিকল্পনা গৃহীত হয়েছে।",
    "toast-plan-rejected": "পরিকল্পনা প্রত্যাখ্যান করা হয়েছে।",
    "toast-edited-saved": "সংশোধিত পরিকল্পনা সংরক্ষিত।",
    "toast-generate-plan": "প্রথমে পরিকল্পনা তৈরি করুন।",
    "toast-sample-loaded": "নমুনা দৃশ্যকল্প লোড হয়েছে।",
    "toast-export-downloaded": "তথ্য এক্সপোর্ট হয়েছে।",
    "toast-data-imported": "তথ্য ইম্পোর্ট হয়েছে।",
    "toast-invalid-json": "অবৈধ JSON ফাইল।",
    "toast-app-reset": "অ্যাপ রিসেট হয়ে গেছে।",
    "toast-cleared": "তথ্য মুছে ফেলা হয়েছে।",
    "desc-focused": "আপনি মনোযোগী এবং প্রস্তুত। গভীর কাজের সময়।",
    "desc-neutral": "স্বাভাবিক অবস্থা। আত্মবিশ্বাসের সাথে পরিকল্পনা করুন।",
    "desc-stressed": "মাঝারি মানসিক চাপ অনুভব হচ্ছে। সবচেয়ে জরুরি কাজ আগে করুন।",
    "desc-overwhelmed": "অত্যধিক চাপ অনুভব হচ্ছে। শুধু সবচেয়ে ছোট জরুরি পদক্ষেপ নিন।",
    "plan-step-add-tasks": "পরিকল্পনা তৈরি করতে টাস্ক যোগ করুন।",
    "plan-step-write-checkin": "আপনার অবস্থা বর্ণনা করে একটি সংক্ষিপ্ত চেক-ইন লিখুন।",
    "plan-step-rerun": "সুপারিশ পেতে 'বিশ্লেষণ করুন' ক্লিক করুন।",
    "plan-open-note": "মেমরি নোট খুলুন",
    "plan-before-starting": "শুরু করার আগে",
    "plan-use-latest-notes": "শুরু করার আগে আপনার নোটগুলো দেখুন।",
    "plan-rapid-revise": "দুর্বল বিষয়ের দ্রুত রিভিশন",
    "plan-work-on": "এটিতে কাজ করুন:",
    "plan-25-min-only": "শুধুমাত্র ২৫ মিনিটের জন্য",
    "plan-do-subtask": "তারপর একটি ছোট উপ-কাজ করুন",
    "plan-after-reset": "একটি সংক্ষিপ্ত বিরতির পর",
    "plan-take-reset": "পরবর্তী ব্লকের আগে ৫ মিনিটের বিরতি নিন।",
    "plan-hide-non-urgent": "প্রথম ব্লক শেষ না হওয়া পর্যন্ত কম গুরুত্বপূর্ণ কাজ লুকান।",
    "plan-protect-50": "৫০ মিনিট সুরক্ষিত রাখুন",
    "plan-schedule": "সময়সূচি করুন",
    "plan-after-break": "বিরতির পর",
    "plan-review-result": "ফলাফল পর্যালোচনা করুন এবং প্রয়োজনে সমন্বয় করুন।",
    "plan-move-low-priority": "প্রয়োজন হলে কম অগ্রাধিকার কাজ কাল পর্যন্ত সরিয়ে দিন।",
    "plan-start-90": "৯০ মিনিটের গভীর কাজের ব্লক শুরু করুন",
    "plan-batch-next": "পরবর্তী টাস্ক যোগ করুন",
    "plan-write-summary": "আপনি যা সম্পন্ন করেছেন তার সংক্ষিপ্ত সারসংক্ষেপ লিখুন।",
    "plan-complete-urgent": "সবচেয়ে জরুরি টাস্ক আগে সম্পূর্ণ করুন",
    "plan-prepare-materials": "এর জন্য উপকরণ প্রস্তুত করুন",
    "plan-add-concrete": "এটি সম্পূর্ণ করার পর একটি সুনির্দিষ্ট পরবর্তী টাস্ক যোগ করুন।",
    "plan-review-after-block": "একটি অধ্যয়ন ব্লকের পর আপনার অগ্রগতি পর্যালোচনা করুন।",
    "plan-loop-accepted": "পরিকল্পনা গৃহীত। আপনি নিয়ন্ত্রণে আছেন।",
    "plan-loop-rejected": "পরিকল্পনা প্রত্যাখ্যান করা হয়েছে। আপনি নতুন চেক-ইন লিখতে পারেন।",
    "plan-loop-edited": "সংশোধিত পরিকল্পনা সংরক্ষিত।",
    "confirm-reset": "আপনি কি সত্যিই সব তথ্য রিসেট করতে চান?",
    "confirm-clear": "আপনি কি সত্যিই মুছতে চান",
    "history-not-found-date": "এই তারিখের জন্য কোনো রেকর্ড পাওয়া যায়নি",
    "history-not-found": "কোনো মিলিত অধ্যয়ন রেকর্ড পাওয়া যায়নি।"
  }
};

const sampleScenario = {
  checkin: "I have a database quiz tomorrow, an AI assignment due tonight, and a family event. I feel overwhelmed and I don't know what to study first. I revised SQL but normalization is still weak.",
  tasks: [
    { title: "Revise DBMS normalization", course: "DBMS", priority: 5, effortMinutes: 30, due: todayOffset(1), status: "open" },
    { title: "Finish AI assignment guardrails", course: "AI", priority: 4, effortMinutes: 60, due: todayOffset(0), status: "open" },
    { title: "Read operating systems chapter", course: "OS", priority: 2, effortMinutes: 90, due: todayOffset(4), status: "open" }
  ],
  notes: [
    { title: "DBMS weak topics", body: "Normalization, functional dependency, and transaction isolation need revision before the quiz." },
    { title: "AI assignment rubric", body: "Explain NLP, pattern detection, responsible AI guardrails, and human-in-the-loop design." },
    { title: "DBMS revision checklist", body: "Prioritize normalization, SQL joins, ER diagrams, and transaction isolation." }
  ],
  logs: [
    { studyDate: todayOffset(-1), course: "DBMS", topic: "SQL joins and basic normalization", minutes: 45, reflection: "SQL was okay, but 2NF and 3NF still felt weak." },
    { studyDate: todayOffset(-2), course: "AI", topic: "Responsible AI guardrails", minutes: 35, reflection: "Understood privacy and human-in-the-loop examples." },
    { studyDate: todayOffset(-7), course: "DBMS", topic: "Entity relationship diagrams", minutes: 30, reflection: "Need one more practice question." }
  ]
};

const emptyState = {
  tasks: [],
  notes: [],
  studyLogs: [],
  acceptedPlan: [],
  lastCheckin: "",
  lastAnalysis: null,
  retrievalMode: "tfidf",
  language: "en",
  theme: "dark"
};

// NLP & Vector Math Classes
class TfidfVectorizer {
  constructor() {
    this.idf = {};
  }
  fit(documents) {
    const docCount = Math.max(documents.length, 1);
    const df = {};
    documents.forEach((doc) => {
      const uniqueTokens = new Set(tokenize(doc));
      uniqueTokens.forEach((term) => {
        df[term] = (df[term] || 0) + 1;
      });
    });
    this.idf = {};
    for (const term in df) {
      this.idf[term] = Math.log((1 + docCount) / (1 + df[term])) + 1;
    }
    return this;
  }
  transformOne(document) {
    const tokens = tokenize(document);
    const counts = {};
    tokens.forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
    const total = tokens.length || 1;
    const vector = {};
    for (const term in counts) {
      vector[term] = (counts[term] / total) * (this.idf[term] || 1.0);
    }
    return vector;
  }
  fitTransform(documents) {
    this.fit(documents);
    return documents.map((doc) => this.transformOne(doc));
  }
}

class HashingEmbeddingModel {
  constructor(dimensions = 128) {
    this.dimensions = dimensions;
  }
  encodeOne(text) {
    const vector = {};
    const tokens = tokenize(text);
    tokens.forEach((token) => {
      const hash = simpleHash(token);
      const index = Math.abs(hash) % this.dimensions;
      const key = `d${index}`;
      vector[key] = (vector[key] || 0.0) + 1.0;
    });
    return vector;
  }
}

class CognitiveStateClassifier {
  constructor() {
    this.vectorizer = new TfidfVectorizer();
    this.labelCounts = {};
    this.termCounts = {};
    this.termTotals = {};
    this.vocabulary = new Set();
    this.isTrained = false;
  }
  train(cases) {
    const texts = cases.map((c) => c.checkIn);
    const vectors = this.vectorizer.fitTransform(texts);
    const labels = ["focused", "neutral", "stressed", "overwhelmed"];
    labels.forEach((label) => {
      this.labelCounts[label] = 0;
      this.termCounts[label] = {};
      this.termTotals[label] = 0;
    });
    cases.forEach((c, idx) => {
      const label = c.label;
      this.labelCounts[label] = (this.labelCounts[label] || 0) + 1;
      const vector = vectors[idx];
      for (const term in vector) {
        const val = vector[term];
        const count = Math.max(1, Math.round(val * 10));
        this.termCounts[label][term] = (this.termCounts[label][term] || 0) + count;
        this.termTotals[label] = (this.termTotals[label] || 0) + count;
        this.vocabulary.add(term);
      }
    });
    this.isTrained = true;
  }
  predict(checkIn, tasksCount, urgentTasks) {
    if (!this.isTrained) return { label: "neutral", confidence: 1.0, reasons: [] };
    const vector = this.vectorizer.transformOne(checkIn);
    const totalCases = Object.values(this.labelCounts).reduce((a, b) => a + b, 0) || 1;
    const vocabSize = Math.max(this.vocabulary.size, 1);
    const scores = {};
    const labels = ["focused", "neutral", "stressed", "overwhelmed"];
    labels.forEach((label) => {
      const priorCount = this.labelCounts[label] || 0;
      let score = Math.log((priorCount + 1) / (totalCases + labels.length));
      const denominator = (this.termTotals[label] || 0) + vocabSize;
      for (const term in vector) {
        const val = vector[term];
        const count = this.termCounts[label][term] || 0;
        score += val * Math.log((count + 1) / denominator);
      }
      score += this._workloadAdjustment(label, tasksCount, urgentTasks);
      scores[label] = score;
    });
    const probabilities = softmax(scores);
    let bestLabel = "neutral";
    let maxProb = -1;
    for (const label in probabilities) {
      if (probabilities[label] > maxProb) {
        maxProb = probabilities[label];
        bestLabel = label;
      }
    }
    return {
      label: bestLabel,
      confidence: maxProb,
      probabilities,
      reasons: this._reasons(checkIn, tasksCount, urgentTasks)
    };
  }
  _workloadAdjustment(label, tasksCount, urgentTasks) {
    const pressure = tasksCount * 0.2 + urgentTasks * 0.5;
    if (label === "overwhelmed") return pressure;
    if (label === "stressed") return pressure * 0.55;
    if (label === "focused") return -pressure * 0.35;
    return -Math.abs(pressure - 0.4) * 0.15;
  }
  _reasons(checkIn, tasksCount, urgentTasks) {
    const signals = extractTextSignals(checkIn);
    const reasons = [];
    if (signals.stressHits.length) reasons.push("stress: " + signals.stressHits.slice(0, 4).join(", "));
    if (signals.focusHits.length) reasons.push("focus: " + signals.focusHits.slice(0, 4).join(", "));
    if (urgentTasks) reasons.push(`${urgentTasks} urgent task(s)`);
    reasons.push(`${tasksCount} active task(s)`);
    if (signals.wordCount > 35) reasons.push("long check-in");
    return reasons;
  }
}

// Global state variables
let state = loadState();
let latestPlan = [];
let editingTaskId = null;
let editingNoteId = null;
let editingLogId = null;

// Initialize Naive Bayes ML Classifier
const mlClassifier = new CognitiveStateClassifier();
mlClassifier.train(trainingCases);

const els = {
  dateStamp: qs("#dateStamp"), stateBadge: qs("#stateBadge"), toast: qs("#toast"),
  checkinText: qs("#checkinText"), checkinError: qs("#checkinError"), clearCheckinBtn: qs("#clearCheckinBtn"),
  analyzeBtn: qs("#analyzeBtn"), loadScenarioBtn: qs("#loadScenarioBtn"), stressMeter: qs("#stressMeter"),
  confidenceText: qs("#confidenceText"), stateDetails: qs("#stateDetails"), signalList: qs("#signalList"),
  planList: qs("#planList"), planMode: qs("#planMode"), humanLoopNote: qs("#humanLoopNote"),
  taskTitle: qs("#taskTitle"), taskCourse: qs("#taskCourse"), taskDue: qs("#taskDue"), taskPriority: qs("#taskPriority"),
  taskEffort: qs("#taskEffort"), taskStatus: qs("#taskStatus"), taskError: qs("#taskError"), taskList: qs("#taskList"),
  addTaskBtn: qs("#addTaskBtn"), cancelTaskEditBtn: qs("#cancelTaskEditBtn"), clearDoneTasksBtn: qs("#clearDoneTasksBtn"), clearTasksBtn: qs("#clearTasksBtn"),
  noteTitle: qs("#noteTitle"), noteBody: qs("#noteBody"), noteError: qs("#noteError"), noteList: qs("#noteList"),
  addNoteBtn: qs("#addNoteBtn"), cancelNoteEditBtn: qs("#cancelNoteEditBtn"), clearNotesBtn: qs("#clearNotesBtn"),
  memoryQuery: qs("#memoryQuery"), searchMemoryBtn: qs("#searchMemoryBtn"), memoryResults: qs("#memoryResults"),
  logDate: qs("#logDate"), logCourse: qs("#logCourse"), logTopic: qs("#logTopic"), logMinutes: qs("#logMinutes"),
  logReflection: qs("#logReflection"), logError: qs("#logError"), addLogBtn: qs("#addLogBtn"), cancelLogEditBtn: qs("#cancelLogEditBtn"),
  clearLogsBtn: qs("#clearLogsBtn"), historyQuestion: qs("#historyQuestion"), answerHistoryBtn: qs("#answerHistoryBtn"),
  historyAnswer: qs("#historyAnswer"), historyTimeline: qs("#historyTimeline"), studyLogList: qs("#studyLogList"),
  taskCount: qs("#taskCount"), noteCount: qs("#noteCount"), logCount: qs("#logCount"), weakCount: qs("#weakCount"), weakTopicList: qs("#weakTopicList"), storageText: qs("#storageText"),
  acceptPlanBtn: qs("#acceptPlanBtn"), editPlanBtn: qs("#editPlanBtn"), rejectPlanBtn: qs("#rejectPlanBtn"), editDialog: qs("#editDialog"), editablePlan: qs("#editablePlan"), saveEditedPlanBtn: qs("#saveEditedPlanBtn"),
  exportDataBtn: qs("#exportDataBtn"), importDataBtn: qs("#importDataBtn"), importFile: qs("#importFile"), resetAppBtn: qs("#resetAppBtn"), acceptedPlanList: qs("#acceptedPlanList"),
  demoLoadSampleBtn: qs("#demoLoadSampleBtn"), demoOpenDashboardBtn: qs("#demoOpenDashboardBtn"), jumpButtons: qsa("[data-jump-view]"),
  navItems: qsa(".nav-item"), views: qsa(".view"), viewTitle: qs("#viewTitle"),
  langDropdown: qs("#langDropdown"), themeToggleBtn: qs("#themeToggleBtn"), themeToggleIcon: qs("#themeToggleIcon"), themeToggleText: qs("#themeToggleText"),
  modeTfidfBtn: qs("#modeTfidfBtn"), modeHashingBtn: qs("#modeHashingBtn"),
  avgMinutesText: qs("#avgMinutesText"), topCourseText: qs("#topCourseText")
};

boot();

function boot() {
  els.dateStamp.textContent = new Intl.DateTimeFormat(state.language || "en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());
  els.taskDue.value = todayOffset(1);
  els.logDate.value = todayOffset(-1);
  els.checkinText.value = state.lastCheckin || "";

  // Event Listeners
  els.navItems.forEach((item) => item.addEventListener("click", () => switchView(item.dataset.view)));
  els.jumpButtons.forEach((button) => button.addEventListener("click", () => switchView(button.dataset.jumpView)));
  els.demoLoadSampleBtn.addEventListener("click", () => { loadScenario(); switchView("dashboard"); });
  els.demoOpenDashboardBtn.addEventListener("click", () => switchView("dashboard"));
  els.analyzeBtn.addEventListener("click", analyzeAndPlan);
  els.clearCheckinBtn.addEventListener("click", () => { els.checkinText.value = ""; state.lastCheckin = ""; state.lastAnalysis = null; saveState(); renderAll(); });
  els.loadScenarioBtn.addEventListener("click", loadScenario);

  els.addTaskBtn.addEventListener("click", saveTaskFromForm);
  els.cancelTaskEditBtn.addEventListener("click", resetTaskForm);
  els.clearDoneTasksBtn.addEventListener("click", clearDoneTasks);
  els.clearTasksBtn.addEventListener("click", () => clearCollection("tasks"));

  els.addNoteBtn.addEventListener("click", saveNoteFromForm);
  els.cancelNoteEditBtn.addEventListener("click", resetNoteForm);
  els.clearNotesBtn.addEventListener("click", () => clearCollection("notes"));
  els.searchMemoryBtn.addEventListener("click", searchMemory);
  els.memoryQuery.addEventListener("keydown", (event) => { if (event.key === "Enter") searchMemory(); });

  els.addLogBtn.addEventListener("click", saveLogFromForm);
  els.cancelLogEditBtn.addEventListener("click", resetLogForm);
  els.clearLogsBtn.addEventListener("click", () => clearCollection("studyLogs"));
  els.answerHistoryBtn.addEventListener("click", answerHistoryQuestion);
  els.historyQuestion.addEventListener("keydown", (event) => { if (event.key === "Enter") answerHistoryQuestion(); });

  els.acceptPlanBtn.addEventListener("click", acceptPlan);
  els.rejectPlanBtn.addEventListener("click", rejectPlan);
  els.editPlanBtn.addEventListener("click", editPlan);
  els.saveEditedPlanBtn.addEventListener("click", saveEditedPlan);

  els.exportDataBtn.addEventListener("click", exportData);
  els.importDataBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", importData);
  els.resetAppBtn.addEventListener("click", resetApp);

  // Settings Event listeners
  els.langDropdown.addEventListener("change", (e) => setLanguage(e.target.value));
  els.themeToggleBtn.addEventListener("click", toggleTheme);
  els.modeTfidfBtn.addEventListener("click", () => selectRetrievalMode("tfidf"));
  els.modeHashingBtn.addEventListener("click", () => selectRetrievalMode("hashing"));

  // Bootstrap Theme & Language
  setTheme(state.theme || "dark");
  setLanguage("en");
  selectRetrievalMode(state.retrievalMode || "tfidf");

  renderAll();
}

function loadState() {
  const saved = parseStored(localStorage.getItem(STORAGE_KEY));
  if (!saved) return structuredClone(emptyState);
  return normalizeState(saved);
}

function parseStored(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function normalizeState(raw) {
  return {
    tasks: Array.isArray(raw.tasks) ? raw.tasks.map(normalizeTask).filter(Boolean) : [],
    notes: Array.isArray(raw.notes) ? raw.notes.map(normalizeNote).filter(Boolean) : [],
    studyLogs: Array.isArray(raw.studyLogs) ? raw.studyLogs.map(normalizeLog).filter(Boolean) : [],
    acceptedPlan: Array.isArray(raw.acceptedPlan) ? raw.acceptedPlan.filter(Boolean).map(String) : [],
    lastCheckin: typeof raw.lastCheckin === "string" ? raw.lastCheckin : "",
    lastAnalysis: raw.lastAnalysis && typeof raw.lastAnalysis === "object" ? raw.lastAnalysis : null,
    retrievalMode: typeof raw.retrievalMode === "string" ? raw.retrievalMode : "tfidf",
    language: "en",
    theme: typeof raw.theme === "string" ? raw.theme : "dark"
  };
}

function normalizeTask(task) {
  if (!task || !task.title) return null;
  return {
    id: task.id || uid(), title: String(task.title), course: String(task.course || "General"), due: task.due || todayOffset(1),
    priority: clamp(Number(task.priority) || 3, 1, 5), effortMinutes: Number(task.effortMinutes || task.effort * 30 || 45), status: task.status || (task.done ? "done" : "open")
  };
}

function normalizeNote(note) {
  if (!note || !note.title || !note.body) return null;
  return { id: note.id || uid(), title: String(note.title), body: String(note.body), createdAt: note.createdAt || todayOffset(0) };
}

function normalizeLog(log) {
  if (!log || !log.topic) return null;
  return { id: log.id || uid(), studyDate: log.studyDate || log.date || todayOffset(-1), course: String(log.course || "General"), topic: String(log.topic), minutes: Number(log.minutes) || 30, reflection: String(log.reflection || "") };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function switchView(view) {
  const titles = {
    en: { home: "Project Overview", demo: "Demo Guide", dashboard: "Adaptive Daily Plan", tasks: "Task Manager", memory: "Second Brain Memory", history: "Study History", data: "Data Controls", ethics: "Responsible AI Design" },
    ur: { home: "پروجیکٹ کا جائزہ", demo: "ڈیمو گائیڈ", dashboard: "سہولت بخش روزانہ کا منصوبہ", tasks: "ٹاسک مینیجر", memory: "دوسرا دماغ میموری", history: "مطالعہ کی تاریخ", data: "ڈیٹا کنٹرولز", ethics: "ذمہ دارانہ اے آئی ڈیزائن" },
    hi: { home: "परियोजना अवलोकन", demo: "डेमो गाइड", dashboard: "अनुकूल दैनिक योजना", tasks: "कार्य प्रबंधक", memory: "दूसरा दिमाग मेमोरी", history: "अध्ययन इतिहास", data: "डेटा नियंत्रण", ethics: "जिम्मेदार एआई डिजाइन" },
    bn: { home: "প্রকল্পের ওভারভিউ", demo: "ডেমো গাইড", dashboard: "মানানসই পড়ার পরিকল্পনা", tasks: "টাস্ক ম্যানেজার", memory: "দ্বিতীয় মস্তিষ্ক মেমরি", history: "অধ্যয়ন ইতিহাস", data: "তথ্য নিয়ন্ত্রণ", ethics: "দায়িত্বশীল এআই ডিজাইন" }
  };
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  els.views.forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  els.viewTitle.textContent = titles[state.language || "en"][view] || "CogniFlow";
  if (els.viewTitle.dataset.i18n) {
    els.viewTitle.dataset.i18n = `title-${view}`;
  }
}

function renderAll() {
  renderTasks(); renderNotes(); renderStudyLogs(); renderSummary(); renderAcceptedPlan(); renderTimeline();
  if (state.lastAnalysis) renderAnalysis(state.lastAnalysis); else renderEmptyAnalysis();
  if (latestPlan.length) renderPlan(latestPlan, state.lastAnalysis?.state || "waiting"); else renderEmptyPlan();
}

function saveTaskFromForm() {
  const title = els.taskTitle.value.trim();
  const course = els.taskCourse.value.trim() || "General";
  const due = els.taskDue.value;
  const priority = Number(els.taskPriority.value);
  const effortMinutes = Number(els.taskEffort.value);
  if (!title || title.length < 3) return showFieldError(els.taskError, getMsg("err-task-title"));
  if (!due) return showFieldError(els.taskError, getMsg("err-task-due"));
  if (!Number.isFinite(effortMinutes) || effortMinutes < 5) return showFieldError(els.taskError, getMsg("err-task-effort"));
  const task = { id: editingTaskId || uid(), title, course, due, priority, effortMinutes, status: els.taskStatus.value };
  if (editingTaskId) state.tasks = state.tasks.map((item) => item.id === editingTaskId ? task : item);
  else state.tasks.push(task);
  resetTaskForm(); saveState(); renderAll(); showToast(getMsg("toast-task-saved"));
}

function renderTasks() {
  if (!state.tasks.length) { els.taskList.innerHTML = `<p class="meta">${getMsg("meta-no-tasks")}</p>`; return; }
  const sorted = [...state.tasks].sort((a, b) => taskScore(b) - taskScore(a));
  els.taskList.innerHTML = sorted.map((task) => `
    <article class="task-item ${task.status === "done" ? "muted-item" : ""}">
      <div>
        <strong>${escapeHtml(task.title)}</strong>
        <div class="meta">${escapeHtml(task.course)} · ${daysUntil(task.due)} · ${getMsg("field-priority")} ${task.priority}/5 · ${task.effortMinutes} min · ${task.status}</div>
      </div>
      <div class="item-actions">
        <button class="mini-btn" type="button" data-action="toggle-task" data-id="${task.id}">${task.status === "done" ? getMsg("btn-open") : getMsg("btn-done")}</button>
        <button class="mini-btn" type="button" data-action="edit-task" data-id="${task.id}">${getMsg("btn-edit")}</button>
        <button class="mini-btn danger" type="button" data-action="delete-task" data-id="${task.id}">${getMsg("btn-delete")}</button>
      </div>
    </article>`).join("");
  els.taskList.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", handleTaskAction));
}

function handleTaskAction(event) {
  const id = event.currentTarget.dataset.id;
  const action = event.currentTarget.dataset.action;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (action === "toggle-task") {
    task.status = task.status === "done" ? "open" : "done";
  } else if (action === "delete-task") {
    state.tasks = state.tasks.filter((item) => item.id !== id);
  } else if (action === "edit-task") {
    editingTaskId = id; els.taskTitle.value = task.title; els.taskCourse.value = task.course; els.taskDue.value = task.due; els.taskPriority.value = String(task.priority); els.taskEffort.value = String(task.effortMinutes); els.taskStatus.value = task.status; els.addTaskBtn.textContent = getMsg("btn-update-task"); els.cancelTaskEditBtn.classList.remove("hidden"); switchView("tasks"); return;
  }
  saveState(); renderAll();
}

function resetTaskForm() {
  editingTaskId = null; els.taskTitle.value = ""; els.taskCourse.value = ""; els.taskDue.value = todayOffset(1); els.taskPriority.value = "3"; els.taskEffort.value = "45"; els.taskStatus.value = "open"; els.taskError.textContent = ""; els.addTaskBtn.textContent = getMsg("btn-save-task"); els.cancelTaskEditBtn.classList.add("hidden");
}

function clearDoneTasks() { state.tasks = state.tasks.filter((task) => task.status !== "done"); saveState(); renderAll(); showToast(getMsg("toast-done-cleared")); }

function saveNoteFromForm() {
  const title = els.noteTitle.value.trim(); const body = els.noteBody.value.trim();
  if (!title || title.length < 3) return showFieldError(els.noteError, getMsg("err-note-title"));
  if (!body || body.split(/\s+/).length < 3) return showFieldError(els.noteError, getMsg("err-note-body"));
  const note = { id: editingNoteId || uid(), title, body, createdAt: editingNoteId ? (state.notes.find((item) => item.id === editingNoteId)?.createdAt || todayOffset(0)) : todayOffset(0) };
  if (editingNoteId) state.notes = state.notes.map((item) => item.id === editingNoteId ? note : item); else state.notes.unshift(note);
  resetNoteForm(); saveState(); renderAll(); showToast(getMsg("toast-note-saved"));
}

function renderNotes() {
  if (!state.notes.length) { els.noteList.innerHTML = `<p class="meta">${getMsg("meta-no-notes")}</p>`; return; }
  els.noteList.innerHTML = state.notes.map((note) => `
    <article class="memory-item">
      <strong>${escapeHtml(note.title)}</strong>
      <p>${escapeHtml(note.body)}</p>
      <div class="meta">${getMsg("meta-saved")} ${note.createdAt}</div>
      <div class="item-actions" style="flex-direction:row; margin-top:8px;">
        <button class="mini-btn" type="button" data-action="edit-note" data-id="${note.id}">${getMsg("btn-edit")}</button>
        <button class="mini-btn danger" type="button" data-action="delete-note" data-id="${note.id}">${getMsg("btn-delete")}</button>
      </div>
    </article>`).join("");
  els.noteList.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", handleNoteAction));
}

function handleNoteAction(event) {
  const id = event.currentTarget.dataset.id; const action = event.currentTarget.dataset.action; const note = state.notes.find((item) => item.id === id); if (!note) return;
  if (action === "delete-note") {
    state.notes = state.notes.filter((item) => item.id !== id);
  } else if (action === "edit-note") {
    editingNoteId = id; els.noteTitle.value = note.title; els.noteBody.value = note.body; els.addNoteBtn.textContent = getMsg("btn-update-note"); els.cancelNoteEditBtn.classList.remove("hidden"); switchView("memory"); return;
  }
  saveState(); renderAll();
}

function resetNoteForm() { editingNoteId = null; els.noteTitle.value = ""; els.noteBody.value = ""; els.noteError.textContent = ""; els.addNoteBtn.textContent = getMsg("btn-save-note"); els.cancelNoteEditBtn.classList.add("hidden"); }

function searchMemory() {
  const query = els.memoryQuery.value.trim();
  if (!query) { els.memoryResults.innerHTML = `<p class="meta">${getMsg("meta-enter-question")}</p>`; return; }
  const results = retrieveNotes(buildRetrievalQuery(query), 5);
  if (!results.length) { els.memoryResults.innerHTML = `<p class="meta">${getMsg("meta-no-match")}</p>`; return; }
  els.memoryResults.innerHTML = results.map((note) => `<article class="memory-item"><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p><div class="meta">Similarity score ${note.score.toFixed(2)} · saved ${note.createdAt}</div></article>`).join("");
}

function saveLogFromForm() {
  const studyDate = els.logDate.value; const course = els.logCourse.value.trim() || "General"; const topic = els.logTopic.value.trim(); const minutes = Number(els.logMinutes.value); const reflection = els.logReflection.value.trim();
  if (!studyDate) return showFieldError(els.logError, getMsg("err-log-date"));
  if (!topic || topic.length < 3) return showFieldError(els.logError, getMsg("err-log-topic"));
  if (!Number.isFinite(minutes) || minutes < 5) return showFieldError(els.logError, getMsg("err-log-minutes"));
  const log = { id: editingLogId || uid(), studyDate, course, topic, minutes, reflection };
  if (editingLogId) state.studyLogs = state.studyLogs.map((item) => item.id === editingLogId ? log : item); else state.studyLogs.unshift(log);
  resetLogForm(); saveState(); renderAll(); showToast(getMsg("toast-log-saved"));
}

function renderStudyLogs() {
  const studyList = els.studyLogList;
  if (!state.studyLogs.length) { studyList.innerHTML = `<p class="meta">${getMsg("meta-no-logs")}</p>`; return; }
  const sorted = [...state.studyLogs].sort((a, b) => b.studyDate.localeCompare(a.studyDate));
  studyList.innerHTML = sorted.map((log) => `
    <article class="task-item">
      <div>
        <strong>${escapeHtml(log.course)}: ${escapeHtml(log.topic)}</strong>
        <div class="meta">${formatDate(log.studyDate)} · ${log.minutes} min</div>
        <p>${escapeHtml(log.reflection || "No reflection.")}</p>
      </div>
      <div class="item-actions">
        <button class="mini-btn" type="button" data-action="edit-log" data-id="${log.id}">${getMsg("btn-edit")}</button>
        <button class="mini-btn danger" type="button" data-action="delete-log" data-id="${log.id}">${getMsg("btn-delete")}</button>
      </div>
    </article>`).join("");
  studyList.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", handleLogAction));
}

function handleLogAction(event) {
  const id = event.currentTarget.dataset.id; const action = event.currentTarget.dataset.action; const log = state.studyLogs.find((item) => item.id === id); if (!log) return;
  if (action === "delete-log") {
    state.studyLogs = state.studyLogs.filter((item) => item.id !== id);
  } else if (action === "edit-log") {
    editingLogId = id; els.logDate.value = log.studyDate; els.logCourse.value = log.course; els.logTopic.value = log.topic; els.logMinutes.value = String(log.minutes); els.logReflection.value = log.reflection; els.addLogBtn.textContent = getMsg("btn-update-log"); els.cancelLogEditBtn.classList.remove("hidden"); switchView("history"); return;
  }
  saveState(); renderAll();
}

function resetLogForm() { editingLogId = null; els.logDate.value = todayOffset(-1); els.logCourse.value = ""; els.logTopic.value = ""; els.logMinutes.value = "40"; els.logReflection.value = ""; els.logError.textContent = ""; els.addLogBtn.textContent = getMsg("btn-save-log"); els.cancelLogEditBtn.classList.add("hidden"); }

function answerHistoryQuestion() {
  const question = els.historyQuestion.value.trim();
  if (!question) { els.historyAnswer.textContent = getMsg("err-ask-q"); return; }
  els.historyAnswer.textContent = buildHistoryAnswer(question);
}

const weekdaysMap = {
  en: { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 },
  ur: { پیر: 0, منگل: 1, بدھ: 2, جمعرات: 3, جمعہ: 4, ہفتہ: 5, اتوار: 6, monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 },
  hi: { सोमवार: 0, मंगलवार: 1, बुधवार: 2, गुरुवार: 3, शुक्रवार: 4, शनिवार: 5, रविवार: 6, monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 },
  bn: { সোমবার: 0, মঙ্গলবার: 1, বুধবার: 2, বৃহস্পতিবার: 3, শুক্রবার: 4, শনিবার: 5, রবিবার: 6, monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 }
};

function buildHistoryAnswer(question) {
  if (!state.studyLogs.length) return getMsg("meta-no-logs");
  const normalized = question.toLowerCase();
  const tokens = tokenize(normalized);
  
  let targetDate = null;
  const today = new Date();
  
  if (normalized.includes("yesterday") || normalized.includes("کل")) {
    targetDate = todayOffset(-1);
  } else if (normalized.includes("today") || normalized.includes("آج") || normalized.includes("आज") || normalized.includes("আজ")) {
    targetDate = todayOffset(0);
  } else {
    // Resolve weekday
    const dayMap = weekdaysMap[state.language || "en"];
    for (const key in dayMap) {
      if (normalized.includes(key)) {
        const index = dayMap[key];
        const currentDayIndex = (today.getDay() + 6) % 7; // ISO weekday: Mon=0, Sun=6
        let daysBack = (currentDayIndex - index) % 7;
        daysBack = daysBack === 0 ? 7 : daysBack;
        const d = new Date();
        d.setDate(d.getDate() - daysBack);
        targetDate = d.toISOString().slice(0, 10);
        break;
      }
    }
  }
  
  const stopwords = ["what", "did", "study", "yesterday", "today", "when", "about", "i", "کیا", "پڑھا", "کل", "آج", "को", "क्या", "पढ़ा", "आज", "আজ", "কি", "পড়েছি"];
  const queryTokens = tokens.filter((t) => !stopwords.includes(t));
  
  let logs = [...state.studyLogs];
  if (targetDate) {
    logs = logs.filter((log) => log.studyDate === targetDate);
  }
  if (queryTokens.length) {
    logs = logs.filter((log) => queryTokens.some((token) => tokenize(`${log.course} ${log.topic} ${log.reflection}`).includes(token)));
  }
  if (!logs.length) {
    return targetDate ? `${getMsg("history-not-found-date")} ${formatDate(targetDate)}.` : getMsg("history-not-found");
  }
  return logs.sort((a, b) => b.studyDate.localeCompare(a.studyDate)).slice(0, 3).map((log) => {
    return `On ${formatDate(log.studyDate)}, you studied ${log.course}: ${log.topic} for ${log.minutes} minutes${log.reflection ? ` (${log.reflection})` : ""}.`;
  }).join(" ");
}

function analyzeAndPlan() {
  const checkin = els.checkinText.value.trim();
  els.checkinError.textContent = "";
  if (!isValidCheckin(checkin)) return showFieldError(els.checkinError, getMsg("err-checkin-length"));
  state.lastCheckin = checkin;
  const analysis = analyzeState(checkin, state.tasks);
  state.lastAnalysis = analysis;
  const relevantNotes = retrieveNotes(buildRetrievalQuery(checkin), 3);
  latestPlan = buildPlan(analysis, state.tasks, relevantNotes, inferWeakTopics());
  saveState(); renderAnalysis(analysis); renderPlan(latestPlan, analysis.state); renderSummary(); showToast(getMsg("toast-plan-generated"));
}

function isValidCheckin(checkin) { return tokenize(checkin).length >= MIN_CHECKIN_WORDS; }

function analyzeState(text, tasks) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const urgentTasks = openTasks.filter((task) => daysUntilNumber(task.due) <= 1).length;
  
  // Use our dynamic Naive Bayes classifier
  const prediction = mlClassifier.predict(text, openTasks.length, urgentTasks);
  
  // Custom workload score mapping for UI meter representation
  const workloadScore = Math.min(34, openTasks.length * 6 + urgentTasks * 8);
  const signals = extractTextSignals(text);
  const scoreMap = { focused: 15, neutral: 45, stressed: 68, overwhelmed: 90 };
  const stressScore = clamp(scoreMap[prediction.label] + workloadScore, 0, 100);
  
  return {
    state: prediction.label,
    score: stressScore,
    confidence: Math.round(prediction.confidence * 100),
    signals: prediction.reasons
  };
}

function renderAnalysis(analysis) {
  els.stressMeter.style.width = `${analysis.score}%`;
  els.confidenceText.textContent = `${analysis.confidence}% confidence`;
  els.stateBadge.textContent = getMsg(`state-${analysis.state}`);
  els.stateBadge.className = `state-badge ${analysis.state}`;
  
  const copy = {
    focused: getMsg("desc-focused"),
    neutral: getMsg("desc-neutral"),
    stressed: getMsg("desc-stressed"),
    overwhelmed: getMsg("desc-overwhelmed")
  };
  els.stateDetails.textContent = copy[analysis.state];
  els.signalList.innerHTML = analysis.signals.map((signal) => `<span class="signal-chip">${escapeHtml(signal)}</span>`).join("");
}

function renderEmptyAnalysis() {
  els.stressMeter.style.width = "0%";
  els.confidenceText.textContent = "0% confidence";
  els.stateBadge.textContent = getMsg("state-neutral");
  els.stateBadge.className = "state-badge neutral";
  els.stateDetails.textContent = getMsg("state-details-placeholder");
  els.signalList.innerHTML = "";
}

function buildPlan(analysis, tasks, notes, weakTopics) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  if (!openTasks.length) return [getMsg("plan-step-add-tasks"), getMsg("plan-step-write-checkin"), getMsg("plan-step-rerun")];
  const sorted = [...openTasks].sort((a, b) => taskScore(b) - taskScore(a));
  const top = sorted[0];
  const next = sorted[1];
  const memoryHint = notes[0] ? `${getMsg("plan-open-note")} "${notes[0].title}" ${getMsg("plan-before-starting")}.` : getMsg("plan-use-latest-notes");
  const weakHint = weakTopics[0] ? `${getMsg("plan-rapid-revise")}: ${weakTopics[0].course}: ${weakTopics[0].topic}.` : null;
  
  const plans = {
    overwhelmed: [
      `${getMsg("plan-work-on")} "${top.title}" ${getMsg("plan-25-min-only")}.`,
      next ? `${getMsg("plan-do-subtask")} "${next.title}" ${getMsg("plan-after-reset")}.` : getMsg("plan-take-reset"),
      memoryHint,
      getMsg("plan-hide-non-urgent")
    ],
    stressed: [
      `${getMsg("plan-protect-50")} "${top.title}".`,
      next ? `${getMsg("plan-schedule")} "${next.title}" ${getMsg("plan-after-break")}.` : getMsg("plan-review-result"),
      memoryHint,
      getMsg("plan-move-low-priority")
    ],
    focused: [
      `${getMsg("plan-start-90")} "${top.title}".`,
      next ? `${getMsg("plan-batch-next")}: "${next.title}".` : getMsg("plan-write-summary"),
      memoryHint
    ],
    neutral: [
      `${getMsg("plan-complete-urgent")}: "${top.title}".`,
      next ? `${getMsg("plan-prepare-materials")} "${next.title}".` : getMsg("plan-add-concrete"),
      memoryHint,
      getMsg("plan-review-after-block")
    ]
  };
  const plan = plans[analysis.state] || plans.neutral;
  if (weakHint) plan.push(weakHint);
  return plan;
}

function renderPlan(plan, mode) {
  els.planMode.textContent = getMsg(`state-${mode}`) || titleCase(mode);
  els.planList.innerHTML = plan.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderEmptyPlan() {
  latestPlan = [];
  els.planMode.textContent = getMsg("state-waiting");
  els.planList.innerHTML = `<li>${getMsg("meta-add-tasks-plan")}</li>`;
}

function retrieveNotes(query, limit) {
  if (!state.notes.length) return [];
  let scorer;
  if (state.retrievalMode === "hashing") {
    const embedder = new HashingEmbeddingModel();
    const queryVec = embedder.encodeOne(query);
    scorer = (note) => cosine(queryVec, embedder.encodeOne(`${note.title} ${note.body}`));
  } else {
    const tfidf = new TfidfVectorizer();
    const docs = state.notes.map((note) => `${note.title} ${note.body}`);
    const vectors = tfidf.fitTransform(docs);
    const queryVec = tfidf.transformOne(query);
    scorer = (note, idx) => cosine(queryVec, vectors[idx]);
  }
  return state.notes.map((note, idx) => ({ ...note, score: scorer(note, idx) })).filter((note) => note.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildRetrievalQuery(input) {
  const openTasks = state.tasks.filter((task) => task.status !== "done").sort((a, b) => taskScore(b) - taskScore(a));
  const weightedTasks = openTasks.flatMap((task, index) => Array(index === 0 ? Math.max(task.priority * 3, 1) : Math.max(task.priority, 1)).fill(`${task.title} ${task.course}`));
  const weakTerms = inferWeakTopics().map((topic) => `${topic.course} ${topic.topic} ${topic.reflection}`);
  return [input, ...weightedTasks, ...weakTerms].join(" ");
}

function inferWeakTopics() {
  const weakWords = langKeywords[state.language || "en"].weak;
  return state.studyLogs.filter((log) => weakWords.some((word) => log.reflection.toLowerCase().includes(word))).slice(0, 5);
}

function calculateStats() {
  if (!state.studyLogs.length) {
    els.avgMinutesText.textContent = "0m";
    els.topCourseText.textContent = "N/A";
    return;
  }
  
  // Avg Minutes per Session
  const totalMinutes = state.studyLogs.reduce((acc, log) => acc + log.minutes, 0);
  const avg = Math.round(totalMinutes / state.studyLogs.length);
  els.avgMinutesText.textContent = `${avg}m`;
  
  // Top Course studied
  const courses = state.studyLogs.map((log) => log.course || "General");
  const courseCounts = courses.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  let topCourse = "N/A";
  let maxCount = -1;
  for (const c in courseCounts) {
    if (courseCounts[c] > maxCount) {
      maxCount = courseCounts[c];
      topCourse = c;
    }
  }
  els.topCourseText.textContent = topCourse;
}

function renderTimeline() {
  const container = els.historyTimeline;
  if (!state.studyLogs.length) {
    container.innerHTML = `<p class="meta" style="padding:12px;">${getMsg("meta-no-logs")}</p>`;
    return;
  }
  const sorted = [...state.studyLogs].sort((a, b) => b.studyDate.localeCompare(a.studyDate));
  container.innerHTML = sorted.map((log) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="title-row">
          <span>${escapeHtml(log.course)}: ${escapeHtml(log.topic)}</span>
          <span style="color:var(--indigo); font-weight:700;">${log.minutes} mins</span>
        </div>
        <p>${escapeHtml(log.reflection || "No reflection.")}</p>
        <span class="meta" style="font-size:0.75rem;">${formatDate(log.studyDate)}</span>
      </div>
    </div>
  `).join("");
}

function renderSummary() {
  const weakTopics = inferWeakTopics();
  els.taskCount.textContent = String(state.tasks.length);
  els.noteCount.textContent = String(state.notes.length);
  els.logCount.textContent = String(state.studyLogs.length);
  els.weakCount.textContent = String(weakTopics.length);
  els.storageText.textContent = `localStorage ${Math.ceil(JSON.stringify(state).length / 1024)} KB`;
  els.weakTopicList.innerHTML = weakTopics.length ? weakTopics.map((topic) => `<div class="meta">${escapeHtml(topic.course)}: ${escapeHtml(topic.topic)}</div>`).join("") : `<p class="meta">${getMsg("meta-no-weak")}</p>`;
  calculateStats();
}

function acceptPlan() {
  if (!latestPlan.length) return showToast(getMsg("toast-generate-plan"));
  state.acceptedPlan = latestPlan;
  saveState();
  renderAcceptedPlan();
  els.humanLoopNote.textContent = getMsg("plan-loop-accepted");
  showToast(getMsg("toast-plan-accepted"));
}

function rejectPlan() {
  state.acceptedPlan = [];
  saveState();
  renderAcceptedPlan();
  els.humanLoopNote.textContent = getMsg("plan-loop-rejected");
  showToast(getMsg("toast-plan-rejected"));
}

function editPlan() {
  if (!latestPlan.length) return showToast(getMsg("toast-generate-plan"));
  els.editablePlan.value = latestPlan.join("\n");
  els.editDialog.showModal();
}

function saveEditedPlan() {
  latestPlan = els.editablePlan.value.split("\n").map((item) => item.trim()).filter(Boolean);
  state.acceptedPlan = latestPlan;
  saveState();
  renderPlan(latestPlan, "edited");
  renderAcceptedPlan();
  els.humanLoopNote.textContent = getMsg("plan-loop-edited");
  els.editDialog.close();
  showToast(getMsg("toast-edited-saved"));
}

function renderAcceptedPlan() {
  els.acceptedPlanList.innerHTML = state.acceptedPlan.length ? `<ol class="plan-list">${state.acceptedPlan.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : `<p class="meta">${getMsg("meta-no-accepted")}</p>`;
}

function loadScenario() {
  state.lastCheckin = sampleScenario.checkin;
  els.checkinText.value = sampleScenario.checkin;
  state.tasks = sampleScenario.tasks.map((task) => normalizeTask({ ...task, id: uid() }));
  state.notes = sampleScenario.notes.map((note) => normalizeNote({ ...note, id: uid(), createdAt: todayOffset(0) }));
  state.studyLogs = sampleScenario.logs.map((log) => normalizeLog({ ...log, id: uid() }));
  state.acceptedPlan = [];
  state.lastAnalysis = null;
  latestPlan = [];
  saveState();
  renderAll();
  analyzeAndPlan();
  showToast(getMsg("toast-sample-loaded"));
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cogniflow-export-${todayOffset(0)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(getMsg("toast-export-downloaded"));
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = parseStored(String(reader.result));
    if (!imported) return showToast(getMsg("toast-invalid-json"));
    state = normalizeState(imported);
    latestPlan = [];
    saveState();
    setTheme(state.theme || "dark");
    setLanguage(state.language || "en");
    selectRetrievalMode(state.retrievalMode || "tfidf");
    renderAll();
    showToast(getMsg("toast-data-imported"));
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetApp() {
  if (!confirm(getMsg("confirm-reset"))) return;
  state = structuredClone(emptyState);
  latestPlan = [];
  localStorage.removeItem(STORAGE_KEY);
  els.checkinText.value = "";
  resetTaskForm();
  resetNoteForm();
  resetLogForm();
  setTheme("dark");
  setLanguage("en");
  selectRetrievalMode("tfidf");
  renderAll();
  showToast(getMsg("toast-app-reset"));
}

function clearCollection(key) {
  if (!confirm(`${getMsg("confirm-clear")} ${key}?`)) return;
  state[key] = [];
  latestPlan = [];
  saveState();
  renderAll();
  showToast(getMsg("toast-cleared"));
}

// Multi-language UI translation functions
function setLanguage(lang) {
  state.language = lang;
  saveState();
  
  els.langDropdown.value = lang;
  
  // Set HTML dir and language
  const direction = lang === "ur" ? "rtl" : "ltr";
  document.documentElement.dir = direction;
  document.documentElement.lang = lang;
  
  // Update view title translations
  const activeNavItem = qs(".nav-item.active");
  if (activeNavItem) {
    switchView(activeNavItem.dataset.view);
  }
  
  // Loop over elements and replace text
  qsa("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const txt = getMsg(key);
    if (txt) {
      if (el.tagName === "INPUT" && el.placeholder) {
        el.placeholder = txt;
      } else {
        el.textContent = txt;
      }
    }
  });
  
  // Re-render forms static texts
  els.addTaskBtn.textContent = editingTaskId ? getMsg("btn-update-task") : getMsg("btn-save-task");
  els.addNoteBtn.textContent = editingNoteId ? getMsg("btn-update-note") : getMsg("btn-save-note");
  els.addLogBtn.textContent = editingLogId ? getMsg("btn-update-log") : getMsg("btn-save-log");
  
  els.dateStamp.textContent = new Intl.DateTimeFormat(lang, { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());
  
  renderAll();
}

function getMsg(key) {
  const lang = state.language || "en";
  return translations[lang][key] || translations["en"][key] || key;
}

// Theme settings switcher
function toggleTheme() {
  const current = state.theme === "light" ? "dark" : "light";
  setTheme(current);
}

function setTheme(theme) {
  state.theme = theme;
  saveState();
  
  document.documentElement.setAttribute("data-theme", theme);
  
  if (theme === "light") {
    els.themeToggleIcon.textContent = "☀️";
    els.themeToggleText.textContent = getMsg("theme-light");
  } else {
    els.themeToggleIcon.textContent = "🌙";
    els.themeToggleText.textContent = getMsg("theme-dark");
  }
}

// Retrieval settings switcher
function selectRetrievalMode(mode) {
  state.retrievalMode = mode;
  saveState();
  
  els.modeTfidfBtn.classList.toggle("active", mode === "tfidf");
  els.modeHashingBtn.classList.toggle("active", mode === "hashing");
}

// NLP Helpers & Math
function tokenize(text) {
  // Unicode support for English, Urdu, Hindi, Bengali words
  return String(text).toLowerCase().match(/[\p{L}\p{N}']+/gu) || [];
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function softmax(scores) {
  const maxScore = Math.max(...Object.values(scores));
  const exps = {};
  let total = 0;
  for (const label in scores) {
    const val = Math.exp(scores[label] - maxScore);
    exps[label] = val;
    total += val;
  }
  const probs = {};
  for (const label in exps) {
    probs[label] = exps[label] / total;
  }
  return probs;
}

function extractTextSignals(text) {
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);
  const lang = state.language || "en";
  const dict = langKeywords[lang] || langKeywords["en"];
  
  const stressHits = dict.stress.filter((word) => tokenSet.has(word));
  const focusHits = dict.focus.filter((word) => tokenSet.has(word));
  
  return {
    stressHits,
    focusHits,
    wordCount: tokens.length
  };
}

function cosine(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  keys.forEach((key) => {
    dot += (a[key] || 0) * (b[key] || 0);
    magA += (a[key] || 0) ** 2;
    magB += (b[key] || 0) ** 2;
  });
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function termVector(text) {
  return tokenize(text).reduce((acc, word) => {
    if (word.length > 2) acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
}

function taskScore(task) {
  const urgency = Math.max(0, 7 - daysUntilNumber(task.due));
  return task.priority * 10 + urgency * 4 - task.effortMinutes / 30;
}

function todayOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateString) {
  const count = daysUntilNumber(dateString);
  if (count < 0) return getMsg("meta-overdue") || "overdue";
  if (count === 0) return getMsg("meta-due-today") || "due today";
  if (count === 1) return getMsg("meta-due-tomorrow") || "due tomorrow";
  return `${getMsg("meta-due-in") || "due in"} ${count} ${getMsg("meta-days") || "days"}`;
}

function daysUntilNumber(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat(state.language || "en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${dateString}T00:00:00`));
}

function titleCase(value) {
  return `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)}`;
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function qs(selector) { return document.querySelector(selector); }
function qsa(selector) { return [...document.querySelectorAll(selector)]; }
function showFieldError(element, message) { element.textContent = message; }

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
