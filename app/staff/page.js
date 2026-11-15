"use client";

import { useState } from "react";

export default function StaffPage() {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main style={{minHeight:"100vh",background:"#080b14",color:"#f8fafc",display:"grid",placeItems:"center",padding:"24px",fontFamily:"Arial,sans-serif"}}>
      <section style={{width:"100%",maxWidth:430,background:"#101725",border:"1px solid #263247",borderRadius:22,padding:28,boxShadow:"0 24px 80px #0008"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:30}}>
          <div style={{width:48,height:48,borderRadius:14,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#ff4b16,#ff8a00)",fontWeight:900}}>P2P</div>
          <div><div style={{fontWeight:800,fontSize:20}}>Play2Prove</div><div style={{fontSize:10,letterSpacing:3,color:"#8995aa",marginTop:4}}>STAFF PORTAL</div></div>
        </div>
        <div style={{fontSize:12,color:"#ff783c",letterSpacing:2,fontWeight:800}}>TEAM ACCESS</div>
        <h1 style={{fontSize:30,margin:"9px 0 8px"}}>Staff Login</h1>
        <p style={{color:"#9aa7bb",fontSize:14,lineHeight:1.6,margin:"0 0 26px"}}>Sign in with the staff credentials provided by your administrator.</p>
        <form onSubmit={e=>{e.preventDefault();setShowDemo(true);}}>
          <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:8}}>Staff User ID</label>
          <input value={staffId} onChange={e=>setStaffId(e.target.value)} placeholder="Enter your staff ID" autoComplete="username" style={{boxSizing:"border-box",width:"100%",padding:15,borderRadius:11,border:"1px solid #344258",background:"#0a111e",color:"white",marginBottom:18,outlineColor:"#ff6b2c"}}/>
          <label style={{display:"block",fontSize:13,color:"#cbd5e1",marginBottom:8}}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" type="password" autoComplete="current-password" style={{boxSizing:"border-box",width:"100%",padding:15,borderRadius:11,border:"1px solid #344258",background:"#0a111e",color:"white",marginBottom:20,outlineColor:"#ff6b2c"}}/>
          <button type="submit" style={{width:"100%",padding:15,border:0,borderRadius:11,background:"linear-gradient(90deg,#ff4b16,#ff8700)",color:"white",fontWeight:800,fontSize:15}}>LOGIN</button>
        </form>
        {showDemo && <div role="status" style={{marginTop:16,padding:12,borderRadius:10,background:"#39251d",color:"#ffd2bd",fontSize:13,lineHeight:1.5}}>Login service is not connected yet. Admin authentication and staff records must be securely connected before access can be enabled. No credentials were sent or saved.</div>}
        <div style={{borderTop:"1px solid #283449",marginTop:26,paddingTop:20}}>
          <div style={{fontSize:12,color:"#8794a8",letterSpacing:1.5,fontWeight:700,marginBottom:12}}>CONTACT US</div>
          <div style={{display:"flex",gap:12}}>
            <a href="tel:" style={{flex:1,textAlign:"center",padding:12,border:"1px solid #344258",borderRadius:10,color:"#e2e8f0",textDecoration:"none",fontSize:13}}>☎ Call</a>
            <a href="mailto:" style={{flex:1,textAlign:"center",padding:12,border:"1px solid #344258",borderRadius:10,color:"#e2e8f0",textDecoration:"none",fontSize:13}}>✉ Email</a>
          </div>
          <p style={{fontSize:11,color:"#64748b",textAlign:"center",margin:"22px 0 0"}}>PLAY • COMPETE • PROVE</p>
        </div>
      </section>
    </main>
  );
}
