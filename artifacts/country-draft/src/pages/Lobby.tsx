import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Users from "lucide-react/dist/esm/icons/users";
import Swords from "lucide-react/dist/esm/icons/swords";
import PartyPopper from "lucide-react/dist/esm/icons/party-popper";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import Brain from "lucide-react/dist/esm/icons/brain";
import Gavel from "lucide-react/dist/esm/icons/gavel";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import { useFirebaseAuth } from "../lib/use-firebase-auth";
import { listenToRoom, listenToPlayers, updateRoom, updatePlayer, type Room, type RoomPlayer } from "../lib/firestore";
import { Logo } from "../components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsButton } from "@/components/SettingsButton";
import { AssociationsConfigModal } from "@/components/AssociationsConfigModal";
import { toast } from "sonner";

export default function Lobby() {
  const [, navigate] = useLocation();
  const { firebaseUser } = useFirebaseAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isSavingNickname, setIsSavingNickname] = useState(false);
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
    if (roomCode) {
      localStorage.setItem("countryDraftRoomCode", roomCode);
    }
  }, [roomCode]);

  useEffect(() => {
    if (room && room.status === "playing") {
      localStorage.setItem("countryDraftRoomCode", room.code);
      navigate(`/game/${room.mode}?room=${room.code}`);
    }
  }, [room, navigate]);

  if (!room || !firebaseUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-muted-foreground font-bold tracking-widest text-sm uppercase"
        >
          Loading Lobby...
        </motion.div>
      </div>
    );
  }

  const isHost = firebaseUser.uid === room.hostId;
  const is2PlayerOnlyMode = room.mode === "sabotage" || room.mode === "auction";
  const isOverPlayerLimit = is2PlayerOnlyMode && players.length > 2;

  const handleDifficultyChange = (diff: "easy" | "hard") => {
    if (isHost && room.difficulty !== diff) {
      updateRoom(room.code, { difficulty: diff });
    }
  };

  const handleModeChange = (mode: "sabotage" | "party" | "double_draft" | "associations_race" | "auction") => {
    if (isHost && room.mode !== mode) {
      if ((mode === "sabotage" || mode === "auction") && players.length > 2) {
        return; // Cannot switch to 2-player mode with > 2 players
      }
      if (mode === "associations_race") {
        // Provide default options if switching to associations race
        updateRoom(room.code, { mode, associationsSettings: { tasks: ["identify_from_flag", "identify_from_map", "click_on_map", "find_flag", "identify_capital", "identify_country_from_capital"], countries: [] } });
      } else {
        updateRoom(room.code, { mode });
      }
    }
  };

  const handlePlay = () => {
    if (isHost && !isOverPlayerLimit && players.length >= 2) {
      updateRoom(room.code, { status: "playing" });
    }
  };

  const handleSaveNickname = async () => {
    if (!roomCode || !firebaseUser || !nicknameInput.trim()) return;
    setIsSavingNickname(true);
    try {
      await updatePlayer(roomCode, firebaseUser.uid, { username: nicknameInput.trim() });
      setEditingNickname(false);
      toast.success("Nickname updated");
    } catch (err) {
      toast.error("Failed to update nickname");
    } finally {
      setIsSavingNickname(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-foreground/20">
      <header className="h-20 shrink-0 px-6 md:px-8 flex items-center justify-between z-20 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0">
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
          <div className="h-6 w-px bg-foreground/10 hidden md:block" />
          <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground hidden sm:flex items-center gap-2 tracking-widest uppercase">
            <Users className="w-3.5 h-3.5" /> Multiplayer Lobby
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SettingsButton />
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
            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-3">Room Code</h2>
            <div className="text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-none">{room.code}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">Players ({players.length})</h3>
            <div className="grid gap-3 p-1 bg-foreground/5 rounded-3xl border border-border">
              {players.map((p, i) => {
                const isMe = p.uid === firebaseUser.uid;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    key={p.uid} 
                    className="flex items-center justify-between p-4 rounded-[1.25rem] bg-card border border-border/50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-foreground/10 flex items-center justify-center text-foreground font-black text-2xl shrink-0">
                        {(editingNickname && isMe ? (nicknameInput[0] || p.username[0]) : p.username[0]).toUpperCase()}
                      </div>
                      
                      {editingNickname && isMe ? (
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                          <input
                            type="text"
                            autoFocus
                            maxLength={18}
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveNickname();
                              if (e.key === "Escape") setEditingNickname(false);
                            }}
                            className="bg-background border border-border rounded-xl px-3 py-1 font-bold text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                            placeholder="New nickname"
                          />
                          <button
                            onClick={handleSaveNickname}
                            disabled={isSavingNickname || !nicknameInput.trim()}
                            className="p-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shrink-0"
                            title="Save Nickname"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingNickname(false)}
                            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl tracking-tight">{p.username}</span>
                          {isMe && (
                            <button
                              onClick={() => {
                                setNicknameInput(p.username);
                                setEditingNickname(true);
                              }}
                              className="p-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Change nickname in lobby"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Nickname</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {p.uid === room.hostId && (
                        <span className="text-xs bg-yellow-500 text-black px-4 py-1.5 rounded-full font-black uppercase tracking-widest">Host</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
          <div className="space-y-6 bg-card p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            {/* Difficulty Radio (Pills) */}
            <AnimatePresence>
              {(room.mode === "party" || room.mode === "sabotage") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    <div className="flex bg-background rounded-2xl p-1.5 shadow-inner border border-border/50">
                      {(isHost || room.difficulty === "easy") && (
                        <button
                          onClick={() => handleDifficultyChange("easy")}
                          disabled={!isHost}
                          className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                            room.difficulty === "easy"
                              ? "bg-white text-black shadow-sm"
                              : "text-muted-foreground hover:text-foreground/80"
                          } ${!isHost && "cursor-default"}`}
                        >
                          Normal
                        </button>
                      )}
                      {(isHost || room.difficulty === "hard") && (
                        <button
                          onClick={() => handleDifficultyChange("hard")}
                          disabled={!isHost}
                          className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                            room.difficulty === "hard"
                              ? "bg-white text-black shadow-sm"
                              : "text-muted-foreground hover:text-foreground/80"
                          } ${!isHost && "cursor-default"}`}
                        >
                          Blind
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Mode Radio */}
            <div className="space-y-3">
              {(isHost || room.mode === "auction") && (
                <motion.button
                  whileHover={isHost && players.length <= 2 ? { scale: 1.02 } : {}}
                  whileTap={isHost && players.length <= 2 ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => handleModeChange("auction")}
                  disabled={!isHost || players.length > 2}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                    room.mode === "auction"
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-border bg-background hover:bg-foreground/5"
                  } ${(!isHost || players.length > 2) && "opacity-50 cursor-not-allowed"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "auction" ? "bg-amber-500/20 text-amber-500" : "bg-foreground/10 text-muted-foreground"}`}>
                    <Gavel className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`font-black text-xl tracking-tight ${room.mode === "auction" ? "text-foreground" : "text-foreground/80"}`}>Auction</div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">2 Players Max</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">Bid & outbid for countries</div>
                  </div>
                  <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "auction" ? "border-amber-500" : "border-border"} ${!isHost ? "hidden" : ""}`}>
                    {room.mode === "auction" && (
                      <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-amber-500" />
                    )}
                  </div>
                </motion.button>
              )}

              {(isHost || room.mode === "sabotage") && (
                <motion.button
                  whileHover={isHost && players.length <= 2 ? { scale: 1.02 } : {}}
                  whileTap={isHost && players.length <= 2 ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => handleModeChange("sabotage")}
                  disabled={!isHost || players.length > 2}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                    room.mode === "sabotage"
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-border bg-background hover:bg-foreground/5"
                  } ${(!isHost || players.length > 2) && "opacity-50 cursor-not-allowed"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "sabotage" ? "bg-red-500/20 text-red-500" : "bg-foreground/10 text-muted-foreground"}`}>
                    <Swords className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`font-black text-xl tracking-tight ${room.mode === "sabotage" ? "text-foreground" : "text-foreground/80"}`}>Sabotage</div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">2 Players Max</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">Pick for your opponent</div>
                  </div>
                  <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "sabotage" ? "border-red-500" : "border-border"} ${!isHost ? "hidden" : ""}`}>
                    {room.mode === "sabotage" && (
                      <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-red-500" />
                    )}
                  </div>
                </motion.button>
              )}

              {(isHost || room.mode === "party") && (
                <motion.button
                  whileHover={isHost ? { scale: 1.02 } : {}}
                  whileTap={isHost ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => handleModeChange("party")}
                  disabled={!isHost}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                    room.mode === "party"
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-border bg-background hover:bg-foreground/5"
                  } ${!isHost && "cursor-default"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "party" ? "bg-emerald-500/20 text-emerald-500" : "bg-foreground/10 text-muted-foreground"}`}>
                    <PartyPopper className="w-7 h-7" />
                  </div>
                  <div>
                    <div className={`font-black text-xl tracking-tight ${room.mode === "party" ? "text-foreground" : "text-foreground/80"}`}>Party</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">Same countries for all</div>
                  </div>
                  <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "party" ? "border-emerald-500" : "border-border"} ${!isHost ? "hidden" : ""}`}>
                    {room.mode === "party" && (
                      <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </motion.button>
              )}

              {(isHost || room.mode === "double_draft") && (
                <motion.button
                  whileHover={isHost ? { scale: 1.02 } : {}}
                  whileTap={isHost ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => handleModeChange("double_draft")}
                  disabled={!isHost}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                    room.mode === "double_draft"
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-border bg-background hover:bg-foreground/5"
                  } ${!isHost && "cursor-default"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "double_draft" ? "bg-blue-500/20 text-blue-500" : "bg-foreground/10 text-muted-foreground"}`}>
                    <ArrowLeftRight className="w-7 h-7" />
                  </div>
                  <div>
                    <div className={`font-black text-xl tracking-tight ${room.mode === "double_draft" ? "text-foreground" : "text-foreground/80"}`}>Double Draft</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">Pick from random pairs</div>
                  </div>
                  <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "double_draft" ? "border-blue-500" : "border-border"} ${!isHost ? "hidden" : ""}`}>
                    {room.mode === "double_draft" && (
                      <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                </motion.button>
              )}

              {(isHost || room.mode === "associations_race") && (
                <motion.button
                  whileHover={isHost ? { scale: 1.02 } : {}}
                  whileTap={isHost ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => handleModeChange("associations_race")}
                  disabled={!isHost}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-colors text-left ${
                    room.mode === "associations_race"
                      ? "border-pink-500/50 bg-pink-500/10"
                      : "border-border bg-background hover:bg-foreground/5"
                  } ${!isHost && "cursor-default"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${room.mode === "associations_race" ? "bg-pink-500/20 text-pink-500" : "bg-foreground/10 text-muted-foreground"}`}>
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <div className={`font-black text-xl tracking-tight ${room.mode === "associations_race" ? "text-foreground" : "text-foreground/80"}`}>Associations</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">Link countries & facts</div>
                  </div>
                  <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${room.mode === "associations_race" ? "border-pink-500" : "border-border"} ${!isHost ? "hidden" : ""}`}>
                    {room.mode === "associations_race" && (
                      <motion.div layoutId="mode-dot" className="w-3 h-3 rounded-full bg-pink-500" />
                    )}
                  </div>
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {room.mode === "associations_race" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pb-1">
                    <AssociationsConfigModal 
                      initialTasks={room.associationsSettings?.tasks as string[] | undefined}
                      initialCountries={room.associationsSettings?.countries as string[] | undefined}
                      onSave={(tasks, countries) => {
                        updateRoom(room.code, { associationsSettings: { tasks, countries } });
                      }}
                      disabled={!isHost}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Play Button */}
            {isHost ? (
              <div className="space-y-2 mt-8">
                <motion.button
                  whileHover={players.length >= 2 && !isOverPlayerLimit ? { scale: 1.02, backgroundColor: "#ffffff" } : {}}
                  whileTap={players.length >= 2 && !isOverPlayerLimit ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onClick={handlePlay}
                  disabled={players.length < 2 || isOverPlayerLimit}
                  className="w-full py-5 rounded-2xl bg-white/90 text-black font-black text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:shadow-none uppercase tracking-widest"
                >
                  Start Game
                </motion.button>
                {isOverPlayerLimit && (
                  <div className="text-xs text-red-400 font-bold text-center">
                    {room.mode === "auction" ? "Auction" : "Sabotage"} mode requires 2 players max (current: {players.length}).
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full py-5 rounded-2xl bg-foreground/5 text-muted-foreground font-black text-center uppercase tracking-widest mt-8">
                Waiting for host...
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
