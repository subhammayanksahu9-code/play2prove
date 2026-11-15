"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

function staffLoginEmail(staffId) {
  return `${String(staffId || "").trim().toLowerCase()}@staff.play2prove.internal`;
}

export default function StaffPage() {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    const cleanId = staffId.trim();
    if (!cleanId || !password) {
      setMessage("Staff ID aur password dono enter karein.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: staffLoginEmail(cleanId),
        password,
      });
      if (error || !data?.user) {
        setMessage("Staff ID ya password galat hai, ya account abhi activate nahi hua.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("staff_profiles")
        .select("staff_id, full_name, staff_role, is_active")
        .eq("auth_user_id", data.user.id)
        .eq("staff_id", cleanId)
        .maybeSingle();

      if (profileError || !profile || !profile.is_active) {
        await supabase.auth.signOut();
        setMessage("Staff access active nahi hai. Administrator se contact karein.");
        return;
      }

      window.location.replace("/staff/dashboard");
    } catch (error) {
      console.error("STAFF LOGIN:", error);
      setMessage("Login service se connection nahi ho paaya. Thodi der baad try karein.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{minHeight:"100vh",background:"#080b14",color:"#f8fafc",display:"grid",placeItems:"center",padding:20,fontFamily:"Arial,sans-serif",boxSizing:"border-box"}}>
      <section style={{width:"100%",maxWidth:460,background:"#101725",border:"1px solid #263247",borderRadius:22,padding:"clamp(22px,6vw,34px)",boxShadow:"0 24px 80px #0008",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:34}}>
          <div style={{width:54,height:54,borderRadius:16,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#ff4b16,#ff8a00)",fontWeight:900,fontSize:20}}>P2P</div>
          <div><div style={{fontWeight:800,fontSize:23}}>Play2Prove</div><div style={{fontSize:11,letterSpacing:4,color:"#8995aa",marginTop:5}}>STAFF PORTAL</div></div>
        </div>
        <div style={{fontSize:12,color:"#ff783c",letterSpacing:2,fontWeight:800}}>TEAM ACCESS</div>
        <h1 style={{fontSize:34,margin:"10px 0 8px"}}>Staff Login</h1>
        <p style={{color:"#9aa7bb",fontSize:15,lineHeight:1.65,margin:"0 0 28px"}}>Administrator se mile staff credentials se secure sign in karein.</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="staff-id" style={{display:"block",fontSize:14,color:"#cbd5e1",marginBottom:9}}>Staff User ID</label>
          <input id="staff-id" value={staffId} onChange={e=>setStaffId(e.target.value)} placeholder="Enter your staff ID" autoComplete="username" required style={{boxSizing:"border-box",width:"100%",padding:16,borderRadius:12,border:"1px solid #344258",background:"#0a111e",color:"white",marginBottom:20,outlineColor:"#ff6b2c",fontSize:16}}/>
          <label htmlFor="staff-password" style={{display:"block",fontSize:14,color:"#cbd5e1",marginBottom:9}}>Password</label>
          <div style={{position:"relative",marginBottom:22}}>
            <input id="staff-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" type={showPassword?"text":"password"} autoComplete="current-password" required style={{boxSizing:"border-box",width:"100%",padding:"16px 72px 16px 16px",borderRadius:12,border:"1px solid #344258",background:"#0a111e",color:"white",outlineColor:"#ff6b2c",fontSize:16}}/>
            <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"transparent",border:0,color:"#ff9a66",fontWeight:700}}>{showPassword?"Hide":"Show"}</button>
          </div>
          <button disabled={loading} type="submit" style={{width:"100%",padding:17,border:0,borderRadius:12,background:"linear-gradient(90deg,#ff4b16,#ff8700)",color:"white",fontWeight:800,fontSize:16,opacity:loading?.7:1}}>{loading?"SIGNING IN...":"LOGIN"}</button>
        </form>
        {message && <div role="alert" style={{marginTop:17,padding:14,borderRadius:10,background:"#39251d",border:"1px solid #75412d",color:"#ffd2bd",fontSize:14,lineHeight:1.5}}>{message}</div>}
        <div style={{borderTop:"1px solid #283449",marginTop:28,paddingTop:22}}>
          <p style={{fontSize:12,color:"#8794a8",letterSpacing:1.5,fontWeight:700,margin:"0 0 12px"}}>SECURE TEAM ACCESS</p>
          <p style={{fontSize:12,color:"#718096",lineHeight:1.6,margin:0}}>Staff accounts are activated by an administrator. Passwords are securely handled by Supabase Authentication.</p>
          <p style={{fontSize:11,color:"#64748b",textAlign:"center",margin:"24px 0 0",letterSpacing:2}}>PLAY • COMPETE • PROVE</p>
        </div>
      </section>
    </main>
  );
}
