"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function StaffDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        window.location.replace("/staff");
        return;
      }
      const { data, error } = await supabase
        .from("staff_profiles")
        .select("staff_id, full_name, staff_role, is_active")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error || !data || !data.is_active) {
        await supabase.auth.signOut();
        window.location.replace("/staff");
        return;
      }
      setProfile(data);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/staff");
  }

  return (
    <main style={{minHeight:"100vh",background:"#080b14",color:"#f8fafc",padding:24,fontFamily:"Arial,sans-serif"}}>
      <header style={{maxWidth:900,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
        <div><b style={{fontSize:22}}>Play2Prove</b><div style={{fontSize:11,letterSpacing:3,color:"#8995aa",marginTop:5}}>STAFF PORTAL</div></div>
        <button onClick={logout} style={{background:"#171f2d",border:"1px solid #344258",color:"#fff",borderRadius:10,padding:"11px 16px"}}>Log out</button>
      </header>
      <section style={{maxWidth:900,margin:"36px auto",background:"#101725",border:"1px solid #263247",borderRadius:18,padding:24}}>
        {loading ? <p style={{color:"#9aa7bb"}}>Checking staff access...</p> : <>
          <div style={{fontSize:12,color:"#ff783c",letterSpacing:2,fontWeight:800}}>SIGNED IN</div>
          <h1 style={{fontSize:30,margin:"10px 0"}}>Welcome, {profile.full_name}</h1>
          <p style={{color:"#9aa7bb",lineHeight:1.7}}>Your staff account is connected to Play2Prove.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginTop:24}}>
            <div style={{background:"#0a111e",border:"1px solid #29364b",borderRadius:12,padding:16}}><small style={{color:"#8794a8"}}>STAFF ID</small><div style={{fontWeight:800,fontSize:20,marginTop:8}}>{profile.staff_id}</div></div>
            <div style={{background:"#0a111e",border:"1px solid #29364b",borderRadius:12,padding:16}}><small style={{color:"#8794a8"}}>ROLE</small><div style={{fontWeight:800,fontSize:20,marginTop:8,textTransform:"capitalize"}}>{profile.staff_role}</div></div>
          </div>
          <p style={{fontSize:12,color:"#718096",marginTop:24}}>Access to additional staff tools will be enabled by the administrator according to your assigned permissions.</p>
        </>}
      </section>
    </main>
  );
}
