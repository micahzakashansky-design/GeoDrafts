import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { COUNTRIES, Country } from "@/data/countries";
import { seededShuffle } from "../party/PartyUI";
import { AssociationsUI } from "./AssociationsUI";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { listenToRoom, listenToPlayers, updateRoom, updatePlayer, type Room, type RoomPlayer } from "@/lib/firestore";
import type { TaskType, Question } from "./AssociationsGame";
import { SettingsButton } from "@/components/SettingsButton";
import { isDevModeActive } from "@/lib/dev-logic";

// Simple seeded PRNG
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export default function AssociationsRace() {
  const [, setLocation] = useLocation();
  const { firebaseUser } = useFirebaseAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const roomCode = new URLSearchParams(window.location.search).get("room") || null;

  useEffect(() => {
    if (!roomCode) { setLocation("/"); return; }
    const unsubRoom = listenToRoom(roomCode, setRoom);
    const unsubPlayers = listenToPlayers(roomCode, setPlayers);
    return () => { unsubRoom(); unsubPlayers(); };
  }, [roomCode, setLocation]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [validIsos, setValidIsos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showDevAnswer, setShowDevAnswer] = useState(false);

  // Re-sync and build questions when room starts
  useEffect(() => {
    if (room && room.status === "playing" && questions.length === 0 && room.associationsSettings) {
      const storedTasks = room.associationsSettings.tasks as TaskType[];
      const storedCountries = room.associationsSettings.countries as string[];

      const pool = COUNTRIES.filter(c => storedCountries.includes(c.name));
      const poolIsos = pool.map(c => c.isoNumeric);
      setValidIsos(poolIsos);

      const generated: Question[] = [];
      const shuffledPool = seededShuffle(pool, room.poolSeed);
      const prng = mulberry32(room.poolSeed);

      for (const country of shuffledPool) {
        const task = storedTasks[Math.floor(prng() * storedTasks.length)];
        
        let options: Country[] | undefined = undefined;
        if (task === "find_flag") {
          const others = seededShuffle(COUNTRIES.filter(c => c.isoNumeric !== country.isoNumeric), prng() * 1000000).slice(0, 8);
          options = seededShuffle([country, ...others], prng() * 1000000);
        }

        generated.push({ country, task, options });
        if (generated.length === 10) break;
      }

      setQuestions(generated);
      setStartTime(Date.now());
    }
  }, [room, questions.length]);

  const handleCorrect = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setScore(s => s + 1);
      setCurrentIndex(i => i + 1);
    } else {
      setScore(s => s + 1);
      if (roomCode && firebaseUser && startTime) {
        const timeTaken = Date.now() - startTime;
        updatePlayer(roomCode, firebaseUser.uid, { completionTime: timeTaken, finishedRound: true });
      }
    }
  }, [currentIndex, questions.length, roomCode, firebaseUser, startTime]);

  const handleSkip = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      if (roomCode && firebaseUser && startTime) {
        const timeTaken = Date.now() - startTime;
        updatePlayer(roomCode, firebaseUser.uid, { completionTime: timeTaken, finishedRound: true });
      }
    }
  }, [currentIndex, questions.length, roomCode, firebaseUser, startTime]);

  const currentPlayer = useMemo(() => {
    return players.find(p => p.uid === firebaseUser?.uid);
  }, [players, firebaseUser]);

  const isGameOver = currentPlayer?.finishedRound;

  if (!room) {
    return <div className="min-h-screen flex items-center justify-center">Loading lobby...</div>;
  }

  if (room.status === "waiting") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 animate-pulse">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-bold mb-2">Associations Race</h2>
        <p className="text-muted-foreground mb-8">Room Code: <span className="text-foreground font-bold tracking-widest">{room.code}</span></p>
        
        <div className="w-full max-w-sm space-y-3 mb-8">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">Players ({players.length})</p>
          {players.map(p => (
            <div key={p.uid} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {p.username[0].toUpperCase()}
                </div>
                <span className="font-semibold">{p.username}</span>
              </div>
              {p.uid === room.hostId && <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">HOST</span>}
            </div>
          ))}
        </div>

        {firebaseUser?.uid === room.hostId ? (
          <Button 
            size="lg" 
            className="font-bold px-12 py-6 text-lg rounded-2xl shadow-xl"
            onClick={() => updateRoom(room.code, { status: "playing" })}
          >
            Start Race
          </Button>
        ) : (
          <p className="text-primary font-medium animate-pulse">Waiting for host to begin...</p>
        )}
      </div>
    );
  }

  if (isGameOver) {
    // Sort players by completion time
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.completionTime === undefined) return 1;
      if (b.completionTime === undefined) return -1;
      return a.completionTime - b.completionTime;
    });

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border p-8 rounded-2xl text-center space-y-6"
        >
          <div className="text-6xl mb-4">🏁</div>
          <h1 className="text-3xl font-bold font-serif">Race Finished!</h1>
          <p className="text-muted-foreground text-lg mb-6">
            You scored <span className="font-bold text-foreground">{score}</span> out of {questions.length}.
          </p>

          <div className="text-left space-y-2">
            <h3 className="font-bold uppercase text-xs text-muted-foreground tracking-wider mb-3">Leaderboard</h3>
            {sortedPlayers.map((p, idx) => (
              <div key={p.uid} className={`flex items-center justify-between p-3 rounded-lg border ${p.uid === firebaseUser?.uid ? "border-primary bg-primary/10" : "border-border bg-secondary/30"}`}>
                <div className="flex items-center gap-3">
                  <span className="font-bold w-4">{idx + 1}.</span>
                  <span className="font-semibold">{p.username}</span>
                </div>
                {p.completionTime ? (
                  <span className="font-mono text-sm">{(p.completionTime / 1000).toFixed(1)}s</span>
                ) : (
                  <span className="text-xs text-muted-foreground animate-pulse">Racing...</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <Button className="w-full font-bold" size="lg" onClick={() => setLocation("/game/associations/setup")}>
              Host New Race
            </Button>
            <Button variant="secondary" className="w-full font-bold" size="lg" onClick={() => setLocation("/")}>
              Main Menu
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const handleDoubleClick = () => {
    if (isDevModeActive(firebaseUser?.displayName || firebaseUser?.uid)) {
      // Wait, firebase profile doesn't map username to displayName in this app? 
      // In associations race it gets it from currentPlayer.
      setShowDevAnswer(true);
      setTimeout(() => setShowDevAnswer(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 border-b border-border flex items-center justify-between bg-card z-10 relative">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="font-bold font-serif text-lg flex items-center gap-2">
            Associations Race <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-widest ml-2">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium bg-secondary/50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {questions.length} • Score: {score}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SettingsButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden" onDoubleClick={() => {
        if (currentPlayer && isDevModeActive(currentPlayer.username)) {
          setShowDevAnswer(true);
          setTimeout(() => setShowDevAnswer(false), 2000);
        }
      }}>
        {showDevAnswer && currentQuestion && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-8 py-4 rounded-xl z-50 text-4xl font-bold tracking-widest pointer-events-none">
            {currentQuestion.country.name}
          </div>
        )}
        <AssociationsUI 
          question={currentQuestion}
          onCorrect={handleCorrect}
          onSkip={handleSkip}
          validIsos={validIsos}
          key={currentIndex} 
        />
      </main>
    </div>
  );
}
