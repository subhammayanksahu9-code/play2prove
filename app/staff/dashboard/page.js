"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const rejectionReasons = [
  "Invalid / Wrong Screenshot",
  "Amount Mismatch",
  "UTR Not Found",
  "Payment Not Received",
  "Screenshot Not Clear / Blurred",
  "Wrong Order / Tournament",
  "Other (Specify)",
];

export default function StaffDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lockOpen, setLockOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [locked, setLocked] = useState(false);
  const [screenshot, setScreenshot] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState(rejectionReasons[0]);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) { window.location.replace("/staff"); return; }
      const { data, error } = await supabase.from("staff_profiles")
        .select("staff_id, full_name, staff_role, is_active")
        .eq("auth_user_id", user.id).maybeSingle();
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

  function chooseScreenshot(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice("JPG, PNG ya WEBP image select karein.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setNotice("Image 10 MB se chhoti honi chahiye.");
      return;
    }
    setScreenshot(URL.createObjectURL(file));
    setNotice("Screenshot preview ready. Live request storage abhi connect nahi hai.");
  }

  function submitReject() {
    setNotice("Reject workflow ka UI ready hai; live request processing abhi connect nahi hai.");
    setRejectOpen(false);
  }

  if (loading || !profile) {
    return <main className="staff-loading">Checking staff access...</main>;
  }

  return (
    <main className="staff-shell">
      <header className="staff-topbar">
        <a className="staff-brand" href="/staff/dashboard">
          <span className="brand-icon">🎮</span>
          <span><b>Play2Prove</b><small>Staff Portal</small></span>
        </a>
        <div className="top-actions">
          <span className={`availability ${locked ? "is-locked" : ""}`}><i />{locked ? "Unavailable" : "Available"}</span>
          <button className="outline-btn" onClick={() => setLockOpen(true)}>♙ {locked ? "Unlock Account" : "Lock Account"}</button>
          <button className="profile-chip" onClick={logout}><span>{profile.full_name?.[0] || "S"}</span><b>{profile.full_name}<small>{profile.staff_role} • {profile.staff_id}</small></b>⌄</button>
          <button className="logout-mobile" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="staff-layout">
        <aside className="staff-sidebar">
          <a className="side-link active" href="/staff/dashboard">⌂ <span>Dashboard</span></a>
          <a className="side-link" href="#history">◷ <span>Request History</span></a>
          <a className="side-link" href="#profile">♙ <span>My Profile</span></a>
          <div className="side-bottom"><a className="side-link" href="#help">ⓘ <span>Help</span></a><small>v1.0.0</small></div>
        </aside>

        <section className="staff-main">
          <div className="welcome-row"><div><h1>Welcome, {profile.full_name} 👋</h1><p>Handle incoming payment requests and verify them.</p></div><span className="preview-tag">UI PREVIEW</span></div>
          {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}

          <div className="stats-grid">
            <div className="stat-card"><span className="stat-icon purple">☷</span><div><b>—</b><small>Active Request</small></div></div>
            <div className="stat-card"><span className="stat-icon green">✓</span><div><b>—</b><small>Completed Today</small></div></div>
            <div className="stat-card"><span className="stat-icon red">×</span><div><b>—</b><small>Rejected Today</small></div></div>
            <div className="stat-card"><span className="stat-icon amber">◷</span><div><b>—</b><small>Avg. Processing Time</small></div></div>
          </div>

          <div className="work-grid">
            <section className="queue-panel panel">
              <div className="panel-heading"><h2>Request Queue</h2><span className="pending-pill">0 Pending</span></div>
              <div className="empty-queue"><span>☷</span><b>No request assigned</b><p>New payment requests will appear here when the live queue is connected.</p></div>
              <div className="how-card"><b>ⓘ &nbsp;How it works?</b><p>• Only one request at a time is assigned to you.</p><p>• Lock your account with password when you're on a break.</p><p>• While locked, new requests go to other available staff.</p><p>• Unlock with your password to receive requests again.</p></div>
            </section>

            <section className="request-panel panel">
              <div className="panel-heading"><h2>Payment Verification Request</h2><span className="pending-pill yellow">Waiting</span></div>
              <div className="empty-request"> <span className="empty-request-icon">⌁</span><b>Waiting for payment request</b><p>When a request is assigned, player details, order ID, UTR, amount and payment time will appear here.</p></div>
              <div className="upload-title">Payment Screenshot <em>(Required)</em></div>
              <div className="upload-row">
                <div className="screenshot-preview" onClick={() => screenshot && setZoomOpen(true)}>
                  {screenshot ? <><img src={screenshot} alt="Selected payment screenshot"/><button type="button" className="expand-shot" onClick={e => {e.stopPropagation();setZoomOpen(true);}}>⛶</button></> : <span>Image preview will appear here</span>}
                </div>
                <div className="upload-box"><div className="upload-cloud">⇧</div><b>Upload Screenshot</b><small>Add payment proof (JPG, PNG, WEBP)<br/>Max size: 10 MB</small><div className="upload-buttons"><label className="outline-btn">▣ Take Photo<input type="file" accept="image/*" capture="environment" onChange={chooseScreenshot}/></label><label className="outline-btn">▧ Choose from Gallery<input type="file" accept="image/*" onChange={chooseScreenshot}/></label></div></div>
              </div>
              <div className="request-actions"><button className="accept-btn" disabled>✓ &nbsp;Accept & Verify</button><button className="reject-btn" onClick={() => setRejectOpen(true)}>× &nbsp;Reject (Select Reason)⌄</button><button className="outline-btn" disabled>↗ Open in Sheet</button></div>
            </section>
          </div>
        </section>
      </div>

      {lockOpen && <div className="modal-backdrop" onClick={() => setLockOpen(false)}><section className="modal-card" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setLockOpen(false)}>×</button><h2>♙ {locked ? "Unlock Account" : "Lock Account"}</h2><p>{locked ? "Enter your password to become available for new requests." : "You will stop receiving new requests until you unlock."}</p><label>Password</label><div className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"/><button onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div><button className="primary-purple" onClick={() => {setNotice("Account lock UI is ready; live lock/redistribution needs backend connection.");setLockOpen(false);setPassword("");}}> {locked ? "Unlock Now" : "Lock Now"} </button></section></div>}

      {rejectOpen && <div className="modal-backdrop" onClick={() => setRejectOpen(false)}><section className="modal-card reject-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setRejectOpen(false)}>×</button><h2>Reject Request</h2><p>Select a reason for rejection:</p><div className="reason-list">{rejectionReasons.map(item => <label key={item}><input type="radio" name="reject-reason" checked={reason === item} onChange={() => setReason(item)}/><span>{item}</span></label>)}</div>{reason === "Other (Specify)" && <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Specify rejection reason"/>}<label className="note-label">Additional Note (Optional)</label><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a short note..."/><div className="modal-actions"><button className="outline-btn" onClick={() => setRejectOpen(false)}>Cancel</button><button className="reject-confirm" onClick={submitReject}>Reject Request</button></div></section></div>}

      {zoomOpen && screenshot && <div className="zoom-backdrop" onClick={() => setZoomOpen(false)}><button className="zoom-close">×</button><img src={screenshot} alt="Payment screenshot enlarged" onClick={e => e.stopPropagation()}/></div>}

      <style jsx>{`
        *{box-sizing:border-box}.staff-shell{min-height:100vh;background:#080b14;color:#f5f7ff;font-family:Arial,Helvetica,sans-serif}.staff-topbar{height:74px;padding:0 26px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #243047;background:#090e1b;position:sticky;top:0;z-index:10}.staff-brand{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none}.brand-icon{font-size:35px;color:#a77aff}.staff-brand b{display:block;font-size:23px}.staff-brand small{display:block;color:#9aa9c5;font-size:12px;margin-top:3px}.top-actions{display:flex;align-items:center;gap:14px}.availability{display:flex;align-items:center;gap:8px;color:#27e88d;background:#073a2a;padding:10px 14px;border-radius:30px;font-weight:800;font-size:13px}.availability i{width:8px;height:8px;background:#24e78b;border-radius:50%}.availability.is-locked{color:#ffb35d;background:#422b13}.availability.is-locked i{background:#ffb35d}.outline-btn{border:1px solid #455474;border-radius:10px;background:#111a2b;color:#f5f7ff;padding:11px 14px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:7px}.profile-chip{border:0;background:transparent;color:white;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer}.profile-chip>span{width:40px;height:40px;border-radius:50%;background:#514be5;display:grid;place-items:center;font-size:19px}.profile-chip b{font-size:14px}.profile-chip small{display:block;color:#99a8c3;font-weight:400;margin-top:4px}.logout-mobile{display:none}.staff-layout{display:grid;grid-template-columns:226px minmax(0,1fr);min-height:calc(100vh - 74px)}.staff-sidebar{border-right:1px solid #243047;padding:22px 13px;display:flex;flex-direction:column;gap:9px;background:#090e1b}.side-link{display:flex;align-items:center;gap:13px;color:#d5def0;text-decoration:none;padding:14px;border-radius:10px;font-size:16px}.side-link.active{background:#30206b;color:#fff}.side-bottom{margin-top:auto}.side-bottom small{display:block;color:#8998b2;padding:16px 12px}.staff-main{padding:24px;max-width:1600px;width:100%;margin:auto}.welcome-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.welcome-row h1{font-size:27px;margin:0 0 7px}.welcome-row p{color:#9aabc8}.preview-tag{font-size:10px;letter-spacing:1.3px;color:#c4a4ff;border:1px solid #6544a8;border-radius:20px;padding:7px 11px}.notice{margin:0 0 16px;padding:12px 14px;background:#18243a;border:1px solid #455a7d;border-radius:10px;color:#cbd9f3}.notice button{float:right;background:none;border:0;color:white;font-size:18px;cursor:pointer}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:24px}.stat-card{min-height:94px;border:1px solid #26344d;border-radius:13px;background:#0d1525;padding:16px;display:flex;align-items:center;gap:14px}.stat-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;font-size:25px;font-weight:900}.purple{color:#bf8cff;background:#311d58}.green{color:#39ed9b;background:#093b2b}.red{color:#ff666f;background:#401c2a}.amber{color:#ffdb78;background:#3b321a}.stat-card b{font-size:25px;display:block}.stat-card small{display:block;color:#a8b5cc;margin-top:4px}.work-grid{display:grid;grid-template-columns:minmax(270px,.85fr) minmax(0,1.6fr);gap:14px;align-items:stretch}.panel{background:#0d1525;border:1px solid #26344d;border-radius:15px;padding:18px;min-width:0}.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}.panel-heading h2{font-size:19px}.pending-pill{font-size:12px;color:#d1a5ff;background:#382064;border-radius:30px;padding:7px 12px;white-space:nowrap}.pending-pill.yellow{color:#ffd44f;background:#473915}.empty-queue,.empty-request{border:1px dashed #34445f;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#aebbd1;padding:30px 18px;min-height:190px}.empty-queue>span,.empty-request-icon{font-size:35px;color:#a77aff;margin-bottom:12px}.empty-queue b,.empty-request b{color:#eef2fb}.empty-queue p,.empty-request p{font-size:12px;line-height:1.6;color:#8fa0bd;margin-top:8px;max-width:350px}.how-card{margin-top:18px;border:1px solid #344564;background:#111d32;border-radius:12px;padding:15px}.how-card b{display:block;margin-bottom:10px}.how-card p{font-size:12px;line-height:1.55;color:#c1cce0;margin-top:6px}.request-panel{display:flex;flex-direction:column}.empty-request{min-height:150px;margin-bottom:18px}.upload-title{font-weight:800;font-size:13px;margin:3px 0 10px}.upload-title em{font-style:normal;color:#b78bff}.upload-row{display:grid;grid-template-columns:minmax(120px,.65fr) minmax(0,1.4fr);gap:12px}.screenshot-preview{min-height:165px;border:1px solid #34445f;border-radius:12px;background:#080e1b;display:grid;place-items:center;position:relative;overflow:hidden;color:#8292ae;font-size:11px;cursor:zoom-in}.screenshot-preview img{max-width:100%;max-height:190px;object-fit:contain}.expand-shot{position:absolute;right:8px;top:8px;background:#1b2840;color:#fff;border:1px solid #53617a;border-radius:7px;padding:5px 8px;cursor:pointer}.upload-box{min-height:165px;border:1px dashed #53658b;border-radius:12px;background:#101b30;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12px}.upload-cloud{font-size:30px;color:#9d7cff}.upload-box b{font-size:14px;margin:3px 0 6px}.upload-box small{font-size:11px;line-height:1.6;color:#9cabc5}.upload-buttons{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px}.upload-buttons label{font-size:11px;padding:9px 11px}.upload-buttons input{display:none}.request-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:auto;padding-top:18px}.request-actions button{flex:1}.accept-btn,.reject-btn,.reject-confirm,.primary-purple{border:0;border-radius:9px;padding:12px 14px;color:#fff;font-weight:800;cursor:pointer}.accept-btn{background:#00b85f}.accept-btn:disabled,.request-actions .outline-btn:disabled{opacity:.45;cursor:not-allowed}.reject-btn{background:transparent;border:1px solid #ff465b;color:#ff6473}.modal-backdrop,.zoom-backdrop{position:fixed;inset:0;background:#02050bdc;z-index:50;display:grid;place-items:center;padding:18px}.modal-card{width:min(460px,100%);background:#111b2e;border:1px solid #66509c;border-radius:16px;padding:24px;position:relative;box-shadow:0 25px 80px #000a}.modal-card h2{font-size:21px;margin-bottom:10px}.modal-card p{color:#aab8d0;font-size:13px;line-height:1.5;margin-bottom:18px}.modal-card>label{display:block;color:#c7d2e6;font-size:12px;margin:12px 0 7px}.modal-close{position:absolute;right:15px;top:12px;border:0;background:none;color:#b8c5dc;font-size:25px;cursor:pointer}.password-wrap{display:flex;border:1px solid #435475;border-radius:9px;overflow:hidden}.password-wrap input{flex:1;min-width:0;padding:13px;background:#091222;color:#fff;border:0;outline:0}.password-wrap button{border:0;background:#1b2941;color:#d4c4ff;padding:0 12px}.primary-purple{width:100%;margin-top:16px;background:linear-gradient(90deg,#653be0,#8b55f3)}.reject-modal{width:min(500px,100%)}.reason-list{display:grid;gap:0;border:1px solid #354563;border-radius:10px;overflow:hidden}.reason-list label{display:flex;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid #27364f;color:#e3e9f5;font-size:13px;cursor:pointer}.reason-list label:last-child{border-bottom:0}.reason-list input{accent-color:#a36aff}.reject-modal textarea{width:100%;min-height:68px;resize:vertical;background:#091222;border:1px solid #3a4b6b;border-radius:9px;padding:11px;color:#fff;font:inherit;font-size:13px}.note-label{display:block;color:#c7d2e6;font-size:12px;margin:13px 0 7px}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}.reject-confirm{background:#e33148}.zoom-backdrop img{max-width:min(92vw,1100px);max-height:88vh;object-fit:contain;border-radius:10px}.zoom-close{position:absolute;right:24px;top:16px;border:0;background:#1c2940;color:white;font-size:28px;border-radius:8px;width:42px;height:42px}.staff-loading{min-height:100vh;display:grid;place-items:center;background:#080b14;color:#fff}
        @media(max-width:1050px){.staff-layout{grid-template-columns:190px minmax(0,1fr)}.staff-main{padding:18px}.work-grid{grid-template-columns:1fr}.queue-panel{order:2}.request-panel{order:1}}
        @media(max-width:700px){.staff-topbar{height:auto;min-height:64px;padding:10px 13px}.staff-brand b{font-size:18px}.brand-icon{font-size:27px}.top-actions{gap:7px}.availability{font-size:10px;padding:8px}.top-actions>.outline-btn{font-size:10px;padding:9px}.profile-chip{display:none}.logout-mobile{display:block;border:1px solid #455474;background:#111a2b;color:#fff;border-radius:8px;padding:9px;font-size:11px}.staff-layout{display:block}.staff-sidebar{display:flex;flex-direction:row;gap:5px;padding:7px;border-right:0;border-bottom:1px solid #243047;overflow:auto}.side-link{padding:9px 11px;font-size:12px;white-space:nowrap}.side-bottom{display:none}.staff-main{padding:14px}.welcome-row h1{font-size:21px}.welcome-row p{font-size:12px}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat-card{padding:11px;min-height:78px;gap:9px}.stat-icon{width:35px;height:35px;font-size:20px}.stat-card b{font-size:20px}.stat-card small{font-size:10px}.panel{padding:13px}.panel-heading h2{font-size:16px}.upload-row{grid-template-columns:1fr}.screenshot-preview{min-height:145px}.request-actions{display:grid;grid-template-columns:1fr 1fr}.request-actions .outline-btn{grid-column:1/-1}.preview-tag{font-size:8px}.welcome-row{gap:8px}}
      `}</style>
    </main>
  );
}
