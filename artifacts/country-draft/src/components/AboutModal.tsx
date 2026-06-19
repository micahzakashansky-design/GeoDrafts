import React from "react";
import { motion } from "framer-motion";
import { Info, X } from "lucide-react";

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-foreground">About GeoDrafts</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-5 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center mb-6">
            <img src="/logo.svg" alt="GeoDrafts Logo" className="w-16 h-16 rounded-full object-cover" />
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Looking for the ultimate geography game that tests your strategic thinking and global knowledge? Welcome to GeoDrafts, an innovative country building game where players are challenged to construct the ultimate nation. As you are dealt real-world countries one by one, you must carefully select unique traits and aspects from each to engineer the most successful country possible. Whether you want to dominate economically or geographically, GeoDrafts offers a fresh, engaging twist on traditional geography trivia.
            </p>
            <p>
              Every playthrough offers a unique experience thanks to a variety of dynamic game modes tailored to different playstyles. If you're looking for a relaxed experience to test your basic geography knowledge, our standard modes provide endless entertainment. For veterans seeking a truly hardcore geography strategy game, you can dive into advanced difficulty levels. These harder challenges push your understanding of global statistics, borders, and country traits to the limit, making GeoDrafts the perfect educational strategy game for both geography buffs and competitive gamers alike.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
