import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  async function handleSubmit() {
    if (!email.trim() || !message.trim()) {
      toast.error("Please provide both your email and a message.");
      return;
    }
    
    setLoading(true);
    try {
      // These variables need to be set in the .env file
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS is not configured. Please set the VITE_EMAILJS environment variables.");
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: email,
          reply_to: email,
          subject: subject || "GeoDrafts Suggestion",
          message: message,
          to_email: "darabrawl1@gmail.com" // You can set this in the EmailJS template as well
        },
        publicKey
      );
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Emil Kowalski style spring
  const springConfig = { type: "spring" as const, bounce: 0.15, duration: 0.5 };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 10 }} 
        transition={springConfig}
        className="relative w-full max-w-[420px] bg-background border border-border/50 rounded-[24px] shadow-2xl overflow-hidden flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative subtle header background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="relative px-6 pt-6 pb-2 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[1.15rem] font-black tracking-tight text-foreground leading-none">Contact the Devs</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">We'd love to hear from you.</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose} 
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors -mr-2"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="relative px-6 pb-6 pt-4 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Your Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="your@email.com" 
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background transition-all text-[15px]" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Subject</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="e.g., Found a bug in Double Draft" 
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background transition-all text-[15px]" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Message</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Tell us what you think..." 
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background transition-all text-[15px] resize-none" 
              />
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-[15px] shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Sending..." : "Send Message"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
