export const metadata = {
  title: "Downloads | Play2Prove",
  description: "Official Play2Prove game and app downloads.",
};

export default function DownloadsPage() {
  return (
    <main style={{minHeight:"100vh",background:"#05070c",color:"#f5f6f8",fontFamily:"Arial, sans-serif",padding:"clamp(24px,6vw,72px)"}}>
      <a href="/" style={{color:"#ff7848",fontSize:12,fontWeight:800,textDecoration:"none"}}>← BACK TO PLAY2PROVE</a>
      <section style={{maxWidth:760,margin:"12vh auto 0",padding:"clamp(24px,5vw,48px)",border:"1px solid #303846",borderRadius:18,background:"#0d121b"}}>
        <div style={{color:"#ff7848",fontSize:10,fontWeight:900,letterSpacing:2}}>PLAYER RESOURCES</div>
        <h1 style={{fontSize:"clamp(30px,5vw,48px)",margin:"14px 0 10px"}}>Downloads</h1>
        <p style={{color:"#9aa4b3",fontSize:14,lineHeight:1.7,margin:0}}>Official Play2Prove app and game download links will be published here after they are verified. No unofficial installer links are provided.</p>
        <div style={{marginTop:26,padding:16,borderRadius:10,border:"1px solid #ff784833",background:"#ff5a1f0b",color:"#c7cbd2",fontSize:12}}>Downloads are not available yet. Check back when the official files are released.</div>
      </section>
    </main>
  );
}
