import sys

with open('artifacts/country-draft/src/pages/Game.tsx', 'r') as f:
    content = f.read()

old_block = """        <button
          onClick={onSubmitLeaderboard}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 rounded-lg font-semibold text-sm hover:bg-yellow-400/30 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          Submit to Leaderboard
        </button>"""

new_block = """        {!isDailyMode && (
          <button
            onClick={onSubmitLeaderboard}
            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 rounded-lg font-semibold text-sm hover:bg-yellow-400/30 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Submit to Leaderboard
          </button>
        )}"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('artifacts/country-draft/src/pages/Game.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Block not found")
