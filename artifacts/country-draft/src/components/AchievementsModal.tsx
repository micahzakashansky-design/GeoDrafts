import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getAchievementIcon } from "@/lib/achievements";

export function AchievementsModal({
  isOpen,
  onClose,
  title,
  achievements,
  unlockedNames,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  achievements: { id: string; name: string; desc: string; color?: string }[];
  unlockedNames: string[];
}) {
  if (!isOpen) return null;

  const unlocked = achievements.filter((a) => unlockedNames.includes(a.name));
  const lockedCount = achievements.length - unlocked.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-border/50">
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
            {unlocked.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No achievements unlocked yet.</p>
                <p className="text-sm mt-2">Play games to unlock them!</p>
              </div>
            ) : (
              unlocked.map((a) => (
                <div key={a.id} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                    {getAchievementIcon(a.name, `w-6 h-6 ${a.color || 'text-primary'}`)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border/50 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {lockedCount > 0
                ? `${lockedCount} more to unlock`
                : "All achievements unlocked! 🎉"}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
