const STORAGE_KEY = "cogniflow-demo-v2";
const LEGACY_STORAGE_KEY = "cogniflow-demo-v1";
const MIN_CHECKIN_WORDS = 5;

const stressWords = [
  "stressed", "stress", "panic", "panicked", "overwhelmed", "anxious", "confused", "tired", "exhausted",
  "burnout", "burned", "late", "deadline", "deadlines", "missed", "cannot", "can't", "stuck", "afraid", "worried", "pressure", "fail"
];

const focusWords = [
  "focused", "ready", "clear", "confident", "prepared", "calm", "flow", "productive", "revised", "finished", "planned", "understand"
];

const weakWords = ["weak", "confused", "stuck", "hard", "difficult", "need", "again", "forgot", "unclear"];

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
  lastAnalysis: null
};

let state = loadState();
let latestPlan = [];
let editingTaskId = null;
let editingNoteId = null;
let editingLogId = null;

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
  historyAnswer: qs("#historyAnswer"), studyLogList: qs("#studyLogList"),
  taskCount: qs("#taskCount"), noteCount: qs("#noteCount"), logCount: qs("#logCount"), weakCount: qs("#weakCount"), weakTopicList: qs("#weakTopicList"), storageText: qs("#storageText"),
  acceptPlanBtn: qs("#acceptPlanBtn"), editPlanBtn: qs("#editPlanBtn"), rejectPlanBtn: qs("#rejectPlanBtn"), editDialog: qs("#editDialog"), editablePlan: qs("#editablePlan"), saveEditedPlanBtn: qs("#saveEditedPlanBtn"),
  exportDataBtn: qs("#exportDataBtn"), importDataBtn: qs("#importDataBtn"), importFile: qs("#importFile"), resetAppBtn: qs("#resetAppBtn"), acceptedPlanList: qs("#acceptedPlanList"),
  demoLoadSampleBtn: qs("#demoLoadSampleBtn"), demoOpenDashboardBtn: qs("#demoOpenDashboardBtn"), jumpButtons: qsa("[data-jump-view]"),
  navItems: qsa(".nav-item"), views: qsa(".view"), viewTitle: qs("#viewTitle")
};

boot();

function boot() {
  els.dateStamp.textContent = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date());
  els.taskDue.value = todayOffset(1);
  els.logDate.value = todayOffset(-1);
  els.checkinText.value = state.lastCheckin || "";

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

  renderAll();
}

function loadState() {
  const saved = parseStored(localStorage.getItem(STORAGE_KEY)) || parseStored(localStorage.getItem(LEGACY_STORAGE_KEY));
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
    lastAnalysis: raw.lastAnalysis && typeof raw.lastAnalysis === "object" ? raw.lastAnalysis : null
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
  const titles = { home: "Project Overview", demo: "Demo Guide", dashboard: "Adaptive Daily Plan", tasks: "Task Manager", memory: "Second Brain Memory", history: "Study History", data: "Data Controls", ethics: "Responsible AI Design" };
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  els.views.forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  els.viewTitle.textContent = titles[view] || "CogniFlow";
}

function renderAll() {
  renderTasks(); renderNotes(); renderStudyLogs(); renderSummary(); renderAcceptedPlan();
  if (state.lastAnalysis) renderAnalysis(state.lastAnalysis); else renderEmptyAnalysis();
  if (latestPlan.length) renderPlan(latestPlan, state.lastAnalysis?.state || "waiting"); else renderEmptyPlan();
}

function saveTaskFromForm() {
  const title = els.taskTitle.value.trim();
  const course = els.taskCourse.value.trim() || "General";
  const due = els.taskDue.value;
  const priority = Number(els.taskPriority.value);
  const effortMinutes = Number(els.taskEffort.value);
  if (!title || title.length < 3) return showFieldError(els.taskError, "Enter a real task title.");
  if (!due) return showFieldError(els.taskError, "Select a due date.");
  if (!Number.isFinite(effortMinutes) || effortMinutes < 5) return showFieldError(els.taskError, "Effort must be at least 5 minutes.");
  const task = { id: editingTaskId || uid(), title, course, due, priority, effortMinutes, status: els.taskStatus.value };
  if (editingTaskId) state.tasks = state.tasks.map((item) => item.id === editingTaskId ? task : item);
  else state.tasks.push(task);
  resetTaskForm(); saveState(); renderAll(); showToast("Task saved.");
}

