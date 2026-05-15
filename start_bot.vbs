Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd c:\Users\juang\opengravity && npm run dev > bot_debug.log 2>&1", 0, False
WshShell.Run "cmd /c cd c:\Users\juang\opengravity && npx tsx bridge.ts > bridge_debug.log 2>&1", 0, False
