import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Nav from "../components/Nav";
import {
  BtnGold, BtnOutline, Card, Tag, StatCard, Toast, Divider,
  gold, goldDim, bg, bg2, bg3, text, text2, border, green, red,
} from "../components/ui";

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const TABS = [
  { key:"overview",  icon:"◈", label:"Overview"  },
  { key:"scores",    icon:"◉", label:"Scores"    },
  { key:"draw",      icon:"◎", label:"Draw"      },
  { key:"charity",   icon:"♡", label:"Charity"   },
  { key:"account",   icon:"◇", label:"Account"   },
];

function Sidebar({ active }) {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside style={{ width:220,background:bg2,borderRight:`1px solid ${border}`,display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0 }}>
      <div style={{ padding:"28px 20px",borderBottom:`1px solid ${border}` }}>
        <div style={{ width:44,height:44,borderRadius:"50%",background:"rgba(201,168,76,0.12)",border:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:gold,fontWeight:500,marginBottom:10 }}>
          {user?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div style={{ fontSize:14,fontWeight:500,color:text }}>{user?.name}</div>
        <div style={{ fontSize:11,color:text2,marginTop:2 }}>{user?.plan || "Member"}</div>
        <div style={{ marginTop:8 }}>
          <Tag color={user?.subscriptionActive?"green":"red"}>
            {user?.subscriptionActive?"ACTIVE":"INACTIVE"}
          </Tag>
        </div>
      </div>

      <div style={{ flex:1,paddingTop:8 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => navigate(`/dashboard/${t.key==="overview"?"":t.key}`)} style={{
            display:"flex",alignItems:"center",gap:11,padding:"12px 20px",
            background:active===t.key?"rgba(201,168,76,0.08)":"transparent",
            border:"none",borderLeft:`3px solid ${active===t.key?gold:"transparent"}`,
            color:active===t.key?gold:text2,
            fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
            fontWeight:active===t.key?500:400,transition:"all 0.18s",
            textAlign:"left",width:"100%",letterSpacing:"0.04em",
          }}>
            <span style={{ fontSize:14,flexShrink:0 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 20px",borderTop:`1px solid ${border}` }}>
        <button onClick={logout} style={{ fontSize:11,color:text2,background:"none",border:"none",cursor:"pointer",letterSpacing:"0.08em",transition:"color 0.2s",fontFamily:"'DM Sans',sans-serif",padding:0 }}
          onMouseEnter={e=>e.target.style.color=gold}
          onMouseLeave={e=>e.target.style.color=text2}
        >← Sign Out</button>
      </div>
    </aside>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { user } = useAuth();
  const [data, setData]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/users/me/overview").then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fu">
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:11,letterSpacing:"0.16em",color:gold,marginBottom:6 }}>WELCOME BACK</div>
        <h2 className="disp" style={{ fontSize:36,fontWeight:300 }}>
          Hello, <em style={{ color:gold }}>{user?.name?.split(" ")[0]}</em>
        </h2>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:28 }}>
        <StatCard label="Subscription"   value={user?.plan||"—"}    sub={`Renews ${data?.renewDate||"—"}`} />
        <StatCard label="Scores entered" value={data?.scoreCount??0} sub="Last 5 rolling" />
        <StatCard label="Total won"      value={`£${data?.totalWon||0}`} sub="All time" color={green} />
        <StatCard label="Total donated"  value={`£${data?.totalDonated||0}`} sub={`To ${data?.charity||"—"}`} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:20 }}>
        <Card>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:16 }}>UPCOMING DRAW</div>
          <div className="disp" style={{ fontSize:26,fontWeight:300,marginBottom:4 }}>March 2026</div>
          <div style={{ fontSize:13,color:text2,marginBottom:20 }}>Draw closes 31 Mar 2026 · 20:00 GMT</div>
          <div style={{ fontSize:13,color:text2,marginBottom:8 }}>Your current scores:</div>
          <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:20 }}>
            {(data?.scores||[]).map((s,i) => (
              <div key={i} style={{ width:44,height:44,borderRadius:"50%",border:`1.5px solid ${i===0?gold:border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <span className="disp" style={{ fontSize:18,fontWeight:600,color:i===0?gold:text2 }}>{s}</span>
              </div>
            ))}
            {(data?.scores||[]).length === 0 && <span style={{ fontSize:13,color:text2 }}>No scores yet — add your first round!</span>}
          </div>
          <BtnOutline sm onClick={() => navigate("/dashboard/scores")}>ENTER SCORES</BtnOutline>
        </Card>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:12 }}>YOUR CHARITY</div>
            <div style={{ fontSize:15,fontWeight:500,marginBottom:4 }}>{data?.charity||"Not selected"}</div>
            <div className="disp" style={{ fontSize:26,color:gold,fontWeight:600 }}>£{data?.totalDonated||0}</div>
            <div style={{ fontSize:11,color:text2,marginTop:2 }}>donated all time</div>
          </Card>
          <Card>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:12 }}>SUBSCRIPTION</div>
            <Tag color={user?.subscriptionActive?"green":"red"}>{user?.subscriptionActive?"ACTIVE":"INACTIVE"}</Tag>
            <div style={{ fontSize:13,color:text2,marginTop:10 }}>Renews {data?.renewDate||"—"}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── SCORES TAB ───────────────────────────────────────────────────────────────
function ScoresTab() {
  const [scores, setScores]   = useState([]);
  const [newScore, setNewScore] = useState({ score:"", date:"", course:"" });
  const [errors, setErrors]   = useState({});
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, color = green) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  useEffect(() => {
    api.get("/scores").then(r => setScores(r.data)).catch(()=>{});
  }, []);

  const addScore = async () => {
    const s = parseInt(newScore.score);
    const errs = {};
    if (!s || s < 1 || s > 45) errs.score = "Score must be between 1 and 45.";
    if (!newScore.date)         errs.date  = "Date is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const { data } = await api.post("/scores", { score:s, date:newScore.date, course:newScore.course });
      setScores(data);
      setNewScore({ score:"", date:"", course:"" });
      showToast("Score added successfully.");
    } catch { showToast("Failed to add score.","#E05555"); }
    finally { setLoading(false); }
  };

  const deleteScore = async (id) => {
    try {
      const { data } = await api.delete(`/scores/${id}`);
      setScores(data);
      showToast("Score removed.");
    } catch { showToast("Failed to remove.","#E05555"); }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:11,letterSpacing:"0.16em",color:gold,marginBottom:6 }}>SCORE MANAGEMENT</div>
        <h2 className="disp" style={{ fontSize:36,fontWeight:300 }}>My <em style={{ color:gold }}>Scores</em></h2>
        <p style={{ fontSize:13,color:text2,marginTop:6 }}>Your latest 5 Stableford scores. A new score replaces the oldest.</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
        {/* Add score */}
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:20 }}>ADD NEW SCORE</div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>STABLEFORD SCORE (1–45)</label>
            <input type="number" min="1" max="45" placeholder="e.g. 36"
              value={newScore.score} onChange={e=>setNewScore(s=>({...s,score:e.target.value}))}
              className={errors.score?"err":""} />
            {errors.score && <div style={{ fontSize:11,color:red,marginTop:5 }}>↑ {errors.score}</div>}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>DATE PLAYED</label>
            <input type="date" value={newScore.date} onChange={e=>setNewScore(s=>({...s,date:e.target.value}))} className={errors.date?"err":""} />
            {errors.date && <div style={{ fontSize:11,color:red,marginTop:5 }}>↑ {errors.date}</div>}
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>COURSE (OPTIONAL)</label>
            <input type="text" placeholder="e.g. St Andrews Links" value={newScore.course} onChange={e=>setNewScore(s=>({...s,course:e.target.value}))} />
          </div>
          <BtnGold onClick={addScore} loading={loading} disabled={scores.length>=5&&false} style={{ width:"100%",justifyContent:"center" }}>
            ADD SCORE
          </BtnGold>
          {scores.length === 5 && (
            <div style={{ fontSize:11,color:text2,marginTop:10,textAlign:"center" }}>Max 5 scores stored. Adding a new one replaces the oldest.</div>
          )}
        </Card>

        {/* Scores list */}
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:20 }}>YOUR SCORES</div>
          {scores.length === 0
            ? <div style={{ fontSize:13,color:text2,padding:"20px 0",textAlign:"center" }}>No scores yet. Add your first round!</div>
            : scores.map((s,i) => (
              <div key={s.id} style={{ display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<scores.length-1?`1px solid ${border}`:"none" }}>
                <div style={{ width:48,height:48,borderRadius:"50%",border:`1.5px solid ${i===0?gold:border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span className="disp" style={{ fontSize:20,fontWeight:600,color:i===0?gold:text2 }}>{s.score}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:500 }}>{s.course||"Unknown course"}</div>
                  <div style={{ fontSize:11,color:text2,marginTop:2 }}>{new Date(s.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  {i===0 && <Tag color="gold">LATEST</Tag>}
                  {i===scores.length-1 && scores.length===5 && <Tag color="gray">OLDEST</Tag>}
                  <button onClick={()=>deleteScore(s.id)} style={{ background:"none",border:"none",color:text2,cursor:"pointer",fontSize:16,lineHeight:1,padding:"4px" }}
                    onMouseEnter={e=>e.target.style.color=red}
                    onMouseLeave={e=>e.target.style.color=text2}>×</button>
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    </div>
  );
}

// ─── DRAW TAB ─────────────────────────────────────────────────────────────────
function DrawTab() {
  const [draws, setDraws] = useState([]);

  useEffect(() => {
    api.get("/draws/my-history").then(r => setDraws(r.data)).catch(()=>{});
  }, []);

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:11,letterSpacing:"0.16em",color:gold,marginBottom:6 }}>DRAW HISTORY</div>
        <h2 className="disp" style={{ fontSize:36,fontWeight:300 }}>My <em style={{ color:gold }}>Draws</em></h2>
        <p style={{ fontSize:13,color:text2,marginTop:6 }}>Your participation and results in each monthly draw.</p>
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        {draws.map(d => (
          <Card key={d.month} style={{ padding:"20px 24px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:d.status==="published"?16:0,flexWrap:"wrap",gap:12 }}>
              <div>
                <div style={{ fontSize:15,fontWeight:500,marginBottom:4 }}>{d.month}</div>
                <div style={{ fontSize:12,color:text2 }}>
                  {d.status==="upcoming" ? "Draw not yet run" : d.tier || "No match"}
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                {d.prize > 0 && <span className="disp" style={{ fontSize:22,color:green,fontWeight:600 }}>+£{d.prize.toLocaleString()}</span>}
                <Tag color={d.status==="upcoming"?"gold":d.prize>0?"green":"gray"}>
                  {d.status==="upcoming"?"UPCOMING":d.prize>0?d.tier||"WON":"NO MATCH"}
                </Tag>
              </div>
            </div>
            {d.status==="published" && d.numbers && (
              <div>
                <div style={{ fontSize:10,color:text2,letterSpacing:"0.1em",marginBottom:10 }}>DRAW NUMBERS</div>
                <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:8 }}>
                  {d.numbers.map((n,i) => {
                    const matched = d.matched?.includes(n);
                    return (
                      <div key={i} style={{ width:42,height:42,borderRadius:"50%",border:`1.5px solid ${matched?gold:border}`,display:"flex",alignItems:"center",justifyContent:"center",background:matched?"rgba(201,168,76,0.12)":"transparent" }}>
                        <span className="disp" style={{ fontSize:16,fontWeight:600,color:matched?gold:text2 }}>{n}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize:12,color:text2 }}>
                  {d.matched?.length>0 ? `You matched ${d.matched.length} number${d.matched.length>1?"s":""}: ${d.matched.join(", ")}` : "No numbers matched."}
                </div>
              </div>
            )}
          </Card>
        ))}
        {draws.length===0 && (
          <div style={{ textAlign:"center",padding:"60px 0",color:text2,fontSize:13 }}>No draw history yet. Your first draw result will appear here.</div>
        )}
      </div>

      {/* Winnings summary */}
      <Card style={{ marginTop:24 }}>
        <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:16 }}>WINNINGS SUMMARY</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:14 }}>
          {[
            [draws.filter(d=>d.prize>0).reduce((a,d)=>a+d.prize,0),"£","Total won"],
            [draws.filter(d=>d.prize>0).length,"","Draws won"],
            [draws.length,"","Draws entered"],
          ].map(([v,prefix,l]) => (
            <div key={l} style={{ background:bg,border:`1px solid ${border}`,borderRadius:4,padding:"14px" }}>
              <div style={{ fontSize:10,color:text2,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>{l}</div>
              <div className="disp" style={{ fontSize:24,color:gold,fontWeight:600 }}>{prefix}{typeof v==="number"&&prefix==="£"?v.toLocaleString():v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── CHARITY TAB ──────────────────────────────────────────────────────────────
function CharityTab() {
  const { user, refreshUser } = useAuth();
  const [selected, setSelected] = useState(user?.charity||"");
  const [pct, setPct]           = useState(user?.charityPct||10);
  const [donateAmt, setDonateAmt] = useState("");
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const CHARITIES = ["St Andrews Trust","Green Hearts","Fairway Foundation","Links Legacy","Youth Golf Academy","Disabled Golfers Association","Course Access Fund","Mental Health Outdoors"];

  const showToast = (msg, color=green) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/users/me/charity", { charity:selected, charityPct:pct });
      await refreshUser();
      showToast("Charity settings saved.");
    } catch { showToast("Failed to save.","#E05555"); }
    finally { setSaving(false); }
  };

  const donate = async () => {
    if (!donateAmt || donateAmt <= 0) return;
    try {
      await api.post("/donations/one-off", { amount:Number(donateAmt), charity:selected });
      showToast(`£${donateAmt} donation recorded.`);
      setDonateAmt("");
    } catch { showToast("Donation failed.","#E05555"); }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:11,letterSpacing:"0.16em",color:gold,marginBottom:6 }}>CHARITY</div>
        <h2 className="disp" style={{ fontSize:36,fontWeight:300 }}>Your <em style={{ color:gold }}>Impact</em></h2>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:16 }}>CHOOSE YOUR CHARITY</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
            {CHARITIES.map(c => (
              <div key={c} onClick={()=>setSelected(c)} style={{ padding:"11px 14px",border:`1px solid ${selected===c?gold:border}`,borderRadius:4,cursor:"pointer",background:selected===c?"rgba(201,168,76,0.07)":"transparent",transition:"all 0.18s",display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:15,height:15,borderRadius:"50%",border:`1.5px solid ${selected===c?gold:text2}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:selected===c?gold:"transparent" }}>
                  {selected===c && <div style={{ width:6,height:6,borderRadius:"50%",background:bg }} />}
                </div>
                <span style={{ fontSize:13,color:selected===c?gold:text }}>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10 }}>
              <span style={{ fontSize:13,color:text2 }}>Contribution rate</span>
              <span className="disp" style={{ fontSize:28,color:gold,fontWeight:600 }}>{pct}%</span>
            </div>
            <input type="range" min="10" max="50" step="1" value={pct} onChange={e=>setPct(Number(e.target.value))} style={{ width:"100%",accentColor:gold,marginBottom:6 }} />
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:text2 }}><span>Min 10%</span><span>Max 50%</span></div>
          </div>

          <BtnGold onClick={save} loading={saving} style={{ width:"100%",justifyContent:"center" }}>SAVE SETTINGS</BtnGold>
        </Card>

        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <Card>
            <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:16 }}>YOUR IMPACT</div>
            <div className="disp" style={{ fontSize:40,fontWeight:600,color:gold }}>£{user?.totalDonated||0}</div>
            <div style={{ fontSize:13,color:text2,marginTop:4 }}>donated since you joined</div>
            <Divider style={{ margin:"16px 0" }} />
            <div style={{ fontSize:13,color:text2,lineHeight:1.6 }}>
              To <strong style={{ color:text }}>{selected||"no charity selected"}</strong> · {pct}% monthly
            </div>
          </Card>

          <Card>
            <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:16 }}>ONE-OFF DONATION</div>
            <div style={{ display:"flex",gap:8,marginBottom:12 }}>
              {[5,10,25,50].map(a => (
                <button key={a} onClick={()=>setDonateAmt(a)} style={{ flex:1,padding:"8px 0",border:`1px solid ${donateAmt===a?gold:border}`,background:donateAmt===a?"rgba(201,168,76,0.1)":"transparent",color:donateAmt===a?gold:text2,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",borderRadius:2,transition:"all 0.18s" }}>£{a}</button>
              ))}
            </div>
            <input type="number" placeholder="Or enter amount…" value={donateAmt} onChange={e=>setDonateAmt(Number(e.target.value))} style={{ marginBottom:12 }} />
            <BtnGold onClick={donate} style={{ width:"100%",justifyContent:"center" }}>
              DONATE {donateAmt ? `£${donateAmt}` : "—"}
            </BtnGold>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNT TAB ──────────────────────────────────────────────────────────────
function AccountTab() {
  const { user, refreshUser, logout } = useAuth();
  const [form, setForm]     = useState({ name:user?.name||"", email:user?.email||"" });
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });
  const [notifs, setNotifs] = useState({ drawResults:true, winnerAlerts:true, monthlySummary:true, charityReports:false, platformNews:false });
  const [toast, setToast]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const showToast = (msg, color=green) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  const saveProfile = async () => {
    try {
      await api.put("/users/me", form);
      await refreshUser();
      showToast("Profile updated.");
    } catch { showToast("Failed to save.","#E05555"); }
  };

  const changePw = async () => {
    if (pwForm.next !== pwForm.confirm) { showToast("Passwords do not match.","#E05555"); return; }
    try {
      await api.put("/auth/password", { currentPassword:pwForm.current, newPassword:pwForm.next });
      setPwForm({ current:"", next:"", confirm:"" });
      showToast("Password updated.");
    } catch { showToast("Current password incorrect.","#E05555"); }
  };

  const cancelSubscription = async () => {
    try {
      await api.post("/subscriptions/cancel");
      await refreshUser();
      setCancelling(false);
      showToast("Subscription cancelled. Access continues until end of billing period.");
    } catch { showToast("Failed to cancel.","#E05555"); }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontSize:11,letterSpacing:"0.16em",color:gold,marginBottom:6 }}>ACCOUNT SETTINGS</div>
        <h2 className="disp" style={{ fontSize:36,fontWeight:300 }}>My <em style={{ color:gold }}>Account</em></h2>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
        {/* Profile */}
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>PERSONAL DETAILS</div>
          {[["FULL NAME","name","text"],["EMAIL ADDRESS","email","email"]].map(([l,k,t]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>{l}</label>
              <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <BtnGold onClick={saveProfile} style={{ width:"100%",justifyContent:"center" }}>SAVE CHANGES</BtnGold>
        </Card>

        {/* Password */}
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>CHANGE PASSWORD</div>
          {[["CURRENT PASSWORD","current"],["NEW PASSWORD","next"],["CONFIRM PASSWORD","confirm"]].map(([l,k]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>{l}</label>
              <input type="password" placeholder="••••••••" value={pwForm[k]} onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <BtnOutline onClick={changePw} style={{ width:"100%",justifyContent:"center",marginTop:4 }}>UPDATE PASSWORD</BtnOutline>
        </Card>

        {/* Subscription */}
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>SUBSCRIPTION</div>
          {[["Plan",user?.plan||"—"],["Status",user?.subscriptionActive?"Active":"Inactive"],["Next billing",user?.renewDate||"—"]].map(([k,v]) => (
            <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${border}`,fontSize:13 }}>
              <span style={{ color:text2 }}>{k}</span><span style={{ color:text }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex",gap:10,marginTop:18 }}>
            <BtnOutline sm>UPGRADE PLAN</BtnOutline>
            {user?.subscriptionActive && (
              <button onClick={()=>setCancelling(true)} style={{ background:"transparent",border:"1px solid rgba(224,85,85,0.3)",color:red,padding:"7px 16px",borderRadius:2,fontSize:11,letterSpacing:"0.1em",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>CANCEL</button>
            )}
          </div>
          {cancelling && (
            <div style={{ marginTop:14,padding:"14px",background:"rgba(224,85,85,0.08)",border:"1px solid rgba(224,85,85,0.2)",borderRadius:4 }}>
              <div style={{ fontSize:13,color:red,marginBottom:10 }}>Are you sure? You'll lose access at end of billing period.</div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={cancelSubscription} style={{ background:"transparent",border:"1px solid rgba(224,85,85,0.4)",color:red,padding:"6px 14px",borderRadius:2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>YES, CANCEL</button>
                <button onClick={()=>setCancelling(false)} style={{ background:"rgba(201,168,76,0.1)",border:`1px solid ${border}`,color:gold,padding:"6px 14px",borderRadius:2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>KEEP PLAN</button>
              </div>
            </div>
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <div style={{ fontSize:12,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>NOTIFICATIONS</div>
          {Object.entries(notifs).map(([key, on], i, arr) => {
            const labels = { drawResults:"Draw results published", winnerAlerts:"Winner announcements", monthlySummary:"Monthly summary email", charityReports:"Charity impact reports", platformNews:"Platform news" };
            return (
              <div key={key} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:i<arr.length-1?`1px solid ${border}`:"none" }}>
                <span style={{ fontSize:13,color:text }}>{labels[key]}</span>
                <div onClick={()=>setNotifs(n=>({...n,[key]:!on}))} style={{ width:36,height:20,borderRadius:10,background:on?gold:"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0 }}>
                  <div style={{ position:"absolute",top:2,left:on?18:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ─── DASHBOARD LAYOUT ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const location = useLocation();
  const getActive = () => {
    const p = location.pathname;
    if (p.includes("scores"))  return "scores";
    if (p.includes("draw"))    return "draw";
    if (p.includes("charity")) return "charity";
    if (p.includes("account")) return "account";
    return "overview";
  };

  return (
    <div style={{ display:"flex",minHeight:"100vh",paddingTop:0 }}>
      <Nav />
      <Sidebar active={getActive()} />
      <main style={{ flex:1,padding:"88px 40px 60px",overflowY:"auto",overflowX:"hidden" }}>
        <div style={{ maxWidth:960,margin:"0 auto" }}>
          <Routes>
            <Route index           element={<OverviewTab />} />
            <Route path="scores"   element={<ScoresTab />}   />
            <Route path="draw"     element={<DrawTab />}     />
            <Route path="charity"  element={<CharityTab />}  />
            <Route path="account"  element={<AccountTab />}  />
          </Routes>
        </div>
      </main>
    </div>
  );
}