function renderTasks() {
  if (!state.tasks.length) { els.taskList.innerHTML = '<p class="meta">No tasks yet. Add tasks or load the sample scenario.</p>'; return; }
  const sorted = [...state.tasks].sort((a, b) => taskScore(b) - taskScore(a));
  els.taskList.innerHTML = sorted.map((task) => `
    <article class="task-item ${task.status === "done" ? "muted-item" : ""}">
      <div><strong>${escapeHtml(task.title)}</strong><div class="meta">${escapeHtml(task.course)} · ${daysUntil(task.due)} · priority ${task.priority}/5 · ${task.effortMinutes} min · ${task.status}</div></div>
      <div class="item-actions">
        <button class="mini-btn" type="button" data-action="toggle-task" data-id="${task.id}">${task.status === "done" ? "Open" : "Done"}</button>
        <button class="mini-btn" type="button" data-action="edit-task" data-id="${task.id}">Edit</button>
        <button class="mini-btn danger" type="button" data-action="delete-task" data-id="${task.id}">Delete</button>
      </div>
    </article>`).join("");
  els.taskList.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", handleTaskAction));
}

function handleTaskAction(event) {
  const id = event.currentTarget.dataset.id;
  const action = event.currentTarget.dataset.action;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (action === "toggle-task") task.status = task.status === "done" ? "open" : "done";
  if (action === "delete-task") state.tasks = state.tasks.filter((item) => item.id !== id);
  if (action === "edit-task") {
    editingTaskId = id; els.taskTitle.value = task.title; els.taskCourse.value = task.course; els.taskDue.value = task.due; els.taskPriority.value = String(task.priority); els.taskEffort.value = String(task.effortMinutes); els.taskStatus.value = task.status; els.addTaskBtn.textContent = "Update task"; els.cancelTaskEditBtn.classList.remove("hidden"); switchView("tasks"); return;
  }
  saveState(); renderAll();
}

function resetTaskForm() {
  editingTaskId = null; els.taskTitle.value = ""; els.taskCourse.value = ""; els.taskDue.value = todayOffset(1); els.taskPriority.value = "3"; els.taskEffort.value = "45"; els.taskStatus.value = "open"; els.taskError.textContent = ""; els.addTaskBtn.textContent = "Save task"; els.cancelTaskEditBtn.classList.add("hidden");
}

function clearDoneTasks() { state.tasks = state.tasks.filter((task) => task.status !== "done"); saveState(); renderAll(); showToast("Completed tasks cleared."); }

function saveNoteFromForm() {
  const title = els.noteTitle.value.trim(); const body = els.noteBody.value.trim();
  if (!title || title.length < 3) return showFieldError(els.noteError, "Enter a note title.");
  if (!body || body.split(/\s+/).length < 4) return showFieldError(els.noteError, "Write a useful note body.");
  const note = { id: editingNoteId || uid(), title, body, createdAt: editingNoteId ? (state.notes.find((item) => item.id === editingNoteId)?.createdAt || todayOffset(0)) : todayOffset(0) };
  if (editingNoteId) state.notes = state.notes.map((item) => item.id === editingNoteId ? note : item); else state.notes.unshift(note);
  resetNoteForm(); saveState(); renderAll(); showToast("Note saved.");
}

function renderNotes() {
  if (!state.notes.length) { els.noteList.innerHTML = '<p class="meta">No notes saved yet.</p>'; return; }
  els.noteList.innerHTML = state.notes.map((note) => `
    <article class="memory-item"><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p><div class="meta">saved ${note.createdAt}</div>
      <div class="item-actions"><button class="mini-btn" type="button" data-action="edit-note" data-id="${note.id}">Edit</button><button class="mini-btn danger" type="button" data-action="delete-note" data-id="${note.id}">Delete</button></div></article>`).join("");
  els.noteList.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", handleNoteAction));
}

function handleNoteAction(event) {
  const id = event.currentTarget.dataset.id; const action = event.currentTarget.dataset.action; const note = state.notes.find((item) => item.id === id); if (!note) return;
  if (action === "delete-note") state.notes = state.notes.filter((item) => item.id !== id);
  if (action === "edit-note") { editingNoteId = id; els.noteTitle.value = note.title; els.noteBody.value = note.body; els.addNoteBtn.textContent = "Update note"; els.cancelNoteEditBtn.classList.remove("hidden"); switchView("memory"); return; }
  saveState(); renderAll();
}

