import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Gavel from "lucide-react/dist/esm/icons/gavel";
import Coins from "lucide-react/dist/esm/icons/coins";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Shield from "lucide-react/dist/esm/icons/shield";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Users from "lucide-react/dist/esm/icons/users";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Check from "lucide-react/dist/esm/icons/check";
import Lock from "lucide-react/dist/esm/icons/lock";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Bot from "lucide-react/dist/esm/icons/bot";

import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { listenToRoom, listenToPlayers, updateRoom, updatePlayer, type Room, type RoomPlayer } from "@/lib/firestore";
import { COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray, type Country, type Category } from "@/data/countries";
import { computeSizePopBonus } from "@/lib/achievements-logic";
import { seededShuffle, CATEGORY_ICONS, BONUS_CATEGORIES } from "../party/PartyUI";
import { Logo } from "@/components/Logo";
import { SettingsButton } from "@/components/SettingsButton";

export default function AuctionGame() {
  const [location, navigate] = useLocation();
  const { firebaseUser, profile } = useFirebaseAuth();

  const roomCode = useMemo(() => {
    const fromSearch = new URLSearchParams(window.location.search).get("room");
    if (fromSearch) return fromSearch;
    if (location.includes("?")) {
      const q = location.split("?")[1];
      const fromLoc = new URLSearchParams(q).get("room");
      if (fromLoc) return fromLoc;
    }
    return localStorage.getItem("countryDraftRoomCode") || null;
  }, [location]);

  const isMultiplayer = Boolean(roomCode);

  // Multiplayer state
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);

  // Single Player (VS AI Bot) state
  const [spRound, setSpRound] = useState(0);
  const [spPool] = useState<Country[]>(() => shuffleArray([...COUNTRIES]));
  const [spMyMoney, setSpMyMoney] = useState(200);
  const [spBotMoney, setSpBotMoney] = useState(200);
  const [spMyRoster, setSpMyRoster] = useState<Record<string, string>>({});
  const [spBotRoster, setSpBotRoster] = useState<Record<string, string>>({});
  const [spAuctionState, setSpAuctionState] = useState<{
    firstBidderId: string;
    firstBid: number | null;
    winnerId: string | null;
    winningBid: number | null;
    status: "bidding" | "responding" | "drafting";
  }>({
    firstBidderId: "me",
    firstBid: null,
    winnerId: null,
    winningBid: null,
    status: "bidding",
  });

  // Input states
  const [bidInput, setBidInput] = useState<string>("");
  const [outbidInput, setOutbidInput] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);

  // Subscribe to multiplayer room & players if in multiplayer mode
  useEffect(() => {
    if (!roomCode) return;
    const unsubRoom = listenToRoom(roomCode, setRoom);
    const unsubPlayers = listenToPlayers(roomCode, setPlayers);
    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [roomCode]);

  // Derived current user and opponent for Multiplayer
  const mpMe = useMemo(() => players.find((p) => p.uid === firebaseUser?.uid), [players, firebaseUser]);
  const mpOpponent = useMemo(() => players.find((p) => p.uid !== firebaseUser?.uid), [players, firebaseUser]);

  // Effective Active Player & Opponent
  const myName = profile?.username || firebaseUser?.displayName || "Player 1";
  const myMoney = isMultiplayer ? (mpMe?.money ?? 200) : spMyMoney;
  const opponentName = isMultiplayer ? (mpOpponent?.username || "Opponent") : "AI Drafter Bot";
  const opponentMoney = isMultiplayer ? (mpOpponent?.money ?? 200) : spBotMoney;

  const myRoster = isMultiplayer ? (mpMe?.roster || {}) : spMyRoster;
  const opponentRoster = isMultiplayer ? (mpOpponent?.roster || {}) : spBotRoster;

  const myFilledCount = useMemo(() => Object.keys(myRoster).length, [myRoster]);
  const opponentFilledCount = useMemo(() => Object.keys(opponentRoster).length, [opponentRoster]);

  const isMyRosterFull = myFilledCount >= CATEGORIES.length;
  const isOpponentRosterFull = opponentFilledCount >= CATEGORIES.length;
  const isBothRostersFull = isMyRosterFull && isOpponentRosterFull;

  // Country pool derived from seed or single player shuffle
  const fullPool = useMemo(() => {
    if (isMultiplayer) {
      if (!room?.poolSeed) return [];
      return seededShuffle([...COUNTRIES], room.poolSeed);
    }
    return spPool;
  }, [isMultiplayer, room?.poolSeed, spPool]);

  // Lower-ranked pool for $0 finishing
  const lowerRankedPool = useMemo(() => {
    if (!fullPool.length) return [];
    return fullPool.filter((c) => c.tier === "third" || c.tier === "fourth");
  }, [fullPool]);

  // Current round index
  const currentRound = isMultiplayer ? (room?.currentRound ?? 0) : spRound;

  // Current Country
  const currentCountry = useMemo(() => {
    if (!fullPool.length) return null;
    if (isBothRostersFull) return null;

    if (isMyRosterFull && opponentMoney === 0) {
      if (!lowerRankedPool.length) return fullPool[currentRound % fullPool.length];
      return lowerRankedPool[currentRound % lowerRankedPool.length];
    }
    if (isOpponentRosterFull && myMoney === 0) {
      if (!lowerRankedPool.length) return fullPool[currentRound % fullPool.length];
      return lowerRankedPool[currentRound % lowerRankedPool.length];
    }

    return fullPool[currentRound % fullPool.length];
  }, [fullPool, lowerRankedPool, currentRound, isBothRostersFull, isMyRosterFull, isOpponentRosterFull, myMoney, opponentMoney]);

  // Who bids first?
  const mpFirstBidderId = useMemo(() => {
    if (!room) return "";
    if (isOpponentRosterFull && !isMyRosterFull) return firebaseUser?.uid ?? "";
    if (isMyRosterFull && !isOpponentRosterFull) return mpOpponent?.uid ?? "";
    return currentRound % 2 === 0 ? room.hostId : (mpOpponent?.uid || room.hostId);
  }, [room, currentRound, isMyRosterFull, isOpponentRosterFull, firebaseUser, mpOpponent]);

  const spFirstBidderId = useMemo(() => {
    if (isOpponentRosterFull && !isMyRosterFull) return "me";
    if (isMyRosterFull && !isOpponentRosterFull) return "bot";
    return currentRound % 2 === 0 ? "me" : "bot";
  }, [currentRound, isMyRosterFull, isOpponentRosterFull]);

  const firstBidderId = isMultiplayer ? mpFirstBidderId : spAuctionState.firstBidderId;
  const amIFirstBidder = isMultiplayer ? (firebaseUser?.uid === firstBidderId) : (firstBidderId === "me");

  // Auction State
  const mpAuctionState = room?.auctionState as {
    firstBid?: number | null;
    winnerId?: string | null;
    winningBid?: number | null;
    status?: "bidding" | "responding" | "drafting";
  } | undefined;

  const currentStatus = isMultiplayer ? (mpAuctionState?.status || "bidding") : spAuctionState.status;
  const firstBid = isMultiplayer ? (mpAuctionState?.firstBid ?? null) : spAuctionState.firstBid;
  const winnerId = isMultiplayer ? (mpAuctionState?.winnerId ?? null) : spAuctionState.winnerId;
  const winningBid = isMultiplayer ? (mpAuctionState?.winningBid ?? null) : spAuctionState.winningBid;

  const amIWinner = isMultiplayer ? (firebaseUser?.uid === winnerId) : (winnerId === "me");

  // Reset inputs when round changes
  useEffect(() => {
    setBidInput("");
    setOutbidInput("");
    setInputError(null);
  }, [currentRound]);

  // --- SINGLE PLAYER AI BOT BRAIN ---
  const calculateCountryValue = useCallback((country: Country, roster: Record<string, string>) => {
    let maxVal = 0;
    CATEGORIES.forEach((cat) => {
      if (!roster[cat] && !BONUS_CATEGORIES.includes(cat)) {
        const key = getCategoryKey(cat);
        const score = country.stats[key]?.score ?? 0;
        if (score > maxVal) maxVal = score;
      }
    });
    return maxVal;
  }, []);

  // Single player Bot action handler
  useEffect(() => {
    if (isMultiplayer || isBothRostersFull || !currentCountry) return;

    // Solo drafting logic for single player
    if (currentStatus === "bidding" && (isMyRosterFull || isOpponentRosterFull)) {
      const soloIsMe = !isMyRosterFull;
      const soloMoney = soloIsMe ? spMyMoney : spBotMoney;
      const soloBid = soloMoney > 0 ? 1 : 0;
      const soloId = soloIsMe ? "me" : "bot";

      setSpAuctionState({
        firstBidderId: soloId,
        firstBid: soloBid,
        winnerId: soloId,
        winningBid: soloBid,
        status: "drafting",
      });

      if (!soloIsMe) {
        // Auto assign bot country in solo mode
        const bestCat = CATEGORIES.find((cat) => !spBotRoster[cat]) || CATEGORIES[0];
        setSpBotRoster((prev) => ({ ...prev, [bestCat]: currentCountry.name }));
        setSpBotMoney((prev) => Math.max(0, prev - soloBid));
        setTimeout(() => {
          setSpRound((r) => r + 1);
          setSpAuctionState({ firstBidderId: "me", firstBid: null, winnerId: null, winningBid: null, status: "bidding" });
        }, 500);
      }
      return;
    }

    let timer: NodeJS.Timeout | null = null;

    // Bot is First Bidder
    if (spFirstBidderId === "bot" && currentStatus === "bidding") {
      timer = setTimeout(() => {
        const bestVal = calculateCountryValue(currentCountry, spBotRoster);
        let botBid = 0;
        if (bestVal >= 8) botBid = Math.min(spBotMoney, Math.floor(Math.random() * 25) + 15);
        else if (bestVal >= 5) botBid = Math.min(spBotMoney, Math.floor(Math.random() * 10) + 5);
        else botBid = Math.min(spBotMoney, Math.floor(Math.random() * 3));

        setSpAuctionState({
          firstBidderId: "bot",
          firstBid: botBid,
          winnerId: null,
          winningBid: null,
          status: "responding",
        });
      }, 700);
    }

    // Bot is Responding to Player's bid
    if (spFirstBidderId === "me" && currentStatus === "responding" && firstBid !== null && !winnerId) {
      if (spBotMoney <= firstBid) {
        // Bot cannot afford to outbid -> auto resolve
        setSpAuctionState((prev) => ({
          ...prev,
          status: "drafting",
          winnerId: "me",
          winningBid: firstBid,
        }));
      } else {
        timer = setTimeout(() => {
          const bestVal = calculateCountryValue(currentCountry, spBotRoster);
          const botMaxWilling = Math.min(spBotMoney, Math.round(bestVal * 4.5));

          if (botMaxWilling > firstBid && spBotMoney > firstBid) {
            const outbidVal = firstBid + 1 + Math.floor(Math.random() * Math.min(5, spBotMoney - firstBid));
            const finalOutbid = Math.min(spBotMoney, outbidVal);

            // Bot wins by outbidding!
            const bestCat = CATEGORIES.find((cat) => !spBotRoster[cat]) || CATEGORIES[0];
            setSpBotRoster((prev) => ({ ...prev, [bestCat]: currentCountry.name }));
            setSpBotMoney((prev) => Math.max(0, prev - finalOutbid));

            setSpAuctionState({
              firstBidderId: "me",
              firstBid,
              winnerId: "bot",
              winningBid: finalOutbid,
              status: "drafting",
            });

            setTimeout(() => {
              setSpRound((r) => r + 1);
              setSpAuctionState({ firstBidderId: (spRound + 1) % 2 === 0 ? "me" : "bot", firstBid: null, winnerId: null, winningBid: null, status: "bidding" });
            }, 1200);
          } else {
            // Bot passes -> Player wins for firstBid
            setSpAuctionState((prev) => ({
              ...prev,
              status: "drafting",
              winnerId: "me",
              winningBid: firstBid,
            }));
          }
        }, 800);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMultiplayer, isBothRostersFull, currentCountry, currentStatus, spFirstBidderId, firstBid, winnerId, spBotMoney, spMyRoster, spBotRoster, calculateCountryValue, spMyMoney, spRound, isMyRosterFull, isOpponentRosterFull]);

  // Multiplayer auto-resolution when responding bidder cannot afford to raise
  useEffect(() => {
    if (!isMultiplayer || !room || !mpMe || !mpOpponent || room.status !== "playing") return;
    if (currentStatus === "responding" && firstBid !== null && firstBid !== undefined && !winnerId) {
      const respondingPlayer = players.find((p) => p.uid !== firstBidderId);
      if (respondingPlayer && (respondingPlayer.money ?? 200) <= firstBid) {
        if (firebaseUser?.uid === room.hostId) {
          updateRoom(room.code, {
            auctionState: {
              ...mpAuctionState,
              status: "drafting",
              winnerId: firstBidderId,
              winningBid: firstBid,
            },
          });
        }
      }
    }
  }, [isMultiplayer, room, mpMe, mpOpponent, currentStatus, firstBid, winnerId, firstBidderId, players, firebaseUser, mpAuctionState]);

  // Submit initial bid
  const handleFirstBid = useCallback(() => {
    if (!currentCountry) return;
    const cleanDigits = bidInput.replace(/\D/g, "");
    if (!cleanDigits) {
      setInputError("Please enter a valid amount");
      return;
    }
    const val = parseInt(cleanDigits, 10);
    if (isNaN(val) || val < 0) {
      setInputError("Bid cannot be negative");
      return;
    }
    if (val > myMoney) {
      setInputError(`Cannot bid more than your total money ($${myMoney})`);
      return;
    }

    setInputError(null);
    if (isMultiplayer && room) {
      updateRoom(room.code, {
        auctionState: {
          firstBid: val,
          status: "responding",
          winnerId: null,
          winningBid: null,
        },
      });
    } else {
      setSpAuctionState({
        firstBidderId: "me",
        firstBid: val,
        winnerId: null,
        winningBid: null,
        status: "responding",
      });
    }
  }, [isMultiplayer, room, currentCountry, bidInput, myMoney]);

  // Submit outbid
  const handleOutbid = useCallback(() => {
    if (firstBid === null) return;
    const cleanDigits = outbidInput.replace(/\D/g, "");
    if (!cleanDigits) {
      setInputError("Please enter an outbid amount");
      return;
    }
    const val = parseInt(cleanDigits, 10);
    if (isNaN(val) || val <= firstBid) {
      setInputError(`Outbid must be higher than current bid ($${firstBid})`);
      return;
    }
    if (val > myMoney) {
      setInputError(`Cannot bid more than your total money ($${myMoney})`);
      return;
    }

    setInputError(null);
    if (isMultiplayer && room && mpMe) {
      updateRoom(room.code, {
        auctionState: {
          ...mpAuctionState,
          status: "drafting",
          winnerId: mpMe.uid,
          winningBid: val,
        },
      });
    } else {
      setSpAuctionState({
        firstBidderId: spAuctionState.firstBidderId,
        firstBid,
        winnerId: "me",
        winningBid: val,
        status: "drafting",
      });
    }
  }, [isMultiplayer, room, mpMe, firstBid, outbidInput, myMoney, mpAuctionState, spAuctionState.firstBidderId]);

  // Give country to opponent
  const handleGiveOpponent = useCallback(() => {
    if (firstBid === null) return;
    if (isMultiplayer && room) {
      updateRoom(room.code, {
        auctionState: {
          ...mpAuctionState,
          status: "drafting",
          winnerId: firstBidderId,
          winningBid: firstBid,
        },
      });
    } else {
      // Player gives country to Bot
      if (currentCountry) {
        const bestCat = CATEGORIES.find((cat) => !spBotRoster[cat]) || CATEGORIES[0];
        setSpBotRoster((prev) => ({ ...prev, [bestCat]: currentCountry.name }));
        setSpBotMoney((prev) => Math.max(0, prev - firstBid));
      }
      setSpAuctionState({
        firstBidderId: "bot",
        firstBid,
        winnerId: "bot",
        winningBid: firstBid,
        status: "drafting",
      });
      setTimeout(() => {
        setSpRound((r) => r + 1);
        setSpAuctionState({ firstBidderId: (spRound + 1) % 2 === 0 ? "me" : "bot", firstBid: null, winnerId: null, winningBid: null, status: "bidding" });
      }, 1000);
    }
  }, [isMultiplayer, room, firstBid, firstBidderId, mpAuctionState, currentCountry, spBotRoster, spRound]);

  // Assign won country to roster category
  const handleAssignCategory = useCallback(
    (cat: Category) => {
      if (!currentCountry || !amIWinner || myRoster[cat]) return;
      const price = winningBid ?? 0;

      if (isMultiplayer && room && mpMe) {
        const newMoney = Math.max(0, myMoney - price);
        const newRoster = { ...myRoster, [cat]: currentCountry.name };

        updatePlayer(room.code, mpMe.uid, {
          roster: newRoster,
          money: newMoney,
          finishedRound: true,
        });

        if (mpOpponent) {
          updatePlayer(room.code, mpOpponent.uid, { finishedRound: true });
        }
      } else {
        // Single player assignment
        setSpMyMoney((m) => Math.max(0, m - price));
        setSpMyRoster((prev) => ({ ...prev, [cat]: currentCountry.name }));

        setTimeout(() => {
          setSpRound((r) => r + 1);
          setSpAuctionState({
            firstBidderId: (spRound + 1) % 2 === 0 ? "me" : "bot",
            firstBid: null,
            winnerId: null,
            winningBid: null,
            status: "bidding",
          });
        }, 300);
      }
    },
    [currentCountry, amIWinner, myRoster, winningBid, isMultiplayer, room, mpMe, myMoney, mpOpponent, spRound]
  );

  // Synchronize round completion for Multiplayer
  useEffect(() => {
    if (!isMultiplayer || !room || room.status !== "playing") return;
    if (mpMe?.finishedRound && mpOpponent?.finishedRound) {
      if (firebaseUser?.uid === room.hostId) {
        updatePlayer(room.code, room.hostId, { finishedRound: false });
        if (mpOpponent) updatePlayer(room.code, mpOpponent.uid, { finishedRound: false });
        updateRoom(room.code, {
          currentRound: room.currentRound + 1,
          auctionState: null,
        });
      }
    }
  }, [isMultiplayer, room, mpMe, mpOpponent, firebaseUser]);

  // Score calculations
  const calculateScore = useCallback((roster: Record<string, string>) => {
    let base = 0;
    const fullRosterObj: Partial<Record<Category, Country>> = {};
    CATEGORIES.forEach((cat) => {
      const countryName = roster[cat];
      if (countryName) {
        const country = COUNTRIES.find((c) => c.name === countryName);
        if (country) {
          fullRosterObj[cat] = country;
          if (!BONUS_CATEGORIES.includes(cat)) {
            const key = getCategoryKey(cat);
            base += country.stats[key]?.score ?? 0;
          }
        }
      }
    });
    const bonus = computeSizePopBonus(fullRosterObj);
    return { base, bonus, total: base + bonus };
  }, []);

  const myScores = useMemo(() => calculateScore(myRoster), [myRoster, calculateScore]);
  const opponentScores = useMemo(() => calculateScore(opponentRoster), [opponentRoster, calculateScore]);

  // Winner calculation for end game screen
  const isGameOver = isBothRostersFull || (isMultiplayer && room?.status === "finished");
  const winnerInfo = useMemo(() => {
    if (!isGameOver) return null;
    if (myScores.total > opponentScores.total) return { isMe: true, reason: "Higher Total Points" };
    if (opponentScores.total > myScores.total) return { isMe: false, reason: "Higher Total Points" };
    if (myMoney > opponentMoney) return { isMe: true, reason: "Tiebreaker: Remaining Money" };
    if (opponentMoney > myMoney) return { isMe: false, reason: "Tiebreaker: Remaining Money" };
    return { isMe: null, reason: "Exact Tie!" };
  }, [isGameOver, myScores.total, opponentScores.total, myMoney, opponentMoney]);

  // --- GAME OVER SCREEN ---
  if (isGameOver) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 md:p-12 font-sans max-w-6xl mx-auto selection:bg-foreground/20">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/")} className="font-black text-2xl tracking-tighter flex items-center gap-3 hover:opacity-80">
            <Logo className="w-6 h-6 opacity-90" /> GeoDrafts
          </button>
          <div className="flex items-center gap-3">
            <SettingsButton />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center space-y-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-sm uppercase tracking-widest">
              <Gavel className="w-4 h-4" /> Auction Concluded
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              {winnerInfo?.isMe === true ? "🏆 VICTORY!" : winnerInfo?.isMe === false ? "DEFEAT" : "IT'S A TIE!"}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">{winnerInfo?.reason}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-card p-6 rounded-3xl border border-border space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h3 className="font-black text-xl">{myName} (You)</h3>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Coins className="w-3.5 h-3.5" /> ${myMoney} Remaining
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400">{myScores.total} pts</div>
                  <div className="text-xs text-muted-foreground font-bold">Base: {myScores.base} + Bonus: {myScores.bonus}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CATEGORIES.map((cat) => (
                  <div key={cat} className="p-2.5 rounded-xl bg-foreground/5 border border-border/40 flex items-center justify-between">
                    <span className="font-bold text-muted-foreground">{cat}</span>
                    <span className="font-black text-foreground truncate max-w-[100px]">{myRoster[cat] || "-"}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-card p-6 rounded-3xl border border-border space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h3 className="font-black text-xl">{opponentName}</h3>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Coins className="w-3.5 h-3.5" /> ${opponentMoney} Remaining
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400">{opponentScores.total} pts</div>
                  <div className="text-xs text-muted-foreground font-bold">Base: {opponentScores.base} + Bonus: {opponentScores.bonus}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {CATEGORIES.map((cat) => (
                  <div key={cat} className="p-2.5 rounded-xl bg-foreground/5 border border-border/40 flex items-center justify-between">
                    <span className="font-bold text-muted-foreground">{cat}</span>
                    <span className="font-black text-foreground truncate max-w-[100px]">{opponentRoster[cat] || "-"}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <button onClick={() => navigate("/")} className="px-8 py-4 rounded-2xl bg-foreground text-background font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-widest">
            Return to Home
          </button>
        </main>
      </div>
    );
  }

  // --- ACTIVE GAMEPLAY SCREEN ---
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-foreground/20">
      {/* Top Header */}
      <header className="h-20 shrink-0 px-6 md:px-8 flex items-center justify-between z-20 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="font-black text-xl md:text-2xl tracking-tighter flex items-center gap-3 hover:opacity-80">
            <Logo className="w-6 h-6 opacity-90" /> GeoDrafts
          </button>
          <div className="h-6 w-px bg-foreground/10 hidden md:block" />
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
            <Gavel className="w-3.5 h-3.5" /> {isMultiplayer ? "Auction Multiplayer" : "Auction VS AI Bot"}
          </div>
        </div>

        {/* Players & Money Header Bar */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                {myName[0].toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground">{myName} (You)</div>
                <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> ${myMoney}
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                {!isMultiplayer ? <Bot className="w-4 h-4" /> : opponentName[0].toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground">{opponentName}</div>
                <div className="text-sm font-black text-blue-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> ${opponentMoney}
                </div>
              </div>
            </div>
          </div>

          <SettingsButton />
        </div>
      </header>

      {/* Main Gameplay Layout */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Country Card & Bidding Controls (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Current Country Card */}
          {currentCountry && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-[2rem] border border-border shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-6xl drop-shadow-md">{currentCountry.flag}</span>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">{currentCountry.name}</h2>
                    <p className="text-sm font-medium text-muted-foreground">{currentCountry.capital} &bull; {currentCountry.region}</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-foreground/5 border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Round {currentRound + 1}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {CATEGORIES.map((cat) => {
                  const key = getCategoryKey(cat);
                  const stat = currentCountry.stats[key];
                  const score = stat?.score;
                  if (score === undefined) return null;

                  return (
                    <div key={cat} className="p-3 rounded-2xl bg-foreground/[0.03] border border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{CATEGORY_ICONS[cat]}</span>
                        <span className="text-xs font-bold text-muted-foreground truncate max-w-[80px]">{cat}</span>
                      </div>
                      <span className="text-sm font-black text-foreground">{score} pts</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Action & Bidding Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card p-8 rounded-[2rem] border border-border shadow-2xl space-y-6">
            {!isMyRosterFull && !isOpponentRosterFull && (
              <>
                {/* Phase 1: First Bidder Turn */}
                {currentStatus === "bidding" && (
                  <div className="space-y-4">
                    {amIFirstBidder ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-xl tracking-tight flex items-center gap-2 text-amber-400">
                            <Gavel className="w-5 h-5" /> Your Turn to Bid First
                          </h3>
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                            Available: ${myMoney}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Enter your opening bid in whole dollars. Your opponent must outbid you or let you keep the country for this price.
                        </p>

                        <div className="space-y-3">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-bold">$</div>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={bidInput}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setBidInput(val);
                                setInputError(null);
                              }}
                              placeholder="0"
                              className="w-full pl-9 pr-4 py-4 rounded-2xl bg-background border border-border text-foreground font-mono font-black text-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div className="flex gap-2">
                            {[0, 10, 25, 50, 100].map((amt) => (
                              <button
                                key={amt}
                                onClick={() => {
                                  if (amt <= myMoney) {
                                    setBidInput(String(amt));
                                    setInputError(null);
                                  }
                                }}
                                disabled={amt > myMoney}
                                className="flex-1 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-30 border border-border text-xs font-bold transition-all"
                              >
                                ${amt}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setBidInput(String(myMoney));
                                setInputError(null);
                              }}
                              className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-black uppercase tracking-wider"
                            >
                              All In
                            </button>
                          </div>

                          {inputError && <div className="text-xs text-red-400 font-bold">{inputError}</div>}

                          <button
                            onClick={handleFirstBid}
                            className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <Gavel className="w-5 h-5" /> Submit Bid (${bidInput || "0"})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-3">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                          <Gavel className="w-6 h-6" />
                        </motion.div>
                        <div className="font-black text-xl">{opponentName} is placing a bid...</div>
                        <p className="text-sm text-muted-foreground">Waiting for opening bid</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Phase 2: Responding Bidder Turn */}
                {currentStatus === "responding" && firstBid !== null && (
                  <div className="space-y-4">
                    {!amIFirstBidder ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-between">
                          <span>{opponentName} bid first:</span>
                          <span className="text-2xl font-black">${firstBid}</span>
                        </div>

                        <h3 className="font-black text-xl tracking-tight">Your Decision</h3>
                        <p className="text-sm text-muted-foreground">
                          Outbid {opponentName} to take this country, or give it to {opponentName} for ${firstBid}.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-5 rounded-2xl bg-foreground/5 border border-border space-y-3">
                            <div className="font-bold text-emerald-400 text-sm uppercase tracking-widest">Outbid</div>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-bold">$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={outbidInput}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setOutbidInput(val);
                                  setInputError(null);
                                }}
                                placeholder={String(firstBid + 1)}
                                className="w-full pl-8 pr-3 py-3 rounded-xl bg-background border border-border text-foreground font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <button
                              onClick={handleOutbid}
                              className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wider"
                            >
                              Outbid (${outbidInput || firstBid + 1})
                            </button>
                          </div>

                          <div className="p-5 rounded-2xl bg-foreground/5 border border-border space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-red-400 text-sm uppercase tracking-widest mb-1">Pass</div>
                              <p className="text-xs text-muted-foreground">Let {opponentName} buy {currentCountry?.name} for ${firstBid}.</p>
                            </div>
                            <button
                              onClick={handleGiveOpponent}
                              className="w-full py-3.5 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-black text-sm transition-all uppercase tracking-wider border border-border"
                            >
                              Give Opponent Country
                            </button>
                          </div>
                        </div>

                        {inputError && <div className="text-xs text-red-400 font-bold mt-2">{inputError}</div>}
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-3">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                          <Gavel className="w-6 h-6" />
                        </motion.div>
                        <div className="font-black text-xl">You bid ${firstBid}</div>
                        <p className="text-sm text-muted-foreground">Waiting for {opponentName} to outbid or give you the country...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Phase 3: Drafting */}
                {currentStatus === "drafting" && (
                  <div className="space-y-4">
                    {amIWinner ? (
                      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-emerald-400" />
                          <h3 className="font-black text-xl text-emerald-400">You Won {currentCountry?.name}!</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Winning price: <strong className="text-foreground">${winningBid}</strong>. Select an available roster category on the right to assign this country.
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
                        <div className="flex items-center gap-3">
                          <Coins className="w-6 h-6 text-blue-400" />
                          <h3 className="font-black text-xl text-blue-400">{opponentName} Won {currentCountry?.name}!</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Paid: <strong className="text-foreground">${winningBid}</strong>. Waiting for {opponentName} to choose a roster slot...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Solo Drafting (One player's roster is full) */}
            {(isMyRosterFull || isOpponentRosterFull) && !isBothRostersFull && (
              <div className="space-y-4">
                {isOpponentRosterFull && !isMyRosterFull && (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <Gavel className="w-6 h-6 text-amber-400" />
                      <h3 className="font-black text-xl text-amber-400">Completing Your Roster</h3>
                    </div>
                    {myMoney > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {opponentName}'s roster is complete! You have money left, so you must bid <strong className="text-foreground">$1 per country</strong>. Select a slot on your roster below.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {opponentName}'s roster is complete! Since you have $0 money, you are awarded lower-ranked countries for <strong className="text-foreground">FREE ($0)</strong>. Select a slot on your roster below.
                      </p>
                    )}
                  </div>
                )}

                {isMyRosterFull && !isOpponentRosterFull && (
                  <div className="p-6 rounded-2xl bg-foreground/5 border border-border space-y-3 text-center py-8">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h3 className="font-black text-xl">Your Roster is Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Waiting for {opponentName} to finish drafting remaining roster slots...
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Roster Display & Category Picker (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-card p-6 rounded-[2rem] border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h3 className="font-black text-xl">Your Roster</h3>
                <p className="text-xs text-muted-foreground font-bold">
                  {myFilledCount} / {CATEGORIES.length} Slots Filled
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">{myScores.total} pts</div>
                <div className="text-[10px] text-muted-foreground font-bold">Base: {myScores.base} + Bonus: {myScores.bonus}</div>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const assignedCountryName = myRoster[cat];
                const isOccupied = Boolean(assignedCountryName);
                const isDraftingMeWinner = currentStatus === "drafting" && amIWinner && !isOccupied;
                const isSoloActive = (isOpponentRosterFull && !isMyRosterFull) && !isOccupied;
                const canSelect = isDraftingMeWinner || isSoloActive;

                return (
                  <motion.button
                    key={cat}
                    whileHover={canSelect ? { scale: 1.02 } : {}}
                    whileTap={canSelect ? { scale: 0.98 } : {}}
                    disabled={!canSelect}
                    onClick={() => handleAssignCategory(cat)}
                    className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      isOccupied
                        ? "bg-foreground/5 border-border/50 opacity-90 cursor-default"
                        : canSelect
                        ? "bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20 shadow-md cursor-pointer animate-pulse"
                        : "bg-background border-border/30 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={canSelect ? "text-emerald-400" : "text-muted-foreground"}>
                        {CATEGORY_ICONS[cat]}
                      </span>
                      <div>
                        <div className="font-bold text-sm">{cat}</div>
                        <div className="text-xs text-muted-foreground">
                          {isOccupied ? assignedCountryName : canSelect ? "Click to Assign Won Country" : "Empty Slot"}
                        </div>
                      </div>
                    </div>

                    {isOccupied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : canSelect ? (
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
