import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { leaderboardTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const submitSchema = z.object({
  playerName: z.string().min(1).max(40),
  score: z.number().int().min(0),
  mode: z.string(),
  roster: z.record(z.string(), z.string()),
});

router.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const mode = req.query.mode as string | undefined;

    let query = db
      .select()
      .from(leaderboardTable)
      .orderBy(desc(leaderboardTable.score))
      .limit(limit);

    const entries = mode
      ? await db.select().from(leaderboardTable).where(eq(leaderboardTable.mode, mode)).orderBy(desc(leaderboardTable.score)).limit(limit)
      : await query;

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
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const { playerName, score, mode, roster } = parsed.data;
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