function resetNoteForm() { editingNoteId = null; els.noteTitle.value = ""; els.noteBody.value = ""; els.noteError.textContent = ""; els.addNoteBtn.textContent = "Save note"; els.cancelNoteEditBtn.classList.add("hidden"); }

function searchMemory() {
  const query = els.memoryQuery.value.trim();
  if (!query) { els.memoryResults.innerHTML = '<p class="meta">Enter a question to search your stored notes.</p>'; return; }
  const results = retrieveNotes(buildRetrievalQuery(query), 5);
  if (!results.length) { els.memoryResults.innerHTML = '<p class="meta">No strong match found. Add more notes or try different wording.</p>'; return; }
  els.memoryResults.innerHTML = results.map((note) => `<article class="memory-item"><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p><div class="meta">Similarity score ${note.score.toFixed(2)} · saved ${note.createdAt}</div></article>`).join("");
}

function saveLogFromForm() {
  const studyDate = els.logDate.value; const course = els.logCourse.value.trim() || "General"; const topic = els.logTopic.value.trim(); const minutes = Number(els.logMinutes.value); const reflection = els.logReflection.value.trim();
  if (!studyDate) return showFieldError(els.logError, "Select a study date.");
  if (!topic || topic.length < 3) return showFieldError(els.logError, "Enter the study topic.");
  if (!Number.isFinite(minutes) || minutes < 5) return showFieldError(els.logError, "Minutes must be at least 5.");
  const log = { id: editingLogId || uid(), studyDate, course, topic, minutes, reflection };
  if (editingLogId) state.studyLogs = state.studyLogs.map((item) => item.id === editingLogId ? log : item); else state.studyLogs.unshift(log);
  resetLogForm(); saveState(); renderAll(); showToast("Study log saved.");
}

function renderStudyLogs() {
  if (!state.studyLogs.length) { els.studyLogList.innerHTML = '<p class="meta">No study logs yet.</p>'; return; }
  const sorted = [...state.studyLogs].sort((a, b) => b.studyDate.localeCompare(a.studyDate));
  els.studyLogList.innerHTML = sorted.map((log) => `<article class="task-item"><div><strong>${escapeHtml(log.course)}: ${escapeHtml(log.topic)}</strong><div class="meta">${formatDate(log.studyDate)} · ${log.minutes} min</div><p>${escapeHtml(log.reflection || "No reflection.")}</p></div><div class="item-actions"><button class="mini-btn" type="button" data-action="edit-log" data-id="${log.id}">Edit</button><button class="mini-btn danger" type="button" data-action="delete-log" data-id="${log.id}">Delete</button></div></article>`).join("");
  els.studyLogList.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", handleLogAction));
}

function handleLogAction(event) {
  const id = event.currentTarget.dataset.id; const action = event.currentTarget.dataset.action; const log = state.studyLogs.find((item) => item.id === id); if (!log) return;
  if (action === "delete-log") state.studyLogs = state.studyLogs.filter((item) => item.id !== id);
  if (action === "edit-log") { editingLogId = id; els.logDate.value = log.studyDate; els.logCourse.value = log.course; els.logTopic.value = log.topic; els.logMinutes.value = String(log.minutes); els.logReflection.value = log.reflection; els.addLogBtn.textContent = "Update log"; els.cancelLogEditBtn.classList.remove("hidden"); switchView("history"); return; }
  saveState(); renderAll();
}

function resetLogForm() { editingLogId = null; els.logDate.value = todayOffset(-1); els.logCourse.value = ""; els.logTopic.value = ""; els.logMinutes.value = "40"; els.logReflection.value = ""; els.logError.textContent = ""; els.addLogBtn.textContent = "Save log"; els.cancelLogEditBtn.classList.add("hidden"); }

function answerHistoryQuestion() {
  const question = els.historyQuestion.value.trim();
  if (!question) { els.historyAnswer.textContent = "Ask a history question first."; return; }
  els.historyAnswer.textContent = buildHistoryAnswer(question);
}

