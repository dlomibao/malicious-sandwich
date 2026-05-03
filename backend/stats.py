"""Stats endpoints: submit a finished run, fetch global + per-player aggregates."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .db import connect
from .rate_limit import check as rate_limit_check

VALID_MOODS = {"foul", "pedantic", "hungover", "nostalgic", "smitten", "stoned", "generous"}

router = APIRouter(prefix="/api/stats", tags=["stats"])


class RunSubmit(BaseModel):
    player_id: str = Field(min_length=8, max_length=64)
    mood: str
    stars: int = Field(ge=0, le=6)
    verdict: str = Field(default="", max_length=200)
    num_directives: int = Field(ge=1, le=50)
    num_layers: int = Field(ge=0, le=50)
    total_chaos: int = Field(ge=0, le=500)
    provider: str | None = Field(default=None, max_length=32)


@router.post("/run", dependencies=[Depends(rate_limit_check)])
def submit_run(run: RunSubmit) -> dict[str, Any]:
    if run.mood not in VALID_MOODS:
        raise HTTPException(status_code=400, detail=f"Invalid mood: {run.mood}")
    with connect() as c:
        c.execute(
            """
            INSERT INTO runs (player_id, mood, stars, verdict, num_directives, num_layers, total_chaos, provider)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run.player_id,
                run.mood,
                run.stars,
                run.verdict,
                run.num_directives,
                run.num_layers,
                run.total_chaos,
                run.provider,
            ),
        )
    return {"ok": True}


@router.get("/summary")
def summary(player_id: str | None = None) -> dict[str, Any]:
    with connect() as c:
        total = c.execute("SELECT COUNT(*) FROM runs").fetchone()[0]
        by_mood = {
            r["mood"]: r["c"]
            for r in c.execute("SELECT mood, COUNT(*) AS c FROM runs GROUP BY mood")
        }
        by_stars = {
            str(r["stars"]): r["c"]
            for r in c.execute("SELECT stars, COUNT(*) AS c FROM runs GROUP BY stars")
        }
        by_mood_stars = [
            {"mood": r["mood"], "stars": r["stars"], "count": r["c"]}
            for r in c.execute(
                "SELECT mood, stars, COUNT(*) AS c FROM runs GROUP BY mood, stars"
            )
        ]
        transcend_count = c.execute("SELECT COUNT(*) FROM runs WHERE stars = 6").fetchone()[0]
        avg_chaos = c.execute("SELECT AVG(total_chaos) FROM runs").fetchone()[0] or 0

        result: dict[str, Any] = {
            "total_runs": total,
            "by_mood": by_mood,
            "by_stars": by_stars,
            "by_mood_stars": by_mood_stars,
            "transcend_count": transcend_count,
            "avg_chaos": round(float(avg_chaos), 1),
        }

        if player_id:
            row = c.execute(
                """
                SELECT
                    COUNT(*) AS runs,
                    COUNT(DISTINCT mood) AS moods_seen,
                    SUM(CASE WHEN stars = 6 THEN 1 ELSE 0 END) AS transcends,
                    MAX(stars) AS best_stars,
                    AVG(total_chaos) AS avg_chaos
                FROM runs WHERE player_id = ?
                """,
                (player_id,),
            ).fetchone()
            result["you"] = {
                "runs": row["runs"] or 0,
                "moods_seen": row["moods_seen"] or 0,
                "transcends": row["transcends"] or 0,
                "best_stars": row["best_stars"] or 0,
                "avg_chaos": round(float(row["avg_chaos"] or 0), 1),
            }

        return result
