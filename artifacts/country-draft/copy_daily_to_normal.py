import os

daily_dir = "src/pages/daily"
normal_dir = "src/pages/normal"

for filename in os.listdir(daily_dir):
    if not filename.endswith(".tsx"): continue
    
    with open(os.path.join(daily_dir, filename), "r") as f:
        content = f.read()
        
    # Replace daily specific things with normal specific things
    content = content.replace("DailyGame", "NormalGame")
    content = content.replace("DailyUI", "NormalUI")
    content = content.replace('mode="daily"', 'mode="normal"')
    content = content.replace("isDailyMode={true}", "isDailyMode={false}")
    content = content.replace("savePersonalScore(\"daily\"", "savePersonalScore(state.isHardMode ? \"hard\" : \"normal\"")
    # Restore the Classic header
    if "CalendarDays" in content:
        content = content.replace(
            '<div className="px-2.5 py-1 rounded-md bg-[#111111] text-xs font-semibold text-white/70 border border-white/10 hidden sm:flex items-center gap-1.5">\n            <CalendarDays className="w-3.5 h-3.5" /> Daily Challenge',
            '<div className="px-2.5 py-1 rounded-md bg-[#111111] text-xs font-semibold text-white/70 border border-white/10 hidden sm:block">\n            Classic {state.isHardMode ? "(Hard)" : "(Easy)"}'
        )
        
    # Handle the daily specific localStorage logic
    if filename == "DailyGame.tsx":
        target_name = "NormalGame.tsx"
    elif filename == "DailyUI.tsx":
        target_name = "NormalUI.tsx"
    else:
        target_name = filename
        
    with open(os.path.join(normal_dir, target_name), "w") as f:
        f.write(content)
        
print("Copied and transformed!")