function buildHistoryAnswer(question) {
  if (!state.studyLogs.length) return "No study logs are saved yet.";
  const normalized = question.toLowerCase();
  let targetDate = null;
  if (normalized.includes("yesterday")) targetDate = todayOffset(-1);
  if (normalized.includes("today")) targetDate = todayOffset(0);
  const queryTokens = tokenize(question).filter((token) => !["what", "did", "study", "yesterday", "today", "when", "about", "i"].includes(token));
  let logs = [...state.studyLogs];
  if (targetDate) logs = logs.filter((log) => log.studyDate === targetDate);
  if (queryTokens.length) logs = logs.filter((log) => queryTokens.some((token) => tokenize(`${log.course} ${log.topic} ${log.reflection}`).includes(token)));
  if (!logs.length && targetDate) return `No saved study log found for ${formatDate(targetDate)}.`;
  if (!logs.length) return "No matching study log found.";
  return logs.sort((a, b) => b.studyDate.localeCompare(a.studyDate)).slice(0, 3).map((log) => `On ${formatDate(log.studyDate)}, you studied ${log.course}: ${log.topic} for ${log.minutes} minutes${log.reflection ? ` (${log.reflection})` : ""}.`).join(" ");
}

function analyzeAndPlan() {
  const checkin = els.checkinText.value.trim();
  els.checkinError.textContent = "";
  if (!isValidCheckin(checkin)) return showFieldError(els.checkinError, "Please enter a real check-in sentence, for example: I feel stressed because my DBMS quiz is tomorrow and normalization is weak.");
  state.lastCheckin = checkin;
  const analysis = analyzeState(checkin, state.tasks);
  state.lastAnalysis = analysis;
  const relevantNotes = retrieveNotes(buildRetrievalQuery(checkin), 3);
  latestPlan = buildPlan(analysis, state.tasks, relevantNotes, inferWeakTopics());
  saveState(); renderAnalysis(analysis); renderPlan(latestPlan, analysis.state); renderSummary(); showToast("Plan generated.");
}

function isValidCheckin(checkin) { return tokenize(checkin).length >= MIN_CHECKIN_WORDS; }

function analyzeState(text, tasks) {
  const normalized = text.toLowerCase(); const words = tokenize(normalized); const stressHits = stressWords.filter((word) => normalized.includes(word)); const focusHits = focusWords.filter((word) => normalized.includes(word));
  const openTasks = tasks.filter((task) => task.status !== "done"); const urgentTasks = openTasks.filter((task) => daysUntilNumber(task.due) <= 1).length;
  const workloadScore = Math.min(34, openTasks.length * 6 + urgentTasks * 8); const lengthSignal = words.length > 45 ? 8 : words.length > 20 ? 4 : 0;
  const stressScore = clamp(stressHits.length * 11 + workloadScore + lengthSignal - focusHits.length * 8, 0, 100);
  let cognitiveState = "neutral"; if (stressScore >= 68) cognitiveState = "overwhelmed"; else if (stressScore >= 42) cognitiveState = "stressed"; else if (focusHits.length > stressHits.length || stressScore < 20) cognitiveState = "focused";
  const confidence = clamp(45 + stressHits.length * 9 + focusHits.length * 7 + Math.min(openTasks.length, 5) * 4, 45, 96);
  return { state: cognitiveState, score: stressScore, confidence, signals: [...stressHits.map((hit) => `stress: ${hit}`), ...focusHits.map((hit) => `focus: ${hit}`), `${openTasks.length} active task${openTasks.length === 1 ? "" : "s"}`, `${urgentTasks} due within 24h`] };
}

function renderAnalysis(analysis) {
  els.stressMeter.style.width = `${analysis.score}%`; els.confidenceText.textContent = `${analysis.confidence}% confidence`; els.stateBadge.textContent = titleCase(analysis.state); els.stateBadge.className = `state-badge ${analysis.state}`;
  const copy = { focused: "Low overload detected. CogniFlow can schedule harder work while attention appears available.", neutral: "Moderate cognitive load detected. CogniFlow balances urgent work with short recovery gaps.", stressed: "Stress signals detected. CogniFlow narrows the plan and protects time for urgent tasks first.", overwhelmed: "High overload detected. CogniFlow collapses the workload to a small set of critical next actions." };
  els.stateDetails.textContent = copy[analysis.state]; els.signalList.innerHTML = analysis.signals.map((signal) => `<span class="signal-chip">${escapeHtml(signal)}</span>`).join("");
}

