import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { updatePlayer, listenToRoom, listenToPlayers, type Room, type RoomPlayer, updateRoom } from "@/lib/firestore";
import {
  CountryCard, GameOver, SelectionPhase, GameState, computeSizePopBonus,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./SabotageUI";
import { ChevronLeft, Home, Globe as GlobeIcon, Users, UserX, Skull } from "lucide-react";
import { Logo } from "../../components/Logo";
import { SidebarRoster } from "./SidebarRoster";

export default function SabotageGame() {
  const [, navigate] = useLocation();
  const { firebaseUser } = useFirebaseAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const roomCode = new URLSearchParams(window.location.search).get("room") || null;

  useEffect(() => {
    if (!roomCode) { navigate("/"); return; }
    const unsubRoom = listenToRoom(roomCode, setRoom);
    const unsubPlayers = listenToPlayers(roomCode, setPlayers);
    return () => { unsubRoom(); unsubPlayers(); };
  }, [roomCode, navigate]);

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = shuffleArray([...COUNTRIES]);
    return {
      pool, currentCountry: null, selectionOptions: null, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "sabotage", isHardMode,
      roomCode: roomCode, poolSeed: 0
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const rosterRef = useRef<HTMLDivElement>(null);

  // Re-sync with pool when room changes (if seeded)
  useEffect(() => {
    if (room && room.poolSeed && room.status === "playing" && state.pool.length === COUNTRIES.length && !state.gameOver) {
       // Just basic setup for sabotage for now
       setState(prev => ({ ...prev, poolSeed: room.poolSeed! }));
    }
  }, [room, state.pool.length, state.gameOver]);

  // Handle Sabotage round logic
  useEffect(() => {
    if (!room || room.status !== "playing" || !firebaseUser || state.gameOver) return;

    const me = players.find(p => p.uid === firebaseUser.uid);
    const opponent = players.find(p => p.uid !== firebaseUser.uid);

    if (!me || !opponent) return;

    if (!me.sabotageChoice && !state.selectionOptions && !me.finishedRound) {
       // We need to pick a sabotage choice for the opponent
       // In a real implementation we'd use the seeded pool, but for now just pick 2
       const pool = [...state.pool];
       const c1 = pool.pop(); const c2 = pool.pop();
       if (c1 && c2) {
           setState(prev => ({ ...prev, pool, selectionOptions: [c1, c2] }));
       }
    } else if (me.sabotageChoice && opponent.sabotageChoice && !state.currentCountry && !me.finishedRound) {
       // We've both chosen, give me my opponent's choice
       const myCountry = COUNTRIES.find(c => c.name === opponent.sabotageChoice) || null;
       setState(prev => ({ ...prev, currentCountry: myCountry }));
    } else if (me.finishedRound && opponent.finishedRound) {
       // Round over, reset for next
       updatePlayer(room.code, firebaseUser.uid, { finishedRound: false, sabotageChoice: null });
    }

  }, [room, players, firebaseUser, state.gameOver, state.selectionOptions, state.currentCountry, state.pool]);


  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const score = country.stats[key].score;
      return sum + score;
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
  const finalScore = totalScore + bonus;

  const onSelectionPick = useCallback((country: Country) => {
     if (roomCode && firebaseUser) {
        updatePlayer(roomCode, firebaseUser.uid, { sabotageChoice: country.name });
        setState(prev => ({ ...prev, selectionOptions: null }));
     }
  }, [roomCode, firebaseUser]);

  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category] || !roomCode || !firebaseUser) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);
      
      // Calculate score right away
      const baseScore = CATEGORIES.reduce((sum, cat) => {
        const country = newRoster[cat]; if (!country) return sum;
        if (BONUS_CATEGORIES.includes(cat)) return sum;
        const key = getCategoryKey(cat); return sum + country.stats[key].score;
      }, 0);
      const bonusScore = computeSizePopBonus(newRoster);
      const finalScore = baseScore + bonusScore;
      
      // Map roster to Record<string, string> of names
      const mappedRoster = {} as Record<string, string>;
      for (const cat of CATEGORIES) {
         if (newRoster[cat]) mappedRoster[cat] = newRoster[cat].name;
      }

      updatePlayer(roomCode, firebaseUser.uid, { finishedRound: true, score: finalScore, roster: mappedRoster });

      return {
        ...prev, roster: newRoster, currentCountry: null,
        gameOver: isGameOver
      };
    });
    setHoveredCategory(null);
  }, [state.roster, roomCode, firebaseUser]);

  const doReset = useCallback(() => {
     navigate("/");
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
            <header className="h-14 md:h-16 shrink-0 border-b border-white/5 bg-card/30 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 relative">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-bold text-sm uppercase tracking-widest z-10"
        >
          <ChevronLeft className="w-4 h-4" />
          Leave Game
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 font-serif font-bold text-xl">
            <Logo className="w-6 h-6" /> GeoDrafts
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {room && room.status === "playing" && !state.gameOver && (
          <div className="hidden md:flex w-80 bg-card/30 border-r border-border/50 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} isHardMode={state.isHardMode} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => {}} onWildcardSelect={() => {}} setWildcardPhase={() => {}} wildcardUsed={false} wildcardPhase={false} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => {}} gameMode="sabotage" leaderboardSubmitted={state.leaderboardSubmitted} room={room} players={players} />
          ) : room && room.status === "playing" && players.find(p => p.uid === firebaseUser?.uid)?.finishedRound && !players.every(p => p.finishedRound) ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" /><h2 className="text-2xl font-serif font-bold mb-2">Waiting for others...</h2><p className="text-muted-foreground">The next country will be revealed once everyone finishes this round.</p></div>
          ) : state.selectionOptions ? (
             <SelectionPhase options={state.selectionOptions} onPick={onSelectionPick} isHardMode={state.isHardMode} mode="sabotage" />
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
    </div>
  );
}
