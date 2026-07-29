import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  UsernameInputSchema,
  UserProfileSchema,
  RoomSchema,
  GameEndStatsSchema,
  FirebaseEnvSchema,
} from "./schemas";

describe("Security & Validation Schemas", () => {
  describe("sanitizeString", () => {
    it("strips ASCII control characters", () => {
      const input = "Hello\x00World\x1FTest";
      expect(sanitizeString(input)).toBe("HelloWorldTest");
    });

    it("trims whitespace and truncates to max length", () => {
      const input = "   Too long text   ";
      expect(sanitizeString(input, 5)).toBe("Too l");
    });
  });

  describe("UsernameInputSchema", () => {
    it("validates and sanitizes valid usernames", () => {
      const result = UsernameInputSchema.parse("  valid_user_123  ");
      expect(result).toBe("valid_user_123");
    });

    it("rejects usernames that are too short", () => {
      expect(() => UsernameInputSchema.parse("a")).toThrow();
    });

    it("rejects usernames with invalid characters like script tags", () => {
      expect(() => UsernameInputSchema.parse("<script>alert(1)</script>")).toThrow();
    });
  });

  describe("UserProfileSchema", () => {
    it("parses valid user profile objects", () => {
      const data = {
        uid: "user-123",
        username: "Player1",
        bestScore: 180,
        totalGames: 10,
      };
      const parsed = UserProfileSchema.parse(data);
      expect(parsed.uid).toBe("user-123");
      expect(parsed.bestScore).toBe(180);
      expect(parsed.unlockedAchievements).toEqual([]);
    });
  });

  describe("RoomSchema", () => {
    it("validates multiplayer room configuration", () => {
      const room = {
        code: "ABCDEF",
        mode: "sabotage",
        difficulty: "easy",
        hostId: "host-1",
        status: "waiting",
        currentRound: 0,
        poolSeed: 12345,
      };
      const parsed = RoomSchema.parse(room);
      expect(parsed.code).toBe("ABCDEF");
      expect(parsed.mode).toBe("sabotage");
    });

    it("rejects room code with invalid length", () => {
      const room = {
        code: "INVALID_LENGTH",
        mode: "sabotage",
        difficulty: "easy",
        hostId: "host-1",
        status: "waiting",
        currentRound: 0,
        poolSeed: 12345,
      };
      expect(() => RoomSchema.parse(room)).toThrow();
    });
  });

  describe("FirebaseEnvSchema", () => {
    it("fails when required Firebase variables are empty", () => {
      const env = {
        apiKey: "",
        authDomain: "domain.firebaseapp.com",
        projectId: "proj-1",
        appId: "app-1",
      };
      const result = FirebaseEnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });
  });
});
