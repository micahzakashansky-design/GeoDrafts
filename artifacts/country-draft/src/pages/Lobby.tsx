import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Users, Swords, PartyPopper, ChevronLeft } from "lucide-react";
import { useFirebaseAuth } from "../lib/use-firebase-auth";
import { listenToRoom, listenToPlayers, updateRoom, type Room, type RoomPlayer } from "../lib/firestore";
import { Logo } from "../components/Logo";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center font-sans">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/50 font-bold tracking-widest text-sm uppercase"
        >
          Loading Lobby...
        </motion.div>
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
    <div className="flex flex-col min-h-screen bg-[#000000] text-white overflow-hidden font-sans selection:bg-white/20">
      <header className="h-20 shrink-0 px-6 md:px-8 flex items-center justify-between z-20 mix-blend-difference">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => navigate("/")} 
            className="font-sans text-xl md:text-2xl font-black tracking-tighter flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo className="w-6 h-6 opacity-90" />GeoDrafts
          </motion.button>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:flex items-center gap-2 tracking-widest uppercase">
            <Users className="w-3.5 h-3.5" /> Multiplayer Lobby
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 relative flex flex-col md:flex-row justify-between gap-12 max-w-7xl mx-auto w-full">
        {/* Left Side: Room Code & Players */}
        <div className="flex-1 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-sm font-black text-white/40 uppercase tracking-widest mb-3">Room Code</h2>
            <div className="text-7xl md:text-8xl font-black tracking-tighter text-white leading-none">{room.code}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">Players ({players.length})</h3>
            <div className="grid gap-3 p-1 bg-white/5 rounded-3xl border border-white/10">
              {players.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={p.uid} 
                  className="flex items-center justify-between p-4 rounded-[1.25rem] bg-[#080808] border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-2xl">
                      {p.username[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-xl tracking-tight">{p.username}</span>
                  </div>
                  {p.uid === room.hostId && (
                    <span className="text-xs bg-yellow-500 text-black px-4 py-1.5 rounded-full font-black uppercase tracking-widest">Host</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Settings (Bottom Right pinned on desktop) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:w-[440px] shrink-0 flex flex-col justify-end mt-auto"
        >
          <div className="space-y-6 bg-[#080808] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            {/* Difficulty Radio (Pills) */}
            <div className="flex bg-[#000000] rounded-2xl p-1.5 shadow-inner border border-white/5">
              <button
                onClick={() => handleDifficultyChange("easy")}
                disabled={!isHost}
                className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                  room.difficulty === "easy"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/40 hover:text-white/80"
                } ${!isHost && "cursor-default opacity-80"}`}
              >
                Classic
              </button>
              <button
                onClick={() => handleDifficultyChange("hard")}
                disabled={!isHost}
                className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                  room.difficulty === "hard"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/40 hover:text-white/80"
                } ${!isHost && "cursor-default opacity-80"}`}
              >
                Hard
              </button>
            </div>

            {/* Game Mode Radio */}
            <div className="space-y-3">
              <motion.button
                whileHover={isHost ? { scale: 1.02 } : {}}
                whileTap={isHost ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => handleModeChange("sabotage")}
                disabled={!isHost}
                className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                  room.mode === "sabotage"
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-white/10 bg-[#000000] hover:bg-white/5"
                } ${!isHost && "cursor-default"}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "sabotage" ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white/50"}`}>
                  <Swords className="w-7 h-7" />
                </div>
                <div>
                  <div className={`font-black text-xl tracking-tight ${room.mode === "sabotage" ? "text-white" : "text-white/80"}`}>Sabotage</div>
                  <div className="text-sm font-medium text-white/40 mt-1">Pick for your opponent</div>
                </div>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "sabotage" ? "border-red-500" : "border-white/20"}`}>
                  {room.mode === "sabotage" && (
                    <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-red-500" />
                  )}
                </div>
              </motion.button>

              <motion.button
                whileHover={isHost ? { scale: 1.02 } : {}}
                whileTap={isHost ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={() => handleModeChange("party")}
                disabled={!isHost}
                className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                  room.mode === "party"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-[#000000] hover:bg-white/5"
                } ${!isHost && "cursor-default"}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "party" ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/50"}`}>
                  <PartyPopper className="w-7 h-7" />
                </div>
                <div>
                  <div className={`font-black text-xl tracking-tight ${room.mode === "party" ? "text-white" : "text-white/80"}`}>Party</div>
                  <div className="text-sm font-medium text-white/40 mt-1">Same countries for all</div>
                </div>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "party" ? "border-emerald-500" : "border-white/20"}`}>
                  {room.mode === "party" && (
                    <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-emerald-500" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Play Button */}
            {isHost ? (
              <motion.button
                whileHover={players.length >= 2 ? { scale: 1.02, backgroundColor: "#ffffff" } : {}}
                whileTap={players.length >= 2 ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={handlePlay}
                disabled={players.length < 2}
                className="w-full py-5 rounded-2xl bg-white/90 text-black font-black text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:shadow-none uppercase tracking-widest mt-8"
              >
                Start Game
              </motion.button>
            ) : (
              <div className="w-full py-5 rounded-2xl bg-white/5 text-white/40 font-black text-center uppercase tracking-widest mt-8">
                Waiting for host...
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
