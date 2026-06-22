import React, { useState } from "react";
import { motion } from "framer-motion";
import { RATINGS, ARCHETYPES, BONUS_PATHS, ACCOUNT_STATS } from "@/lib/achievements";
import { AchievementsModal } from "./AchievementsModal";
import { UserProfile } from "@/lib/firestore";
import { Award, Star, BookOpen, Crown, Trophy } from "lucide-react";

export function AchievementsCard({ profile }: { profile: UserProfile | null }) {
  const [modalType, setModalType] = useState<"ratings" | "archetypes" | "bonusPaths" | "accountStats" | null>(null);

  const unlocked = profile?.unlockedAchievements || [];

  const ratingsUnlocked = RATINGS.filter(r => unlocked.includes(r.name)).length;
  const archetypesUnlocked = ARCHETYPES.filter(a => unlocked.includes(a.name)).length;
  const bonusUnlocked = BONUS_PATHS.filter(b => unlocked.includes(b.name)).length;
  const accountStatsUnlocked = ACCOUNT_STATS.filter(s => unlocked.includes(s.name)).length;

  const totalRatings = RATINGS.length;
  const totalArchetypes = ARCHETYPES.length;
  const totalBonus = BONUS_PATHS.length;
  const totalAccountStats = ACCOUNT_STATS.length;

  const getRingStyle = (unlocked: number, total: number, colorClass: string) => {
    const percentage = (unlocked / total) * 100;
    return {
      background: `conic-gradient(currentColor ${percentage}%, transparent ${percentage}%)`
    };
  };

  return (
    <>
      <div className="w-full bg-card border border-border rounded-3xl p-6 md:p-8 mt-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-card-foreground">Your Achievements</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RingItem 
            title="Account Stats" 
            icon={<Trophy className="w-4 h-4 text-purple-500" />}
            unlocked={accountStatsUnlocked} 
            total={totalAccountStats} 
            colorClass="text-purple-500"
            onClick={() => setModalType("accountStats")}
          />
          <RingItem 
            title="Nation Ratings" 
            icon={<Star className="w-4 h-4 text-yellow-500" />}
            unlocked={ratingsUnlocked} 
            total={totalRatings} 
            colorClass="text-yellow-500"
            onClick={() => setModalType("ratings")}
          />
          <RingItem 
            title="Archetypes" 
            icon={<BookOpen className="w-4 h-4 text-blue-500" />}
            unlocked={archetypesUnlocked} 
            total={totalArchetypes} 
            colorClass="text-blue-500"
            onClick={() => setModalType("archetypes")}
          />
          <RingItem 
            title="Bonus Paths" 
            icon={<Crown className="w-4 h-4 text-emerald-500" />}
            unlocked={bonusUnlocked} 
            total={totalBonus} 
            colorClass="text-emerald-500"
            onClick={() => setModalType("bonusPaths")}
          />
        </div>
      </div>

      <AchievementsModal
        isOpen={modalType === "ratings"}
        onClose={() => setModalType(null)}
        title="Nation Ratings"
        achievements={RATINGS}
        unlockedNames={unlocked}
      />
      <AchievementsModal
        isOpen={modalType === "archetypes"}
        onClose={() => setModalType(null)}
        title="Archetypes"
        achievements={ARCHETYPES}
        unlockedNames={unlocked}
      />
      <AchievementsModal
        isOpen={modalType === "bonusPaths"}
        onClose={() => setModalType(null)}
        title="Bonus Paths"
        achievements={BONUS_PATHS}
        unlockedNames={unlocked}
      />
      <AchievementsModal
        isOpen={modalType === "accountStats"}
        onClose={() => setModalType(null)}
        title="Account Stats"
        achievements={ACCOUNT_STATS}
        unlockedNames={unlocked}
      />
    </>
  );
}

function RingItem({ title, icon, unlocked, total, colorClass, onClick }: { title: string; icon: React.ReactNode; unlocked: number; total: number; colorClass: string; onClick: () => void }) {
  const percentage = total > 0 ? (unlocked / total) * 100 : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center p-6 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="relative flex items-center justify-center mb-4">
        <svg width="90" height="90" className="rotate-[-90deg]">
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-black">{unlocked}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider -mt-1">/ {total}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-bold text-sm text-foreground">{title}</span>
      </div>
    </motion.button>
  );
}
