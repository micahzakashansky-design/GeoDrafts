import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!email.trim() || !message.trim()) {
      toast.error("Please provide both your email and a message.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      toast.success("Message sent successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} className="bg-[#000000] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-white">Contact the Devs</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-5 py-5 space-y-4">
          <div className="text-sm text-white/40 mb-4">
            Have a suggestion, found a bug, or just want to say hi? Send us a message directly.
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase mb-1 block">Your Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="your@email.com" 
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase mb-1 block">Subject</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="GeoDrafts Suggestion" 
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase mb-1 block">Message</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Tell us what you think..." 
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" 
              />
            </div>
            
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
