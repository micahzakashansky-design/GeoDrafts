import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const oldDailyCardMatch = content.match(/function DailyCard\(\) \{[\s\S]*?\n\s*\nfunction MultiplayerModal/);
  if (!oldDailyCardMatch) {
    console.error("Could not find DailyCard component");
    return;
  }
  
  const newDailyCard = `function DailyCard() {
  const [, navigate] = useLocation(); const { firebaseUser } = useFirebaseAuth(); const [cloudCompleted, setCloudCompleted] = useState(false); const [cloudState, setCloudState] = useState<any>(null);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []); const todayLabel = useMemo(() => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), []);
  useEffect(() => { if (firebaseUser) { checkDailySubmitted(firebaseUser.uid).then(setCloudCompleted); getDailyState(firebaseUser.uid, todayKey).then(setCloudState); } }, [firebaseUser, todayKey]);
  const dailyResult = useMemo<{ score: number; completed: boolean } | null>(() => { try { const raw = localStorage.getItem(\`countryDraftDailyResult_\${todayKey}\`); if (!raw) return null; return JSON.parse(raw); } catch { return null; } }, [todayKey]);
  const inProgressLocal = useMemo(() => { try { const raw = localStorage.getItem(\`countryDraftState_daily_\${todayKey}\`); if (!raw) return false; const s = JSON.parse(raw); return s && !s.gameOver && s.isDailyMode; } catch { return false; } }, [todayKey]);
  const inProgress = inProgressLocal || (cloudState && !cloudState.gameOver);
  function playDaily() { localStorage.setItem("countryDraftDailyMode", "true"); localStorage.setItem("countryDraftDailyDate", todayKey); localStorage.removeItem("countryDraftMode"); navigate("/game/daily"); }
  const alreadyCompleted = dailyResult?.completed === true || cloudCompleted;
  
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} className="w-full mb-6">
      <button 
        onClick={playDaily} 
        className={\`w-full text-left rounded-2xl border p-4 sm:p-5 relative overflow-hidden transition-all group flex items-center justify-between \${
          alreadyCompleted 
            ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50" 
            : "border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 hover:border-amber-400/60"
        }\`}
      >
        <div className={\`absolute inset-0 pointer-events-none \${alreadyCompleted ? "bg-gradient-to-br from-emerald-500/5 to-transparent" : "bg-gradient-to-br from-amber-400/8 to-transparent"}\`} />
        
        <div className="relative flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${alreadyCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-400/20 text-amber-400"}\`}>
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h2 className={\`font-semibold text-base \${alreadyCompleted ? "text-emerald-300" : "text-amber-300"}\`}>Country of the Day</h2>
                <p className="text-xs text-muted-foreground">{todayLabel}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Everyone drafts the <span className="text-foreground/80 font-medium">same shuffled pool</span> today.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {alreadyCompleted ? (
              <div className="flex-1 sm:flex-none bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-3 text-center">
                <div className="text-2xl font-bold text-emerald-400 group-hover:scale-105 transition-transform">{dailyResult?.score || cloudState?.totalScore || 0} pts</div>
                <div className="text-xs text-emerald-400/60 mt-0.5">Your score today</div>
              </div>
            ) : (
              <div className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-5 py-3 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 font-semibold text-sm transition-colors group-hover:bg-amber-400/20">
                <CalendarDays className="w-4 h-4" />{inProgress ? "Continue Challenge" : "Play Today's Challenge"}
              </div>
            )}
          </div>
        </div>
        
        <div className={\`ml-2 sm:ml-4 flex-shrink-0 transition-all duration-300 transform group-hover:translate-x-1 \${alreadyCompleted ? 'text-emerald-500/50 group-hover:text-emerald-400' : 'text-amber-500/50 group-hover:text-amber-400'}\`}>
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      </button>
    </motion.div>
  );
}

function MultiplayerModal`;
  
  content = content.replace(oldDailyCardMatch[0], newDailyCard);
  fs.writeFileSync(filePath, content);
}

patchFile('src/pages/Home.tsx');