function renderEmptyAnalysis() { els.stressMeter.style.width = "0%"; els.confidenceText.textContent = "0% confidence"; els.stateBadge.textContent = "Neutral"; els.stateBadge.className = "state-badge neutral"; els.stateDetails.textContent = "Add a real check-in sentence to estimate cognitive load."; els.signalList.innerHTML = ""; }

function buildPlan(analysis, tasks, notes, weakTopics) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  if (!openTasks.length) return ["Add your current academic tasks and deadlines.", "Write a short check-in about your current state.", "Run analysis again to create a priority plan."];
  const sorted = [...openTasks].sort((a, b) => taskScore(b) - taskScore(a)); const top = sorted[0]; const next = sorted[1]; const memoryHint = notes[0] ? `Open memory note "${notes[0].title}" before starting.` : "Use your latest notes before starting.";
  const weakHint = weakTopics[0] ? `Rapidly revise weak topic: ${weakTopics[0].course}: ${weakTopics[0].topic}.` : null;
  const plans = {
    overwhelmed: [`Work on "${top.title}" for 25 minutes only.`, next ? `Do one small subtask from "${next.title}" after a 10 minute reset.` : "Take a 10 minute reset break after the first block.", memoryHint, "Hide or postpone non-urgent tasks until the first block is complete."],
    stressed: [`Protect a 50 minute block for "${top.title}".`, next ? `Schedule "${next.title}" after a short break.` : "Review the result and decide the next action.", memoryHint, "Move low-priority work after the urgent deadline."],
    focused: [`Start 90 minutes of deep work on "${top.title}".`, next ? `Batch the next task: "${next.title}".` : "Write a completion summary after the block.", memoryHint],
    neutral: [`Complete the most urgent item first: "${top.title}".`, next ? `Prepare materials for "${next.title}".` : "Add one more concrete task if needed.", memoryHint, "Review the plan after one study block and adjust manually."]
  };
  const plan = plans[analysis.state] || plans.neutral; if (weakHint) plan.push(weakHint); return plan;
}

function renderPlan(plan, mode) { els.planMode.textContent = titleCase(mode); els.planList.innerHTML = plan.map((item) => `<li>${escapeHtml(item)}</li>`).join(""); }
function renderEmptyPlan() { latestPlan = []; els.planMode.textContent = "Waiting"; els.planList.innerHTML = "<li>Add tasks and run analysis to generate a plan.</li>"; }

