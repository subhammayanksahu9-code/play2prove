"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [authUser, setAuthUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const current = data?.session?.user;
      if (!current) {
        window.location.replace("/login");
        return;
      }
      setAuthUser(current);

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", current.id)
        .maybeSingle();
      if (userError) throw userError;
      if (!userRow) throw new Error("Player account record not found.");

      setPlayer(userRow);
      setFullName(userRow.full_name || current.user_metadata?.full_name || "");
      setPhone(userRow.mobile_number || current.user_metadata?.phone || "");
    } catch (err) {
      console.error("Profile loading error:", err);
      setError(err?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!authUser) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const cleanName = fullName.trim();
      const cleanPhone = phone.replace(/\D/g, "");

      if (cleanName.length < 3) throw new Error("Please enter a valid full name.");
      if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error("Please enter a valid 10-digit Indian mobile number.");
      }

      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update({ full_name: cleanName, mobile_number: cleanPhone || null })
        .eq("user_id", authUser.id)
        .select("*")
        .single();
      if (updateError) throw updateError;

      setPlayer(updated);
      setFullName(updated.full_name || "");
      setPhone(updated.mobile_number || "");
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const displayName = fullName || player?.full_name || authUser?.email?.split("@")[0] || "Player";
  const playerId = player?.player_id || "Not assigned";
  const accountStatus = player?.account_status || "active";
  const memberSince = player?.created_at || authUser?.created_at;

  if (loading) {
    return <main style={styles.page}><div style={styles.loading}>Loading Player Account...</div></main>;
  }

  if (!authUser) return null;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button onClick={() => (window.location.href = "/")} style={styles.headerBtn}>← Home</button>
        <div style={styles.brand}><div style={styles.logoBox}>P2P</div><div><b>Play2Prove</b><small>PLAY • COMPETE • EARN • PROVE</small></div></div>
        <button onClick={logout} style={styles.headerBtn}>Logout</button>
      </header>

      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={styles.green}>● PLAYER ACCOUNT</div>
            <h1 style={styles.name}>{displayName}</h1>
            <p style={styles.email}>{authUser.email}</p>
            <div style={styles.badge}>PLAYER ID: {playerId}</div>
          </div>
          <button onClick={() => { setEditing(v => !v); setError(""); setMessage(""); }} style={styles.editBtn}>{editing ? "Cancel" : "Edit Profile"}</button>
        </section>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <section style={styles.stats}>
          <div style={styles.card}><small>PLAYER ID</small><strong>{playerId}</strong></div>
          <div style={styles.card}><small>ACCOUNT</small><strong>{accountStatus}</strong></div>
          <div style={styles.card}><small>MEMBER SINCE</small><strong>{memberSince ? new Date(memberSince).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</strong></div>
        </section>

        <section style={styles.grid}>
          <div style={styles.cardLarge}>
            <div style={styles.cardHead}><div><div style={styles.orange}>ACCOUNT INFORMATION</div><h2>Player Profile</h2></div><span style={styles.green}>🔒 SECURE</span></div>
            <div style={styles.formGrid}>
              <Field label="Full Name" editing={editing} value={fullName} onChange={setFullName} />
              <ReadOnlyField label="Email Address" value={authUser.email || "Not available"} />
              <Field label="Mobile Number" editing={editing} value={phone} onChange={setPhone} />
              <ReadOnlyField label="Referral Code" value={player?.referral_code || "Not assigned"} />
            </div>
            {editing && <div style={{ textAlign: "right", marginTop: 20 }}><button disabled={saving} onClick={saveProfile} style={styles.saveBtn}>{saving ? "Saving..." : "Save Profile"}</button></div>}
          </div>

          <aside style={{ display: "grid", gap: 14 }}>
            <div style={styles.cardLarge}>
              <div style={styles.orange}>PLAYER CENTER</div><h3>Manage Account</h3>
              {[["▣", "Dashboard", "/dashboard"], ["♛", "Tournaments", "/tournaments"], ["⚔", "My Matches", "/matches"], ["▣", "Wallet", "/wallet"]].map(([icon, label, path]) => <button key={path} onClick={() => (window.location.href = path)} style={styles.quick}>{icon}<span>{label}</span>→</button>)}
            </div>
            <div style={styles.security}><b>🔐 Account Security</b><p>Never share your password or OTP.</p><button onClick={() => (window.location.href = "/reset-password")} style={styles.linkBtn}>Change Password →</button></div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Field({ label, editing, value, onChange }) {
  return <div><label style={styles.label}>{label}</label>{editing ? <input value={value} onChange={e => onChange(e.target.value)} style={styles.input} /> : <div style={styles.value}>{value || "Not provided"}</div>}</div>;
}

function ReadOnlyField({ label, value }) {
  return <div><label style={styles.label}>{label}</label><div style={styles.value}>{value || "Not provided"}</div></div>;
}

const styles = {
  page:{minHeight:"100vh",background:"#05070a",color:"#fff",fontFamily:"Arial,Helvetica,sans-serif",paddingBottom:40},
  header:{height:72,borderBottom:"1px solid #20252d",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:"#06080b"},
  headerBtn:{background:"transparent",color:"#d1d5db",border:"1px solid #30363d",borderRadius:8,padding:"9px 14px",cursor:"pointer",fontWeight:700},
  brand:{display:"flex",alignItems:"center",gap:10},
  logoBox:{width:38,height:38,borderRadius:9,background:"#ff5a00",display:"grid",placeItems:"center",fontWeight:900,fontSize:12},
  brandTitle:{fontWeight:800},
  brand small:{display:"block",color:"#6b7280",fontSize:8,letterSpacing:1},
  container:{maxWidth:1100,margin:"0 auto",padding:"35px 20px"},
  hero:{background:"#0d1117",border:"1px solid #252b34",borderRadius:18,padding:30,display:"flex",alignItems:"center",gap:20},
  avatar:{width:88,height:88,borderRadius:"50%",background:"#ff5a00",display:"grid",placeItems:"center",fontSize:36,fontWeight:900},
  green:{color:"#22c55e",fontSize:10,fontWeight:800,letterSpacing:1},
  orange:{color:"#ff5a00",fontSize:10,fontWeight:900,letterSpacing:1.4},
  name:{fontSize:32,margin:"6px 0"},email:{color:"#9ca3af",margin:"0 0 12px"},badge:{display:"inline-block",border:"1px solid #30363d",borderRadius:7,padding:"7px 10px",fontSize:11,fontWeight:700,color:"#cbd5e1"},
  editBtn:{background:"#ff5a00",border:0,color:"#fff",borderRadius:9,padding:"12px 18px",fontWeight:800,cursor:"pointer"},
  error:{marginTop:18,padding:14,borderRadius:10,background:"#3b0b0b",border:"1px solid #ef4444",color:"#fecaca"},
  success:{marginTop:18,padding:14,borderRadius:10,background:"#052e16",border:"1px solid #22c55e",color:"#bbf7d0"},
  stats:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:14,marginTop:18},card:{background:"#0b0f14",border:"1px solid #252b34",borderRadius:12,padding:18},
  cardLarge:{background:"#0b0f14",border:"1px solid #252b34",borderRadius:16,padding:24},cardHead:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22},
  grid:{display:"grid",gridTemplateColumns:"minmax(0,1.6fr) minmax(280px,.8fr)",gap:18,marginTop:18},formGrid:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18},
  label:{display:"block",color:"#9ca3af",fontSize:12,fontWeight:700,marginBottom:8},value:{minHeight:46,background:"#07090c",border:"1px solid #252b34",borderRadius:9,padding:"13px",display:"flex",alignItems:"center",boxSizing:"border-box"},input:{width:"100%",minHeight:46,boxSizing:"border-box",background:"#07090c",border:"1px solid #3a424d",borderRadius:9,padding:"13px",color:"#fff",fontSize:14},saveBtn:{background:"#16a34a",border:0,color:"#fff",borderRadius:9,padding:"12px 22px",fontWeight:800,cursor:"pointer"},
  quick:{width:"100%",display:"grid",gridTemplateColumns:"28px 1fr 20px",textAlign:"left",alignItems:"center",gap:8,background:"#080b0f",color:"#d8dde5",border:"1px solid #242a32",borderRadius:8,padding:12,marginTop:8,cursor:"pointer",fontWeight:700},
  security:{background:"#0b1510",border:"1px solid #21462d",borderRadius:16,padding:20},security p:{color:"#8f9a94",fontSize:12},linkBtn:{background:"transparent",border:0,color:"#22c55e",padding:0,fontWeight:800,cursor:"pointer"},loading:{width:"min(420px,calc(100% - 40px))",margin:"20vh auto",padding:35,textAlign:"center",background:"#0b0f14",border:"1px solid #252b34",borderRadius:16}
};