"""SQLite stats store. Synchronous; FastAPI runs sync `def` handlers in a threadpool."""

from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager

DB_PATH = os.environ.get("STATS_DB_PATH", "./sandwich.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  mood TEXT NOT NULL,
  stars INTEGER NOT NULL,
  verdict TEXT,
  num_directives INTEGER NOT NULL,
  num_layers INTEGER NOT NULL,
  total_chaos INTEGER NOT NULL,
  provider TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_player ON runs(player_id);
CREATE INDEX IF NOT EXISTS idx_runs_mood_stars ON runs(mood, stars);
"""


def init_db() -> None:
    with connect() as c:
        c.executescript(SCHEMA)


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
