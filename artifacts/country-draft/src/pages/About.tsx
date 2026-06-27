import React, { useState } from "react";
import { Link } from "wouter";
import Globe from "lucide-react/dist/esm/icons/globe";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ContactModal } from "../components/ContactModal";

export default function About() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-foreground/20">
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-40 mix-blend-difference">
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/logo.svg" alt="GeoDrafts Logo" className="w-8 h-8 opacity-90" />
            <span className="font-sans text-xl font-bold text-foreground tracking-tighter">GeoDrafts</span>
          </motion.div>
        </Link>
        <Link href="/">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground/80 hover:text-foreground bg-foreground/5 border border-border"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-20 max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          <div className="p-4 mb-8 bg-card rounded-[2rem] shadow-sm border border-border/50 ring-1 ring-border">
            <img src="/logo.svg" alt="GeoDrafts Logo" className="w-24 h-24" />
          </div>
          
          <h1 className="font-sans text-6xl md:text-8xl font-black text-foreground mb-16 tracking-tighter text-center leading-[0.9]">
            The Ultimate <br/><span className="text-muted-foreground">Geography Engine.</span>
          </h1>
          
          <div className="space-y-12 text-xl md:text-2xl text-muted-foreground/80 leading-tight font-medium max-w-2xl text-center">
            <p>
              Looking for the ultimate geography game that tests your strategic thinking and global knowledge? Welcome to GeoDrafts, an innovative country building game where players are challenged to construct the ultimate nation. As you are dealt real-world countries one by one, you must carefully select unique traits and aspects from each to engineer the most successful country possible.
            </p>
            <p>
              Every playthrough offers a unique experience thanks to a variety of dynamic game modes tailored to different playstyles. If you're looking for a relaxed experience to test your basic geography knowledge, our standard modes provide endless entertainment. For veterans seeking a truly hardcore geography strategy game, you can dive into advanced difficulty levels.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-12 flex justify-center gap-8 bg-gradient-to-t from-background to-transparent mt-auto relative z-10">
        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-bold tracking-tight">
          About GeoDrafts
        </Link>
        <button 
          onClick={() => setShowContactModal(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-bold tracking-tight"
        >
          Contact the Devs
        </button>
      </footer>

      <AnimatePresence>
        {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