function retrieveNotes(query, limit) {
  const queryVector = termVector(query);
  return state.notes.map((note) => ({ ...note, score: cosine(queryVector, termVector(`${note.title} ${note.body}`)) })).filter((note) => note.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildRetrievalQuery(input) {
  const openTasks = state.tasks.filter((task) => task.status !== "done").sort((a, b) => taskScore(b) - taskScore(a));
  const weightedTasks = openTasks.flatMap((task, index) => Array(index === 0 ? Math.max(task.priority * 3, 1) : Math.max(task.priority, 1)).fill(`${task.title} ${task.course}`));
  const weakTerms = inferWeakTopics().map((topic) => `${topic.course} ${topic.topic} ${topic.reflection}`);
  return [input, ...weightedTasks, ...weakTerms].join(" ");
}

function inferWeakTopics() {
  return state.studyLogs.filter((log) => weakWords.some((word) => log.reflection.toLowerCase().includes(word))).slice(0, 5);
}

function renderSummary() {
  const weakTopics = inferWeakTopics(); els.taskCount.textContent = String(state.tasks.length); els.noteCount.textContent = String(state.notes.length); els.logCount.textContent = String(state.studyLogs.length); els.weakCount.textContent = String(weakTopics.length); els.storageText.textContent = `localStorage ${Math.ceil(JSON.stringify(state).length / 1024)} KB`;
  els.weakTopicList.innerHTML = weakTopics.length ? weakTopics.map((topic) => `<div class="meta">${escapeHtml(topic.course)}: ${escapeHtml(topic.topic)}</div>`).join("") : '<p class="meta">No weak topics detected yet.</p>';
}

function acceptPlan() { if (!latestPlan.length) return showToast("Generate a plan first."); state.acceptedPlan = latestPlan; saveState(); renderAcceptedPlan(); els.humanLoopNote.textContent = "Plan accepted by the student. The AI recommendation is now a user-approved plan."; showToast("Plan accepted."); }
function rejectPlan() { state.acceptedPlan = []; saveState(); renderAcceptedPlan(); els.humanLoopNote.textContent = "Plan rejected. The student remains in control and can rerun analysis or edit tasks."; showToast("Plan rejected."); }
function editPlan() { if (!latestPlan.length) return showToast("Generate a plan first."); els.editablePlan.value = latestPlan.join("\n"); els.editDialog.showModal(); }
function saveEditedPlan() { latestPlan = els.editablePlan.value.split("\n").map((item) => item.trim()).filter(Boolean); state.acceptedPlan = latestPlan; saveState(); renderPlan(latestPlan, "edited"); renderAcceptedPlan(); els.humanLoopNote.textContent = "Plan edited and approved by the student."; els.editDialog.close(); showToast("Edited plan saved."); }
function renderAcceptedPlan() { els.acceptedPlanList.innerHTML = state.acceptedPlan.length ? `<ol class="plan-list">${state.acceptedPlan.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : '<p class="meta">No accepted plan yet.</p>'; }

function loadScenario() {
  state.lastCheckin = sampleScenario.checkin; els.checkinText.value = sampleScenario.checkin;
  state.tasks = sampleScenario.tasks.map((task) => normalizeTask({ ...task, id: uid() }));
  state.notes = sampleScenario.notes.map((note) => normalizeNote({ ...note, id: uid(), createdAt: todayOffset(0) }));
  state.studyLogs = sampleScenario.logs.map((log) => normalizeLog({ ...log, id: uid() }));
  state.acceptedPlan = []; state.lastAnalysis = null; latestPlan = []; saveState(); renderAll(); analyzeAndPlan(); showToast("Sample loaded.");
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `cogniflow-export-${todayOffset(0)}.json`; link.click(); URL.revokeObjectURL(url); showToast("Export downloaded.");
}

function importData(event) {
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = () => { const imported = parseStored(String(reader.result)); if (!imported) return showToast("Invalid JSON file."); state = normalizeState(imported); latestPlan = []; saveState(); renderAll(); showToast("Data imported."); };
  reader.readAsText(file); event.target.value = "";
}

function resetApp() { if (!confirm("Reset all CogniFlow data in this browser?")) return; state = structuredClone(emptyState); latestPlan = []; localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_STORAGE_KEY); els.checkinText.value = ""; resetTaskForm(); resetNoteForm(); resetLogForm(); renderAll(); showToast("App reset."); }
function clearCollection(key) { if (!confirm(`Clear all ${key}?`)) return; state[key] = []; latestPlan = []; saveState(); renderAll(); showToast("Cleared."); }

function termVector(text) { return tokenize(text).reduce((acc, word) => { if (word.length > 2) acc[word] = (acc[word] || 0) + 1; return acc; }, {}); }
function tokenize(text) { return String(text).toLowerCase().match(/[a-z0-9']+/g) || []; }
function cosine(a, b) { const keys = new Set([...Object.keys(a), ...Object.keys(b)]); let dot = 0, magA = 0, magB = 0; keys.forEach((key) => { dot += (a[key] || 0) * (b[key] || 0); magA += (a[key] || 0) ** 2; magB += (b[key] || 0) ** 2; }); return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0; }
function taskScore(task) { const urgency = Math.max(0, 7 - daysUntilNumber(task.due)); return task.priority * 10 + urgency * 4 - task.effortMinutes / 30; }
function todayOffset(offset) { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); }
function daysUntil(dateString) { const count = daysUntilNumber(dateString); if (count < 0) return "overdue"; if (count === 0) return "due today"; if (count === 1) return "due tomorrow"; return `due in ${count} days`; }
function daysUntilNumber(dateString) { const today = new Date(); today.setHours(0, 0, 0, 0); const due = new Date(dateString); due.setHours(0, 0, 0, 0); return Math.round((due - today) / 86400000); }
function formatDate(dateString) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${dateString}T00:00:00`)); }
function titleCase(value) { return `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)}`; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function qs(selector) { return document.querySelector(selector); }
function qsa(selector) { return [...document.querySelectorAll(selector)]; }
function showFieldError(element, message) { element.textContent = message; }
function showToast(message) { els.toast.textContent = message; els.toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200); }
function escapeHtml(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
