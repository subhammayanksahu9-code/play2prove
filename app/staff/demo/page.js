"use client";

import { useEffect, useState } from "react";

const sampleRequests = [
  { id: "DEMO-PAY-1001", player: "Demo Player One", game: "BGMI", mode: "Squad", amount: "₹250", utr: "DEMO123456", received: "Just now", status: "Pending" },
  { id: "DEMO-PAY-1002", player: "Demo Player Two", game: "Free Fire", mode: "Duo", amount: "₹100", utr: "DEMO654321", received: "2 min ago", status: "Pending" },
];

export default function StaffDemoPage() {
  const [requests, setRequests] = useState(sampleRequests);
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 300), 1000);
    return () => clearInterval(timer);
  }, []);

  function updateRequest(id, status) {
    setRequests(items => items.map(item => item.id === id ? { ...item, status } : item));
  }

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <main style={{minHeight:"100vh",background:"#080b14",color:"#f8fafc",padding:20,fontFamily:"Arial,sans-serif"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:22}}>
          <div><div style={{fontSize:24,fontWeight:800}}>Play2Prove Staff</div><div style={{color:"#94a3b8",fontSize:13,marginTop:5}}>Demo staff dashboard</div></div>
          <span style={{background:"#493019",color:"#ffbd83",padding:"8px 12px",borderRadius:20,fontSize:12,fontWeight:800}}>MOCK MODE · NO REAL PAYMENTS</span>
        </header>
        <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
          {[["Staff","DEMO STAFF"],["Availability","Online"],["Pending",requests.filter(r=>r.status==="Pending").length],["Review timer",clock]].map(([k,v])=><div key={k} style={{background:"#101725",border:"1px solid #263247",borderRadius:14,padding:17}}><div style={{color:"#94a3b8",fontSize:12}}>{k}</div><div style={{fontSize:20,fontWeight:800,marginTop:8}}>{v}</div></div>)}
        </section>
        <h2 style={{fontSize:19,margin:"26px 0 14px"}}>Payment verification queue</h2>
        <p style={{color:"#94a3b8",fontSize:13,lineHeight:1.6}}>Neeche sirf sample requests hain. Accept/Reject buttons ka effect isi demo screen tak limited hai; koi payment verify, wallet credit ya bank transaction nahi hota.</p>
        <div style={{display:"grid",gap:14}}>
          {requests.map(r=><article key={r.id} style={{background:"#101725",border:"1px solid #263247",borderRadius:16,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}><strong>{r.id}</strong><span style={{color:r.status==="Pending"?"#ffbd83":r.status==="Accepted"?"#86efac":"#fca5a5",fontWeight:700}}>{r.status}</span></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:14,margin:"18px 0"}}>
              {[["Player",r.player],["Game / Mode",r.game+" / "+r.mode],["Amount",r.amount],["UTR (sample)",r.utr],["Received",r.received]].map(([k,v])=><div key={k}><div style={{fontSize:11,color:"#94a3b8"}}>{k}</div><div style={{fontSize:14,marginTop:5,fontWeight:600}}>{v}</div></div>)}
            </div>
            {r.status==="Pending" ? <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button onClick={()=>updateRequest(r.id,"Accepted")} style={{background:"#15803d",color:"white",border:0,borderRadius:9,padding:"11px 18px",fontWeight:700}}>Accept (Demo)</button><button onClick={()=>updateRequest(r.id,"Rejected")} style={{background:"#991b1b",color:"white",border:0,borderRadius:9,padding:"11px 18px",fontWeight:700}}>Reject (Demo)</button></div> : <div style={{fontSize:12,color:"#94a3b8"}}>Demo action recorded on this screen only.</div>}
          </article>)}
        </div>
        <footer style={{marginTop:28,borderTop:"1px solid #263247",paddingTop:18,color:"#64748b",fontSize:12}}>Demo preview only · Real staff authentication and live integrations are not connected yet.</footer>
        <a href="/staff" style={{display:"inline-block",marginTop:18,color:"#fb923c",textDecoration:"none"}}>← Back to Staff Login</a>
      </div>
    </main>
  );
}
