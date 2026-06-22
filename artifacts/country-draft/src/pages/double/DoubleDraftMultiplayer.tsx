import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import { seededShuffle } from "../party/PartyUI";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { updatePlayer, listenToRoom, listenToPlayers, type Room, type RoomPlayer, updateRoom } from "@/lib/firestore";
import { computeSizePopBonus } from "@/lib/achievements-logic";
import {
  CountryCard, GameOver, SelectionPhase, GameState,
  CATEGORY_ICONS, CATEGORY_MAX_SCORES, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./DoubleUI";
import { SidebarRoster } from "./SidebarRoster";
import { Home, Globe as GlobeIcon, Users } from "lucide-react";
import { Logo } from "../../components/Logo";
import { SettingsButton } from "@/components/SettingsButton";
import { drawDevCountry, isDevModeActive } from "@/lib/dev-logic";

export default function DoubleDraftMultiplayer() {
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
      dailyDate: "", leaderboardSubmitted: false, mode: "double", isHardMode,
      roomCode: roomCode, poolSeed: 0, categoryTimes: {}, currentTurnStartTime: Date.now()
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [wildcardPhase, setWildcardPhase] = useState(false);
  const rosterRef = useRef<HTMLDivElement>(null);

  // Re-sync with pool when room changes and begins
  useEffect(() => {
    if (room && room.poolSeed && room.status === "playing" && state.pool.length === COUNTRIES.length && !state.gameOver && !state.selectionOptions && !state.currentCountry) {
       const seededPool = seededShuffle([...COUNTRIES], room.poolSeed);
       let c1, c2;
       
       if (isDevModeActive(firebaseUser?.displayName || firebaseUser?.uid)) {
           // Since we don't have profile handy here easily, use firebaseUser. But wait, in the multiplayer component, 
           // let's just see if we can get the profile or use a simpler check:
           // Actually `isDevModeActive` uses `profile?.username`. Since we might not have `profile` here,
           // we can just pass the string we have or fetch it from `players`.
           // Let's find currentPlayer.
           const currentPlayer = players.find(p => p.uid === firebaseUser?.uid);
           c1 = isDevModeActive(currentPlayer?.username) ? drawDevCountry(seededPool, {}) : seededPool.pop();
           c2 = isDevModeActive(currentPlayer?.username) ? drawDevCountry(seededPool, {}) : seededPool.pop();
       } else {
           c1 = seededPool.pop(); c2 = seededPool.pop();
       }
       
       const selection = (c1 && c2) ? [c1, c2] : null;
       setState(prev => ({ ...prev, poolSeed: room.poolSeed!, pool: seededPool, selectionOptions: selection }));
    }
  }, [room, state.pool.length, state.gameOver, state.selectionOptions, state.currentCountry, players, firebaseUser]);

  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const score = country.stats[key]?.score || 0;
      return sum + score;
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
  const finalScore = totalScore + bonus;

  const onSelectionPick = useCallback((country: Country) => {
    setState(prev => ({ ...prev, currentCountry: country, selectionOptions: null }));
  }, []);

  const applyWildcard = useCallback((cat: Category) => {
    if (!wildcardPhase || state.wildcardUsed) return;
    setState(prev => {
      const newRoster = { ...prev.roster };
      delete newRoster[cat];
      const newPool = [...prev.pool];
      const nextCountry = newPool.pop() || null;
      return { ...prev, roster: newRoster, currentCountry: nextCountry, pool: newPool, wildcardUsed: true, selectionOptions: null };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed]);

  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category] || !roomCode || !firebaseUser) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);
      
      const newPool = [...prev.pool];
      let nextOptions = null;
      if (!isGameOver) {
        let c1, c2;
        const currentPlayer = players.find(p => p.uid === firebaseUser?.uid);
        if (isDevModeActive(currentPlayer?.username)) {
          c1 = drawDevCountry(newPool, newRoster);
          c2 = drawDevCountry(newPool, newRoster);
        } else {
          c1 = newPool.pop(); c2 = newPool.pop();
        }
        if (c1 && c2) nextOptions = [c1, c2];
      }

      if (isGameOver) {
        // Calculate score
        const baseScore = CATEGORIES.reduce((sum, cat) => {
          const country = newRoster[cat]; if (!country) return sum;
          if (BONUS_CATEGORIES.includes(cat)) return sum;
          const key = getCategoryKey(cat); return sum + (country.stats[key]?.score || 0);
        }, 0);
        const bonusScore = computeSizePopBonus(newRoster);
        const finalScore = baseScore + bonusScore;
        
        // Map roster to Record<string, string> of names
        const mappedRoster = {} as Record<string, string>;
        for (const cat of CATEGORIES) {
           if (newRoster[cat]) mappedRoster[cat] = newRoster[cat].name;
        }

        updatePlayer(roomCode, firebaseUser.uid, { finishedRound: true, score: finalScore, roster: mappedRoster });
      }

      return {
        ...prev, roster: newRoster, pool: newPool, currentCountry: null, selectionOptions: nextOptions,
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
      <header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-75">
            <Logo className="w-5 h-5" />GeoDrafts
          </button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <div className="px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold text-muted-foreground border border-border hidden sm:flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Double Draft Party
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SettingsButton />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {room && room.status === "playing" && !state.gameOver && (
          <div className="hidden md:flex w-80 bg-card/30 border-r border-border/50 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <SidebarRoster roster={state.roster} />
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => {}} gameMode="double" leaderboardSubmitted={state.leaderboardSubmitted} room={room} players={players} />
          ) : room && room.status === "waiting" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 animate-pulse"><Users className="w-12 h-12 text-primary" /></div><h2 className="text-3xl font-serif font-bold mb-2">Game Lobby</h2><p className="text-muted-foreground mb-8">Room Code: <span className="text-foreground font-bold tracking-widest">{room.code}</span></p><div className="w-full max-w-sm space-y-3 mb-8"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">Players ({players.length})</p>{players.map(p => (<div key={p.uid} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">{p.username[0].toUpperCase()}</div><span className="font-semibold">{p.username}</span></div>{p.uid === room.hostId && <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">HOST</span>}</div>))}</div>{firebaseUser?.uid === room.hostId ? (<button onClick={() => updateRoom(room.code, { status: "playing" })} className="px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl">Start Match</button>) : (<p className="text-primary font-medium animate-pulse">Waiting for host to begin...</p>)}</div>
          ) : state.selectionOptions ? (
             <SelectionPhase options={state.selectionOptions} onPick={onSelectionPick} isHardMode={state.isHardMode} mode="double" />
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
