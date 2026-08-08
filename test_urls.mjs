async function testUrls() {
  try {
    const firebaseRes = await fetch("https://contentflow-ai-juang26.web.app");
    console.log("Firebase status:", firebaseRes.status);
  } catch (e) { console.error("Firebase fetch error:", e.message); }
  
  try {
    const renderRes2 = await fetch("https://contentflow-ai-9wy7.onrender.com/api/health");
    console.log("Render 9wy7 status:", renderRes2.status);
  } catch (e) { console.error("Render 9wy7 fetch error:", e.message); }
}
testUrls();
