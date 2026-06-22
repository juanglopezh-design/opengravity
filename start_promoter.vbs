Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd c:\Users\juang\opengravity && npx tsx src/agent/promoter.ts > promoter_debug.log 2>&1", 0, False
