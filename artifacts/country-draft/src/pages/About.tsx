import React, { useState } from "react";
import { Link } from "wouter";
import { Globe, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { ContactModal } from "../components/ContactModal";

export default function About() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="GeoDrafts Logo" className="w-8 h-8" />
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">GeoDrafts</span>
          </div>
        </Link>
        <Link href="/">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12 max-w-3xl mx-auto w-full">
        <div className="p-2 mb-4">
          <img src="/logo.svg" alt="GeoDrafts Logo" className="w-20 h-20 mx-auto" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-8 tracking-tight text-center">About GeoDrafts</h1>
        
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Looking for the ultimate geography game that tests your strategic thinking and global knowledge? Welcome to GeoDrafts, an innovative country building game where players are challenged to construct the ultimate nation. As you are dealt real-world countries one by one, you must carefully select unique traits and aspects from each to engineer the most successful country possible. Whether you want to dominate economically or geographically, GeoDrafts offers a fresh, engaging twist on traditional geography trivia.
          </p>
          <p>
            Every playthrough offers a unique experience thanks to a variety of dynamic game modes tailored to different playstyles. If you're looking for a relaxed experience to test your basic geography knowledge, our standard modes provide endless entertainment. For veterans seeking a truly hardcore geography strategy game, you can dive into advanced difficulty levels. These harder challenges push your understanding of global statistics, borders, and country traits to the limit, making GeoDrafts the perfect educational strategy game for both geography buffs and competitive gamers alike.
          </p>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-border mt-auto flex justify-center gap-6 bg-card/30">
        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold">
          About GeoDrafts
        </Link>
        <button 
          onClick={() => setShowContactModal(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
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
