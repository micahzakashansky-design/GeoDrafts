import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { leaderboardTable } from "@workspace/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const submitSchema = z.object({
  score: z.number().int().min(0),
  mode: z.string(),
  roster: z.record(z.string(), z.string()),
});

router.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const mode = req.query.mode as string | undefined;

    const entries = mode
      ? await db.select().from(leaderboardTable).where(eq(leaderboardTable.mode, mode)).orderBy(desc(leaderboardTable.score)).limit(limit)
      : await db.select().from(leaderboardTable).orderBy(desc(leaderboardTable.score)).limit(limit);

    res.json(
      entries.map((e) => ({
        id: e.id,
        playerName: e.playerName,
        score: e.score,
        mode: e.mode,
        roster: e.roster,
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.post("/leaderboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Sign in to submit your score" });
    return;
  }

  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const user = req.user;
  const playerName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "Anonymous";

  try {
    const { score, mode, roster } = parsed.data;

    // For daily mode: enforce one submission per user per day
    if (mode === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await db
        .select({ id: leaderboardTable.id })
        .from(leaderboardTable)
        .where(
          sql`${leaderboardTable.mode} = 'daily'
            AND ${leaderboardTable.playerName} = ${playerName}
            AND ${leaderboardTable.createdAt} >= ${today}`
        )
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ error: "Daily score already submitted for today" });
        return;
      }
    }

    const [entry] = await db
      .insert(leaderboardTable)
      .values({ playerName, score, mode, roster })
      .returning();

    res.status(201).json({
      id: entry.id,
      playerName: entry.playerName,
      score: entry.score,
      mode: entry.mode,
      roster: entry.roster,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

export default router;
