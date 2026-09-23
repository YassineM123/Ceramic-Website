from __future__ import annotations

import sqlite3
from pathlib import Path


class SignalStore:
    def __init__(self, path: str = "signals.sqlite3") -> None:
        self.path = Path(path)
        self.connection = sqlite3.connect(self.path)
        self.connection.execute(
            """
            CREATE TABLE IF NOT EXISTS processed_messages (
                message_key TEXT PRIMARY KEY,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        self.connection.commit()

    def has_processed(self, message_key: str) -> bool:
        row = self.connection.execute(
            "SELECT 1 FROM processed_messages WHERE message_key = ?",
            (message_key,),
        ).fetchone()
        return row is not None

    def mark_processed(self, message_key: str) -> None:
        self.connection.execute(
            "INSERT OR IGNORE INTO processed_messages(message_key) VALUES (?)",
            (message_key,),
        )
        self.connection.commit()
