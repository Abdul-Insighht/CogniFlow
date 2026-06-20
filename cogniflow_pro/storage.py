"""SQLite persistence for CogniFlow Pro."""

from __future__ import annotations

import sqlite3
from datetime import date
from pathlib import Path

from cogniflow_pro.models import Note, StudyLog, Task


class CogniFlowStore:
    def __init__(self, db_path: str | Path = "cogniflow.db") -> None:
        self.db_path = Path(db_path)
        self.connection = sqlite3.connect(self.db_path)
        self.connection.row_factory = sqlite3.Row
        self.initialize()

    def initialize(self) -> None:
        self.connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'user_input',
                created_at TEXT NOT NULL DEFAULT CURRENT_DATE
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                course TEXT NOT NULL,
                due_date TEXT NOT NULL,
                priority INTEGER NOT NULL,
                effort_minutes INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'open'
            );
            CREATE TABLE IF NOT EXISTS study_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                study_date TEXT NOT NULL,
                course TEXT NOT NULL,
                topic TEXT NOT NULL,
                minutes INTEGER NOT NULL,
                reflection TEXT NOT NULL
            );
            """
        )
        self.connection.commit()

    def close(self) -> None:
        self.connection.close()

    def clear_all(self) -> None:
        self.connection.executescript(
            """
            DELETE FROM study_logs;
            DELETE FROM tasks;
            DELETE FROM notes;
            """
        )
        self.connection.commit()

    def add_note(self, note: Note) -> None:
        self.connection.execute(
            "INSERT INTO notes (title, body, source) VALUES (?, ?, ?)",
            (note.title, note.body, note.source),
        )
        self.connection.commit()

    def add_task(self, task: Task) -> None:
        self.connection.execute(
            "INSERT INTO tasks (title, course, due_date, priority, effort_minutes) VALUES (?, ?, ?, ?, ?)",
            (task.title, task.course, task.due_date.isoformat(), task.priority, task.effort_minutes),
        )
        self.connection.commit()

    def add_study_log(self, log: StudyLog) -> None:
        self.connection.execute(
            "INSERT INTO study_logs (study_date, course, topic, minutes, reflection) VALUES (?, ?, ?, ?, ?)",
            (log.study_date.isoformat(), log.course, log.topic, log.minutes, log.reflection),
        )
        self.connection.commit()

    def list_notes(self) -> list[Note]:
        rows = self.connection.execute("SELECT title, body, source FROM notes ORDER BY id").fetchall()
        return [Note(row["title"], row["body"], row["source"]) for row in rows]

    def list_tasks(self) -> list[Task]:
        rows = self.connection.execute(
            "SELECT title, course, due_date, priority, effort_minutes FROM tasks WHERE status = 'open' ORDER BY due_date, priority DESC"
        ).fetchall()
        return [
            Task(row["title"], row["course"], date.fromisoformat(row["due_date"]), row["priority"], row["effort_minutes"])
            for row in rows
        ]

    def list_study_logs(self) -> list[StudyLog]:
        rows = self.connection.execute(
            "SELECT study_date, course, topic, minutes, reflection FROM study_logs ORDER BY study_date DESC"
        ).fetchall()
        return [
            StudyLog(date.fromisoformat(row["study_date"]), row["course"], row["topic"], row["minutes"], row["reflection"])
            for row in rows
        ]

    def seed_if_empty(self, notes: list[Note], tasks: list[Task], study_logs: list[StudyLog]) -> None:
        if self.connection.execute("SELECT COUNT(*) FROM notes").fetchone()[0] == 0:
            for note in notes:
                self.add_note(note)
        if self.connection.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 0:
            for task in tasks:
                self.add_task(task)
        if self.connection.execute("SELECT COUNT(*) FROM study_logs").fetchone()[0] == 0:
            for log in study_logs:
                self.add_study_log(log)

