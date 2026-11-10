"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const GAME_LIST = [
  { name: "Free Fire", icon: "🔥", sub: "Garena" },
  { name: "BGMI", icon: "🎯", sub: "Battlegrounds Mobile India" },
  { name: "Valorant", icon: "⚡", sub: "Riot Games" },
  { name: "Call of Duty", icon: "🎮", sub: "COD Mobile" },
];
const TXNS = [
  { date: "—", id: "—", remark: "Your wallet transactions will appear here", type: "—", debit: "—", credit: "—", balance: "—", status: "No records" },
];
const NAV = [["overview","user-round","My Profile"],["transactions","receipt-text","Transaction History"]];

export default function ProfilePage() {
  const [authUser,setAuthUser]=useState(null),[player,setPlayer]=useState(null),[loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false),[editing,setEditing]=useState(false),[sidebarOpen,setSidebarOpen]=useState(true);
  const [active,setActive]=useState("overview"),[personalOpen,setPersonalOpen]=useState(false),[securityOpen,setSecurityOpen]=useState(false);
  const [fullName,setFullName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState("");
  const [message,setMessage]=useState(""),[error,setError]=useState("");
  const [game,setGame]=useState("Free Fire"),[members,setMembers]=useState({}),[memberEditor,setMemberEditor]=useState(false);
  const [editingMember,setEditingMember]=useState(-1),[memberForm,setMemberForm]=useState({name:"",uid:"",owner:"Own",friend:""});
  const [txFilter,setTxFilter]=useState("All Types");

  useEffect(()=>{loadProfile();},[]);
  async function loadProfile(){
    setLoading(true);setError("");
    try{
      const {data,error:sessionError}=await supabase.auth.getSession();if(sessionError)throw sessionError;
      const current=data?.session?.user;if(!current){window.location.replace("/login");return;}
      setAuthUser(current);setEmail(current.email||"");
      const {data:userRow,error:userError}=await supabase.from("users").select("*").eq("user_id",current.id).maybeSingle();
      if(userError)throw userError;if(!userRow)throw new Error("Player account record not found.");
      setPlayer(userRow);setFullName(userRow.full_name||current.user_metadata?.full_name||"");setPhone(userRow.mobile_number||current.user_metadata?.phone||"");
    }catch(err){console.error(err);setError(err?.message||"Unable to load profile.");}finally{setLoading(false);}
  }
  async function saveProfile(){
    if(!authUser)return;setSaving(true);setError("");setMessage("");
    try{
      const name=fullName.trim(),mobile=phone.replace(/\D/g,"");
      if(name.length<3)throw new Error("Enter a valid full name.");
      if(mobile&&!/^[6-9]\d{9}$/.test(mobile))throw new Error("Enter a valid 10-digit Indian mobile number.");
      const {data,error:updateError}=await supabase.from("users").update({full_name:name,mobile_number:mobile||null}).eq("user_id",authUser.id).select("*").single();
      if(updateError)throw updateError;setPlayer(data);setFullName(data.full_name||"");setPhone(data.mobile_number||"");setEditing(false);setMessage("Personal details saved.");
    }catch(err){setError(err?.message||"Could not save details.");}finally{setSaving(false);}
  }
  async function logout(){await supabase.auth.signOut();window.location.href="/login";}
  function go(page){setActive(page);setMessage("");setError("");if(window.innerWidth<760)setSidebarOpen(false);}
  function openGame(name){setGame(name);setActive("gameDetail");setMemberEditor(false);}
  function saveMember(){
    const f=memberForm;if(!f.name.trim()||!f.uid.trim()||(f.owner==="Friend"&&!f.friend.trim()))return;
    setMembers(prev=>{const arr=[...(prev[game]||[])];const row={...f};if(editingMember>=0)arr[editingMember]=row;else arr.push(row);return {...prev,[game]:arr};});
    setMemberEditor(false);setEditingMember(-1);setMemberForm({name:"",uid:"",owner:"Own",friend:""});
  }
  function editMember(i){setEditingMember(i);setMemberForm({...members[game][i]});setMemberEditor(true);}
  function removeMember(i){if(!window.confirm("Remove this game ID?"))return;setMembers(prev=>({...prev,[game]:(prev[game]||[]).filter((_,n)=>n!==i)}));}
  const displayName=fullName||player?.full_name||authUser?.email?.split("@")[0]||"Player";
  const playerId=player?.player_id||"Not assigned";
  const balance=Number(player?.wallet_balance||0);

  if(loading)return <main className="pp-loading">Loading Player Centre...</main>;
  if(!authUser)return null;

  return <div className={"pp-app "+(!sidebarOpen?"pp-collapsed":"")}>
    <aside className="pp-sidebar">
      <div className="pp-side-scroll">
        <div className="pp-brand"><div className="pp-logo">P2P</div><div className="pp-brand-name">Play<span>2</span>Prove<small>PLAYER CENTRE</small></div></div>
        <div className="pp-nav-label">PLAYER CENTRE</div>
        <nav className="pp-nav">{NAV.map(([id,icon,label])=><button key={id} className={active===id?"active":""} onClick={()=>go(id)}><i>{icon==="user-round"?"◉":"▤"}</i><span>{label}</span></button>)}</nav>
      </div>
      <div className="pp-side-foot">PLAY • COMPETE • EARN • PROVE</div>
    </aside>
    <main className="pp-main">
      <header className="pp-topbar">
        <div className="pp-top-left"><button className="pp-toggle" onClick={()=>setSidebarOpen(v=>!v)} aria-label="Toggle sidebar">☰</button><div className="pp-crumb">Player Centre <b>/ {active==="gameDetail"?game:NAV.find(n=>n[0]===active)?.[2]||"Profile"}</b></div></div>
        <div className="pp-top-right"><div className="pp-user-chip"><span>{displayName.charAt(0).toUpperCase()}</span><b>{displayName}</b></div><button className="pp-logout" onClick={logout}>Logout ↗</button></div>
      </header>
      {error&&<div className="pp-alert pp-error">{error}</div>}{message&&<div className="pp-alert pp-success">{message}</div>}

      {active==="overview"&&<section className="pp-page">
        <div className="pp-heading"><div><h1>Player Profile</h1><p>Your gaming identity, account details and wallet at one place.</p></div><span className="pp-status">● ACCOUNT ACTIVE</span></div>
        <div className="pp-card pp-profile-card">
          <div className="pp-identity"><div className="pp-avatar">{displayName.charAt(0).toUpperCase()}</div><div><h2>{displayName}</h2><p>{authUser.email||"Email not added"}</p><span className="pp-uid">PLAYER ID: {playerId} <button onClick={()=>navigator.clipboard?.writeText(playerId)}>Copy</button></span></div></div>
          <div className="pp-wallet-panel"><div className="pp-wallet-top"><div><small>TOTAL WALLET BALANCE</small><strong>₹ {balance.toLocaleString("en-IN",{minimumFractionDigits:2})}</strong><span>Available balance</span></div><button className="pp-refresh" onClick={loadProfile} title="Refresh balance">⟳</button></div><div className="pp-wallet-buttons"><button onClick={()=>go("deposits")}>＋ Add Deposit</button><button onClick={()=>go("withdrawals")}>↗ Add Withdraw Request</button><button onClick={()=>go("transactions")}>▤ Check Transactions</button></div></div>
        </div>
        <div className="pp-stats"><div className="pp-stat"><small>PLAYER ID</small><b>{playerId}</b></div><div className="pp-stat"><small>ACCOUNT STATUS</small><b className="pp-green">{player?.account_status||"Active"}</b></div><div className="pp-stat"><small>MEMBER SINCE</small><b>{(player?.created_at||authUser.created_at)?new Date(player?.created_at||authUser.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}</b></div></div>
        <div className="pp-section-head"><div><h2>My Gaming Profiles</h2><p>Manage game IDs separately for each game.</p></div><button className="pp-text-btn" onClick={()=>go("gaming")}>View all →</button></div>
        <div className="pp-games">{GAME_LIST.map(g=><button className="pp-game" key={g.name} onClick={()=>openGame(g.name)}><span>{g.icon}</span><b>{g.name}</b><small>{(members[g.name]||[]).length} IDs added</small><em>Open profile →</em></button>)}</div>
        <div className="pp-section-head"><div><h2>Account Settings</h2><p>Your personal details and account protection.</p></div></div>
        <div className="pp-shortcuts">{[["♙","My Personal Data","personal"],["♢","Password & Security","security"]].map(([ic,label,id])=><button key={id} onClick={()=>go(id)}><i>{ic}</i><span><b>{label}</b><small>Open and manage details</small></span><em>→</em></button>)}</div>
      </section>}

      {active==="personal"&&<section className="pp-page">
        <div className="pp-backrow"><button onClick={()=>go("overview")}>← Back</button><div><h1>My Personal Data</h1><p>Your personal and account information.</p></div></div>
        <div className={"pp-accordion "+(personalOpen?"open":"")}><button className="pp-accordion-head" onClick={()=>setPersonalOpen(v=>!v)}><span><i>♙</i><span><b>Personal Information</b><small>Real name, mobile, email and identity details</small></span></span><strong>{personalOpen?"−":"＋"}</strong></button>
          {personalOpen&&<div className="pp-accordion-body"><div className="pp-form-grid">
            <label>REAL FULL NAME<input disabled={!editing} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Enter your legal name"/></label>
            <label>MOBILE NUMBER<input disabled={!editing} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile number"/></label>
            <label>EMAIL ADDRESS<input disabled value={email}/></label>
            <label>PLAYER ID<input disabled value={playerId}/></label>
            <label>AADHAAR NUMBER<input disabled placeholder="Secure verification required"/></label>
            <label>PAN NUMBER<input disabled placeholder="Secure verification required"/></label>
          </div><p className="pp-note">Aadhaar and PAN are not collected or stored in this profile yet. Secure verification must be designed before adding them.</p>
          <div className="pp-actions">{editing?<><button className="pp-secondary" onClick={()=>{setEditing(false);setFullName(player?.full_name||"");setPhone(player?.mobile_number||"");}}>Cancel</button><button className="pp-primary" disabled={saving} onClick={saveProfile}>{saving?"Saving...":"Save Changes"}</button></>:<button className="pp-primary" onClick={()=>setEditing(true)}>Edit Details</button>}</div></div>}
        </div>
        <div className="pp-accordion"><button className="pp-accordion-head" onClick={()=>setSecurityOpen(v=>!v)}><span><i>♢</i><span><b>Password & Security</b><small>Manage your password and account access</small></span></span><strong>{securityOpen?"−":"＋"}</strong></button>{securityOpen&&<div className="pp-accordion-body"><p>Keep your password private. Use the secure password reset flow to change it.</p><button className="pp-primary" onClick={()=>window.location.href="/reset-password"}>Change Password</button></div>}</div>
      </section>}

      {active==="gaming"&&<section className="pp-page"><div className="pp-heading"><div><h1>My Gaming Profile</h1><p>Select a game to manage your player IDs and friend members.</p></div></div><div className="pp-games pp-games-large">{GAME_LIST.map(g=><button className="pp-game" key={g.name} onClick={()=>openGame(g.name)}><span>{g.icon}</span><b>{g.name}</b><small>{(members[g.name]||[]).length} player IDs</small><em>Manage game IDs →</em></button>)}</div></section>}

      {active==="gameDetail"&&<section className="pp-page"><div className="pp-backrow"><button onClick={()=>go("gaming")}>← Back to Games</button><div><h1>{game} Profile</h1><p>Only IDs saved under {game} appear here.</p></div></div>
        <div className="pp-card"><div className="pp-section-head"><div><h2>{game} Members</h2><p>Add your own ID or a friend's ID.</p></div><button className="pp-primary" onClick={()=>{setEditingMember(-1);setMemberForm({name:"",uid:"",owner:"Own",friend:""});setMemberEditor(true);}}>＋ Add Member</button></div>
          {(members[game]||[]).length===0?<div className="pp-empty">No {game} IDs added yet. Add your first player ID.</div>:(members[game]||[]).map((m,i)=><div className="pp-member" key={i}><div><b>{m.name}</b><p>UID: {m.uid}</p><small>{m.owner==="Friend"?"FRIEND TAG · "+m.friend:"OWN ACCOUNT"}</small></div><div><button className="pp-secondary" onClick={()=>editMember(i)}>Edit</button><button className="pp-danger" onClick={()=>removeMember(i)}>Remove</button></div></div>)}
          {memberEditor&&<div className="pp-member-editor"><h3>{editingMember>=0?"Edit Member":"Add Game Member"}</h3><div className="pp-form-grid"><label>IN-GAME NAME<input value={memberForm.name} onChange={e=>setMemberForm({...memberForm,name:e.target.value})} placeholder="e.g. 7H Prince"/></label><label>GAME UID / ID<input value={memberForm.uid} onChange={e=>setMemberForm({...memberForm,uid:e.target.value})} placeholder="Enter game UID"/></label><label>ID BELONGS TO<select value={memberForm.owner} onChange={e=>setMemberForm({...memberForm,owner:e.target.value})}><option>Own</option><option>Friend</option></select></label>{memberForm.owner==="Friend"&&<label>FRIEND NAME<input value={memberForm.friend} onChange={e=>setMemberForm({...memberForm,friend:e.target.value})} placeholder="Friend's name"/></label>}</div><div className="pp-actions"><button className="pp-secondary" onClick={()=>setMemberEditor(false)}>Cancel</button><button className="pp-primary" onClick={saveMember}>Save Member</button></div></div>}
        </div></section>}

      {active==="wallet"&&<section className="pp-page"><div className="pp-heading"><div><h1>Wallet Overview</h1><p>Your Play2Prove wallet summary.</p></div></div><div className="pp-card pp-wallet-hero"><small>AVAILABLE WALLET BALANCE</small><strong>₹ {balance.toLocaleString("en-IN",{minimumFractionDigits:2})}</strong><p>Balance is read from your player account.</p></div><div className="pp-stats pp-wallet-stats"><div className="pp-stat"><small>TOTAL DEPOSIT</small><b>—</b></div><div className="pp-stat"><small>TOTAL WITHDRAW</small><b>—</b></div><div className="pp-stat"><small>TOTAL PAID</small><b>—</b></div><div className="pp-stat"><small>REWARDS</small><b>—</b></div></div><div className="pp-card"><h2>Balance Activity</h2><div className="pp-empty">Wallet chart will appear when the wallet ledger is connected.</div></div></section>}

      {["transactions","deposits","withdrawals"].includes(active)&&<section className="pp-page"><div className="pp-backrow"><button onClick={()=>go("overview")}>← Back</button><div><h1>{active==="transactions"?"Transaction History":active==="deposits"?"Deposit History":"Withdraw History"}</h1><p>{active==="transactions"?"Complete bank-style wallet statement, line by line.":active==="deposits"?"All deposits and top-ups, maintained separately.":"All withdrawal requests and payout records."}</p></div></div>
        <div className="pp-card"><div className="pp-filters"><input placeholder="Search ID / remarks"/>{active==="transactions"&&<select value={txFilter} onChange={e=>setTxFilter(e.target.value)}><option>All Types</option><option>Deposit</option><option>Withdraw</option><option>Paid</option><option>Winning</option><option>Refund</option></select>}<input type="date"/><input type="date"/></div><div className="pp-table-wrap"><table className="pp-table"><thead><tr>{(active==="transactions"?["Date & Time","Transaction ID","Description / Remarks","Type","Debit (₹)","Credit (₹)","Balance (₹)","Status"]:active==="deposits"?["Date & Time","Deposit ID","Payment Method","UTR / Reference","Amount (₹)","Wallet Credit (₹)","Status","Remarks"]:["Date & Time","Withdrawal ID","Bank / UPI","Account Reference","Requested (₹)","Paid (₹)","Status","Remarks"]).map(h=><th key={h}>{h}</th>)}</tr></thead><tbody><tr><td colSpan="8" className="pp-empty-cell">No {active==="transactions"?"transactions":active==="deposits"?"deposits":"withdrawals"} recorded yet.</td></tr></tbody></table></div></div></section>}

      {active==="security"&&<section className="pp-page"><div className="pp-backrow"><button onClick={()=>go("overview")}>← Back</button><div><h1>Account & Security</h1><p>Protect your Play2Prove account.</p></div></div><div className="pp-card"><h2>Password & Login</h2><p className="pp-muted">Change your password using the secure account flow.</p><button className="pp-primary" onClick={()=>window.location.href="/reset-password"}>Change Password</button></div></section>}
    </main>
    <style jsx global>{`
      *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#eef2f8;color:#172033;font-family:Arial,Helvetica,sans-serif}
      .pp-app{height:100dvh;display:flex;gap:12px;padding:12px;background:#eef2f8;overflow:hidden}
      .pp-sidebar{width:244px;flex:0 0 244px;background:#111a31;color:#fff;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;transition:width .2s,flex-basis .2s}
      .pp-side-scroll{flex:1;overflow-y:auto;padding:18px 12px;overscroll-behavior:contain}.pp-brand{display:flex;align-items:center;gap:10px;padding:0 7px 20px;border-bottom:1px solid #ffffff20;white-space:nowrap}
      .pp-logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(140deg,#adc2ff,#536fe0);display:grid;place-items:center;color:#142044;font-weight:900}.pp-brand-name{font-size:17px;font-weight:900}.pp-brand-name span{color:#a9bdff}.pp-brand-name small{display:block;font-size:9px;color:#91a0bf;letter-spacing:1.5px;margin-top:3px}
      .pp-nav-label{font-size:10px;letter-spacing:1.5px;color:#8190ad;padding:22px 10px 9px}.pp-nav{display:grid;gap:5px}.pp-nav button{border:0;background:none;color:#c7d1e5;text-align:left;padding:11px;border-radius:9px;font-size:12px;display:flex;gap:12px;align-items:center;white-space:nowrap;cursor:pointer}.pp-nav button.active{background:#293b68;color:#fff;box-shadow:inset 3px 0 #a9bdff}.pp-nav i{font-style:normal;width:20px;text-align:center;font-size:17px}
      .pp-support{padding:13px;background:#1b2948;border-radius:11px;margin:18px 2px 10px;font-size:11px}.pp-support p{color:#adbad2;line-height:1.5}.pp-support button{width:100%;border:0;padding:9px;border-radius:8px;background:#e0e8ff;color:#1b2b57;font-weight:bold;font-size:10px;cursor:pointer}.pp-side-foot{padding:12px 10px;text-align:center;font-size:8px;letter-spacing:1px;color:#8290aa;border-top:1px solid #ffffff18;white-space:nowrap}
      .pp-collapsed .pp-sidebar{width:66px;flex-basis:66px}.pp-collapsed .pp-brand-name,.pp-collapsed .pp-nav-label,.pp-collapsed .pp-nav button span,.pp-collapsed .pp-support,.pp-collapsed .pp-side-foot{display:none}.pp-collapsed .pp-brand{justify-content:center;padding:0 0 20px}.pp-collapsed .pp-side-scroll{padding:18px 7px}.pp-collapsed .pp-nav button{justify-content:center;padding:12px 3px}
      .pp-main{flex:1;min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:2px 5px 35px;scrollbar-width:thin}.pp-topbar{height:52px;display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.pp-top-left,.pp-top-right{display:flex;align-items:center;gap:12px}.pp-toggle,.pp-logout{height:37px;border:1px solid #dfe5ee;background:#fff;border-radius:9px;padding:0 12px;color:#293b68;font-weight:bold;cursor:pointer}.pp-crumb{font-size:12px;color:#788397}.pp-crumb b{color:#172033}.pp-user-chip{display:flex;align-items:center;gap:8px;font-size:11px}.pp-user-chip span{width:29px;height:29px;border-radius:9px;background:#dce6ff;display:grid;place-items:center;color:#314cae;font-weight:bold}.pp-logout{color:#4b5870}
      .pp-page{max-width:1250px;margin:0 auto}.pp-heading,.pp-section-head{display:flex;justify-content:space-between;align-items:end;gap:15px;margin:0 2px 15px}.pp-heading h1,.pp-backrow h1{font-size:25px;margin:0 0 6px}.pp-heading p,.pp-backrow p,.pp-section-head p{font-size:11px;color:#788397;margin:0}.pp-status{font-size:10px;color:#149568;background:#e6f7ef;padding:8px 11px;border-radius:20px;font-weight:bold}
      .pp-card,.pp-stat{background:#fff;border:1px solid #e5eaf2;border-radius:15px;padding:16px;margin-bottom:14px;box-shadow:0 8px 25px #1a2b4d0a}.pp-profile-card{display:grid;grid-template-columns:1fr 1.25fr;gap:14px;align-items:center}.pp-identity{display:flex;align-items:center;gap:12px;min-width:0}.pp-avatar{width:70px;height:70px;flex:0 0 70px;border-radius:19px;background:linear-gradient(140deg,#dce6f7,#aebfdb);display:grid;place-items:center;color:#354d7d;font-size:24px;font-weight:900}.pp-identity h2{font-size:17px;margin:0 0 5px}.pp-identity p{font-size:10px;color:#788397;margin:0 0 8px}.pp-uid{display:inline-block;font-size:9px;background:#f1f4f9;padding:6px 8px;border-radius:7px}.pp-uid button{border:0;background:none;color:#314cae;font-weight:bold;cursor:pointer}.pp-quick-actions{display:flex;justify-content:center;gap:12px}.pp-quick-actions button{border:0;background:none;font-size:10px;color:#4d5870;font-weight:bold;display:grid;justify-items:center;gap:6px;cursor:pointer}.pp-quick-actions i{font-style:normal;width:38px;height:38px;border-radius:12px;background:#edf1fb;color:#314cae;display:grid;place-items:center;font-size:17px}.pp-wallet-panel{background:linear-gradient(125deg,#17264d,#344f9d);color:#fff;border-radius:15px;padding:15px;box-shadow:0 12px 26px #243b7a26}.pp-wallet-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.pp-wallet-top small,.pp-wallet-hero small{font-size:9px;color:#d0dcff;font-weight:800;letter-spacing:1.1px}.pp-wallet-top strong,.pp-wallet-hero strong{display:block;font-size:25px;margin:7px 0}.pp-wallet-top span{font-size:10px;color:#d5def5}.pp-refresh{border:1px solid #ffffff45;background:#ffffff18;color:#fff;width:35px;height:35px;border-radius:10px;font-size:22px;cursor:pointer}.pp-wallet-buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.pp-wallet-buttons button{border:1px solid #ffffff35;background:#ffffff16;color:#fff;border-radius:9px;padding:10px 8px;font-size:10px;font-weight:800;cursor:pointer;transition:transform .18s,background .18s}.pp-wallet-buttons button:last-child{grid-column:1/-1;background:#fff;color:#253d82}.pp-wallet-buttons button:hover{transform:translateY(-2px);background:#ffffff30}.pp-wallet-buttons button:last-child:hover{background:#edf2ff}
      .pp-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 22px}.pp-stat{margin:0;padding:13px}.pp-stat small{display:block;font-size:9px;color:#788397;font-weight:bold}.pp-stat b{display:block;margin-top:7px;font-size:13px;overflow-wrap:anywhere}.pp-green{color:#149568}
      .pp-section-head{margin-top:20px}.pp-section-head h2{font-size:16px;margin:0 0 4px}.pp-text-btn{border:0;background:none;color:#314cae;font-weight:bold;font-size:11px;cursor:pointer}.pp-games{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.pp-game{border:0;text-align:left;min-height:122px;border-radius:12px;padding:14px;color:#fff;background:linear-gradient(135deg,#17223d,#344f91);display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;cursor:pointer}.pp-game:nth-child(2){background:linear-gradient(135deg,#28364e,#657b9d)}.pp-game:nth-child(3){background:linear-gradient(135deg,#29213e,#63538e)}.pp-game:nth-child(4){background:linear-gradient(135deg,#202b36,#5b697a)}.pp-game>span{font-size:21px}.pp-game b{font-size:14px}.pp-game small{font-size:9px;color:#dce4f6}.pp-game em{font-style:normal;font-size:10px;color:#dce4f6}.pp-games-large{margin-top:12px}.pp-games-large .pp-game{min-height:150px}
      .pp-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.pp-shortcuts button{border:1px solid #e5eaf2;background:#fff;border-radius:11px;padding:12px;display:flex;align-items:center;gap:10px;text-align:left;color:#172033;cursor:pointer}.pp-shortcuts i{font-style:normal;width:34px;height:34px;border-radius:9px;background:#e5ebfa;color:#314cae;display:grid;place-items:center}.pp-shortcuts b,.pp-shortcuts small{display:block}.pp-shortcuts b{font-size:11px}.pp-shortcuts small{font-size:9px;color:#788397;margin-top:4px}.pp-shortcuts em{font-style:normal;margin-left:auto}
      .pp-backrow{display:flex;align-items:center;gap:12px;margin:0 0 16px}.pp-backrow>button{border:1px solid #dfe5ee;background:#fff;border-radius:8px;padding:9px 12px;font-size:11px;font-weight:bold;color:#34415b;cursor:pointer;white-space:nowrap}.pp-backrow h1{font-size:21px}.pp-accordion{border:1px solid #e5eaf2;border-radius:12px;overflow:hidden;background:#fff;margin:10px 0}.pp-accordion-head{width:100%;border:0;background:#f5f7fb;padding:15px;text-align:left;display:flex;justify-content:space-between;align-items:center;cursor:pointer}.pp-accordion-head>span{display:flex;align-items:center;gap:11px}.pp-accordion-head i{font-style:normal;width:36px;height:36px;border-radius:10px;background:#e5ebfa;color:#314cae;display:grid;place-items:center}.pp-accordion-head b,.pp-accordion-head small{display:block}.pp-accordion-head b{font-size:12px}.pp-accordion-head small{font-size:10px;color:#788397;margin-top:4px}.pp-accordion-head strong{color:#314cae;font-size:17px}.pp-accordion-body{padding:17px}.pp-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.pp-form-grid label{display:block;font-size:9px;color:#566176;font-weight:bold}.pp-form-grid input,.pp-form-grid select{display:block;width:100%;margin-top:6px;padding:11px;border:1px solid #dfe5ee;border-radius:8px;background:#fff;color:#172033;font-size:11px}.pp-form-grid input:disabled{background:#f4f6fa;color:#536078}.pp-note,.pp-muted{font-size:10px;color:#788397;line-height:1.5}.pp-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.pp-primary,.pp-secondary,.pp-danger{border:0;border-radius:8px;padding:10px 14px;font-size:10px;font-weight:bold;cursor:pointer}.pp-primary{background:#314cae;color:#fff}.pp-secondary{background:#edf1f7;color:#39465d}.pp-danger{background:#fff0f1;color:#c34656;margin-left:6px}.pp-member{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px;border:1px solid #e5eaf2;border-radius:10px;margin:9px 0;background:#fafbfe}.pp-member b{font-size:12px}.pp-member p{font-size:10px;color:#566176;margin:6px 0}.pp-member small{font-size:9px;color:#314cae;font-weight:bold}.pp-member-editor{border-top:1px solid #e5eaf2;margin-top:14px;padding-top:14px}.pp-empty{padding:26px;text-align:center;color:#788397;font-size:11px;background:#f8f9fc;border:1px dashed #dce2ec;border-radius:10px}.pp-wallet-hero{background:linear-gradient(135deg,#1a2850,#344e9c);color:#fff;padding:22px}.pp-wallet-hero strong{font-size:30px}.pp-wallet-hero p{font-size:10px;color:#d5def5}.pp-wallet-stats{margin-top:12px;grid-template-columns:repeat(4,minmax(0,1fr))}.pp-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.pp-filters input,.pp-filters select{border:1px solid #e5eaf2;border-radius:7px;padding:9px;font-size:10px;background:#fff}.pp-table-wrap{overflow:auto;border:1px solid #e5eaf2;border-radius:10px}.pp-table{border-collapse:collapse;width:100%;min-width:850px;font-size:10px}.pp-table th{background:#f0f3f9;color:#46536b;text-align:left;font-size:9px;padding:11px;white-space:nowrap}.pp-table td{padding:14px;border-top:1px solid #edf0f5;color:#788397}.pp-empty-cell{text-align:center}.pp-alert{max-width:1250px;margin:0 auto 12px;padding:11px 14px;border-radius:9px;font-size:11px}.pp-error{background:#fff0f1;border:1px solid #f2c4ca;color:#b42332}.pp-success{background:#e6f7ef;border:1px solid #b8e5d0;color:#147b54}.pp-loading{height:100dvh;display:grid;place-items:center;background:#eef2f8;color:#314cae;font-weight:bold}
      @media(max-width:1050px){.pp-profile-card{grid-template-columns:1fr}.pp-wallet-panel{grid-column:1/-1}.pp-games{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:760px){.pp-app{padding:6px;gap:6px}.pp-sidebar{width:64px;flex-basis:64px}.pp-brand-name,.pp-nav-label,.pp-nav button span,.pp-support,.pp-side-foot{display:none}.pp-brand{justify-content:center;padding:0 0 18px}.pp-side-scroll{padding:14px 6px}.pp-nav button{justify-content:center;padding:12px 2px}.pp-crumb{display:none}.pp-user-chip b{display:none}.pp-main{padding:2px 2px 25px}.pp-heading h1{font-size:21px}.pp-profile-card{grid-template-columns:1fr}.pp-wallet-panel{grid-column:auto}.pp-form-grid{grid-template-columns:1fr}.pp-shortcuts{grid-template-columns:1fr}.pp-stats{grid-template-columns:1fr 1fr}.pp-wallet-stats{grid-template-columns:1fr 1fr}.pp-backrow{align-items:flex-start}.pp-backrow h1{font-size:18px}.pp-games{grid-template-columns:1fr 1fr}}
      @media(max-width:420px){.pp-status{font-size:8px}.pp-profile-card{padding:12px}.pp-quick-actions{justify-content:flex-start}.pp-member{align-items:flex-start}.pp-member>div:last-child{display:flex;flex-direction:column;gap:5px}.pp-danger{margin:0}.pp-topbar{margin-bottom:12px}}
    `}</style>
  </div>;
}
