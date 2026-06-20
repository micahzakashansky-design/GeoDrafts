import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Users, Swords, PartyPopper, ChevronLeft } from "lucide-react";
import { useFirebaseAuth } from "../lib/use-firebase-auth";
import { listenToRoom, listenToPlayers, updateRoom, type Room, type RoomPlayer } from "../lib/firestore";
import { Logo } from "../components/Logo";

export default function Lobby() {
  const [, navigate] = useLocation();
  const { firebaseUser } = useFirebaseAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const roomCode = new URLSearchParams(window.location.search).get("room") || null;

  useEffect(() => {
    if (!roomCode) {
      navigate("/");
      return;
    }
    const unsubRoom = listenToRoom(roomCode, setRoom);
    const unsubPlayers = listenToPlayers(roomCode, setPlayers);
    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room && room.status === "playing") {
      navigate(`/game/${room.mode}?room=${room.code}`);
    }
  }, [room, navigate]);

  if (!room || !firebaseUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading Lobby...</div>
      </div>
    );
  }

  const isHost = firebaseUser.uid === room.hostId;

  const handleDifficultyChange = (diff: "easy" | "hard") => {
    if (isHost && room.difficulty !== diff) {
      updateRoom(room.code, { difficulty: diff });
    }
  };

  const handleModeChange = (mode: "sabotage" | "party") => {
    if (isHost && room.mode !== mode) {
      updateRoom(room.code, { mode: mode });
    }
  };

  const handlePlay = () => {
    if (isHost) {
      updateRoom(room.code, { status: "playing" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden font-sans">
            <header className="h-14 md:h-16 shrink-0 border-b border-white/5 bg-card/30 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 relative">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-bold text-sm uppercase tracking-widest z-10"
        >
          <ChevronLeft className="w-4 h-4" />
          Leave Lobby
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 font-serif font-bold text-xl">
            <Logo className="w-6 h-6" /> GeoDrafts
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 md:p-12 relative flex flex-col md:flex-row justify-between gap-8">
        {/* Left Side: Room Code & Players */}
        <div className="flex-1 max-w-2xl">
          <div className="mb-8">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Room Code</h2>
            <div className="text-6xl font-black tracking-widest text-primary">{room.code}</div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Players ({players.length})</h3>
            <div className="grid gap-3">
              {players.map((p) => (
                <div key={p.uid} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                      {p.username[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-lg">{p.username}</span>
                  </div>
                  {p.uid === room.hostId && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Settings (Bottom Right pinned on desktop) */}
        <div className="md:w-[400px] shrink-0 flex flex-col justify-end ml-auto mt-auto">
          <div className="space-y-6 bg-card/50 p-6 rounded-3xl border border-border/50 shadow-xl">
            {/* Difficulty Radio (Pills) */}
            <div className="flex bg-[#1E2330] rounded-xl p-1 shadow-inner border border-white/5">
              <button
                onClick={() => handleDifficultyChange("easy")}
                disabled={!isHost}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                  room.difficulty === "easy"
                    ? "bg-[#FBBF24] text-[#111827] shadow-sm"
                    : "text-white/50 hover:text-white/80"
                } ${!isHost && "cursor-default opacity-80"}`}
              >
                Classic
              </button>
              <button
                onClick={() => handleDifficultyChange("hard")}
                disabled={!isHost}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                  room.difficulty === "hard"
                    ? "bg-[#FBBF24] text-[#111827] shadow-sm"
                    : "text-white/50 hover:text-white/80"
                } ${!isHost && "cursor-default opacity-80"}`}
              >
                Hard
              </button>
            </div>

            {/* Game Mode Radio */}
            <div className="space-y-3">
              <button
                onClick={() => handleModeChange("sabotage")}
                disabled={!isHost}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${
                  room.mode === "sabotage"
                    ? "border-[#FBBF24]/50 bg-[#FBBF24]/5"
                    : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
                } ${!isHost && "cursor-default"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${room.mode === "sabotage" ? "bg-red-500/20 text-red-400" : "bg-red-500/10 text-red-400/70"}`}>
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <div className={`font-bold text-lg ${room.mode === "sabotage" ? "text-white" : "text-white/80"}`}>Sabotage (2 Player)</div>
                  <div className="text-sm text-muted-foreground">Pick for your opponent</div>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${room.mode === "sabotage" ? "border-[#FBBF24]" : "border-muted-foreground/30"}`}>
                  {room.mode === "sabotage" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleModeChange("party")}
                disabled={!isHost}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${
                  room.mode === "party"
                    ? "border-[#FBBF24]/50 bg-[#FBBF24]/5"
                    : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
                } ${!isHost && "cursor-default"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${room.mode === "party" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500/10 text-emerald-400/70"}`}>
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <div className={`font-bold text-lg ${room.mode === "party" ? "text-white" : "text-white/80"}`}>Party (No Limit)</div>
                  <div className="text-sm text-muted-foreground">Same countries for everyone</div>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${room.mode === "party" ? "border-[#FBBF24]" : "border-muted-foreground/30"}`}>
                  {room.mode === "party" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  )}
                </div>
              </button>
            </div>

            {/* Play Button */}
            {isHost ? (
              <button
                onClick={handlePlay}
                disabled={room.mode === "sabotage" && players.length < 2}
                className="w-full py-4 rounded-xl bg-[#FBBF24] text-[#111827] font-black text-xl hover:bg-[#FBBF24]/90 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:shadow-none uppercase tracking-widest mt-4"
              >
                Play
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl bg-secondary/50 text-muted-foreground font-bold text-center uppercase tracking-widest mt-4">
                Waiting for host...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
