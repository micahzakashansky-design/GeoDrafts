import re

file = "src/pages/Leaderboard.tsx"
with open(file, "r") as f:
    content = f.read()

# Replace modeTabs array definition
tabs_data = """  const modeTabs = [
    { key: "classic", label: "Classic Draft", icon: <GlobeIcon className="w-7 h-7" />, desc: "Standard format", activeClass: "border-blue-500/50 bg-blue-500/10", activeIconBg: "bg-blue-500/20 text-blue-500", dotColor: "bg-blue-500", ringColor: "border-blue-500", textColor: "text-blue-500" },
    { key: "double", label: "Double Draft", icon: <ArrowLeftRight className="w-7 h-7" />, desc: "Two picks at once", activeClass: "border-purple-500/50 bg-purple-500/10", activeIconBg: "bg-purple-500/20 text-purple-500", dotColor: "bg-purple-500", ringColor: "border-purple-500", textColor: "text-purple-500" },
    { key: "guess", label: "Guess", icon: <Search className="w-7 h-7" />, desc: "Guess the country", activeClass: "border-emerald-500/50 bg-emerald-500/10", activeIconBg: "bg-emerald-500/20 text-emerald-500", dotColor: "bg-emerald-500", ringColor: "border-emerald-500", textColor: "text-emerald-500" },
    { key: "daily", label: "Daily", icon: <CalendarDays className="w-7 h-7" />, desc: "Daily challenge", activeClass: "border-amber-400/50 bg-amber-400/10", activeIconBg: "bg-amber-400/20 text-amber-400", dotColor: "bg-amber-400", ringColor: "border-amber-400", textColor: "text-amber-400" },
  ] as const;"""

content = re.sub(r'const modeTabs = \[[^\]]+\] as const;', tabs_data, content)

# Replace the specific block of JSX
old_jsx = """          <div className="flex gap-2 flex-wrap">
            {modeTabs.map((tab) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={tab.key}
                onClick={() => setParentMode(tab.key)}
                className={`px-5 py-2.5 rounded-full text-sm uppercase tracking-widest transition-colors border ${
                  parentMode === tab.key
                    ? tab.activeClass + " border-transparent"
                    : "text-muted-foreground font-bold border-border hover:text-foreground hover:bg-foreground/5 bg-card"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>"""

new_jsx = """          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {modeTabs.map((tab) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={tab.key}
                onClick={() => setParentMode(tab.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors text-left ${
                  parentMode === tab.key
                    ? tab.activeClass
                    : "border-border bg-card hover:bg-foreground/5"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${parentMode === tab.key ? tab.activeIconBg : "bg-foreground/10 text-muted-foreground"}`}>
                  {tab.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-black text-lg tracking-tight ${parentMode === tab.key ? "text-foreground" : "text-foreground/80"}`}>{tab.label}</div>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">{tab.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${parentMode === tab.key ? tab.ringColor : "border-border"}`}>
                  {parentMode === tab.key && (
                    <motion.div layoutId="mode-dot-leaderboard" className={`w-2.5 h-2.5 rounded-full ${tab.dotColor}`} />
                  )}
                </div>
              </motion.button>
            ))}
          </div>"""

content = content.replace(old_jsx, new_jsx)

# Also ensure we add GlobeIcon and ArrowLeftRight and Search to lucide-react imports if not there
if 'GlobeIcon' not in content:
    content = content.replace('Globe,', 'Globe, GlobeIcon,')
if 'ArrowLeftRight' not in content:
    content = content.replace('X,', 'X, ArrowLeftRight,')
if 'Search' not in content:
    content = content.replace('Info,', 'Info, Search,')

with open(file, "w") as f:
    f.write(content)
print("done")
