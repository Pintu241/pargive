import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Nav from "../components/Nav";
import {
  BtnGold, BtnOutline, Card, Tag, StatCard, SectionHeader, Modal, Toast, Divider,
  gold, goldDim, bg, bg2, bg3, text, text2, border, green, red,
} from "../components/ui";

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key:"overview",   icon:"◈", label:"Overview"    },
  { key:"users",      icon:"◉", label:"Users"       },
  { key:"draw",       icon:"◎", label:"Draw Engine" },
  { key:"charities",  icon:"♡", label:"Charities"   },
  { key:"winners",    icon:"◆", label:"Winners"     },
  { key:"reports",    icon:"◇", label:"Reports"     },
];

function Sidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside style={{ width:228,background:bg2,borderRight:`1px solid ${border}`,display:"flex",flexDirection:"column",minHeight:"100vh",flexShrink:0 }}>
      <div style={{ padding:"28px 20px 20px",borderBottom:`1px solid ${border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:12 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",border:`1.5px solid ${gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:gold }}>◇</div>
          <span className="disp" style={{ fontSize:18 }}>Par<em style={{ color:gold }}>Give</em></span>
        </div>
        <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(201,168,76,0.1)",border:`1px solid rgba(201,168,76,0.2)`,borderRadius:2,padding:"3px 9px" }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:green,display:"inline-block" }} />
          <span style={{ fontSize:10,color:gold,letterSpacing:"0.1em",fontWeight:500 }}>ADMIN PANEL</span>
        </div>
      </div>

      <div style={{ flex:1,paddingTop:8 }}>
        {NAV_ITEMS.map(({ key, icon, label }) => (
          <button key={key} onClick={() => navigate(`/admin/${key==="overview"?"":key}`)} style={{
            display:"flex",alignItems:"center",gap:11,padding:"12px 20px",
            background:active===key?"rgba(201,168,76,0.08)":"transparent",
            border:"none",borderLeft:`3px solid ${active===key?gold:"transparent"}`,
            color:active===key?gold:text2,
            fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
            fontWeight:active===key?500:400,transition:"all 0.18s",
            textAlign:"left",width:"100%",letterSpacing:"0.04em",
          }}>
            <span style={{ fontSize:14,flexShrink:0 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 20px",borderTop:`1px solid ${border}` }}>
        <button onClick={logout} style={{ fontSize:11,color:text2,background:"none",border:"none",cursor:"pointer",letterSpacing:"0.08em",fontFamily:"'DM Sans',sans-serif",padding:0,transition:"color 0.2s" }}
          onMouseEnter={e=>e.target.style.color=gold}
          onMouseLeave={e=>e.target.style.color=text2}
        >← Sign Out</button>
      </div>
    </aside>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/overview").then(r => setStats(r.data)).catch(()=>{});
  }, []);

  return (
    <div className="fu">
      <SectionHeader label="ADMIN OVERVIEW" title="Platform" accent="Dashboard" />

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28 }}>
        <StatCard label="Total Users"      value={stats?.totalUsers??"—"}     sub={`${stats?.activeUsers??0} active`} />
        <StatCard label="Current Prize Pool" value={stats?.currentPool??"—"}  sub="This month" />
        <StatCard label="Total Donated"    value={stats?.totalDonated??"—"}   sub="All time" />
        <StatCard label="Draw Status"      value={stats?.daysUntilDraw??"—"}  sub="Days until next draw" color={text} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:20,marginBottom:20 }}>
        <Card style={{ padding:0,overflow:"hidden" }}>
          <div style={{ padding:"18px 24px 14px",borderBottom:`1px solid ${border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em" }}>RECENT USERS</div>
            <button onClick={()=>navigate("/admin/users")} style={{ fontSize:11,color:gold,background:"none",border:"none",cursor:"pointer",letterSpacing:"0.08em",fontFamily:"'DM Sans',sans-serif" }}>VIEW ALL →</button>
          </div>
          <table>
            <thead><tr><th style={{ paddingLeft:24 }}>USER</th><th>PLAN</th><th style={{ paddingRight:24 }}>STATUS</th></tr></thead>
            <tbody>
              {(stats?.recentUsers||[]).map(u => (
                <tr key={u.id}>
                  <td style={{ paddingLeft:24 }}>
                    <div style={{ fontWeight:500 }}>{u.name}</div>
                    <div style={{ fontSize:11,color:text2,marginTop:2 }}>{u.email}</div>
                  </td>
                  <td style={{ color:text2 }}>{u.plan}</td>
                  <td style={{ paddingRight:24 }}><Tag color={u.status==="active"?"green":u.status==="lapsed"?"gold":"red"}>{u.status}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:14 }}>DRAW ENGINE</div>
            <div className="disp" style={{ fontSize:22,marginBottom:4 }}>{stats?.nextDrawMonth||"—"}</div>
            <div style={{ fontSize:13,color:text2,marginBottom:18 }}>Draw pending · {stats?.nextDrawDate||"—"}</div>
            <div style={{ display:"flex",gap:10 }}>
              <BtnGold sm onClick={()=>navigate("/admin/draw")}>OPEN ENGINE</BtnGold>
              <BtnOutline sm onClick={()=>navigate("/admin/draw")}>SIMULATE</BtnOutline>
            </div>
          </Card>
          <Card>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:14 }}>PENDING WINNERS</div>
            <div className="disp" style={{ fontSize:32,fontWeight:600,color:gold }}>{stats?.pendingWinners??0}</div>
            <div style={{ fontSize:12,color:text2,marginTop:4,marginBottom:16 }}>awaiting review or payout</div>
            <BtnOutline sm onClick={()=>navigate("/admin/winners")}>REVIEW WINNERS</BtnOutline>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [editScores, setEditScores] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, color=green) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  useEffect(() => {
    api.get("/admin/users").then(r => setUsers(r.data)).catch(()=>{});
  }, []);

  const updateUser = async (id, changes) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}`, changes);
      setUsers(us => us.map(u => u.id===id ? data : u));
      showToast("User updated.");
    } catch { showToast("Update failed.","#E05555"); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || u.status===filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="fu">
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <SectionHeader label="USER MANAGEMENT" title="Members &" accent="Subscriptions" />

      {/* Toolbar */}
      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
        <input placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280,marginBottom:0 }} />
        <div style={{ display:"flex",gap:8 }}>
          {["all","active","lapsed","cancelled"].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"8px 16px",border:`1px solid ${filter===f?gold:border}`,background:filter===f?"rgba(201,168,76,0.1)":"transparent",color:filter===f?gold:text2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",borderRadius:2,letterSpacing:"0.08em",textTransform:"capitalize",transition:"all 0.18s" }}>{f}</button>
          ))}
        </div>
      </div>

      <Card style={{ padding:0,overflow:"hidden" }}>
        <table>
          <thead><tr>
            <th style={{ paddingLeft:24 }}>USER</th><th>PLAN</th><th>STATUS</th>
            <th>CHARITY %</th><th>DONATED</th><th>WON</th>
            <th style={{ paddingRight:24 }}>ACTIONS</th>
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{ paddingLeft:24 }}>
                  <div style={{ fontWeight:500 }}>{u.name}</div>
                  <div style={{ fontSize:11,color:text2,marginTop:2 }}>{u.email}</div>
                </td>
                <td style={{ color:text2 }}>{u.plan}</td>
                <td><Tag color={u.status==="active"?"green":u.status==="lapsed"?"gold":"red"}>{u.status}</Tag></td>
                <td style={{ color:gold }}>{u.charityPct}%</td>
                <td style={{ color:text2 }}>£{u.totalDonated?.toLocaleString()}</td>
                <td style={{ color:text2 }}>£{u.totalWon?.toLocaleString()}</td>
                <td style={{ paddingRight:24 }}>
                  <div style={{ display:"flex",gap:8 }}>
                    <BtnOutline sm onClick={()=>setSelected(u)}>EDIT</BtnOutline>
                    <BtnOutline sm onClick={()=>setEditScores(u)}>SCORES</BtnOutline>
                    {u.status==="active" && (
                      <button onClick={()=>setConfirm(u)} style={{ background:"transparent",border:"1px solid rgba(224,85,85,0.3)",color:red,padding:"6px 12px",borderRadius:2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em" }}>CANCEL</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Edit user modal */}
      {selected && (
        <Modal title="Edit User" onClose={()=>setSelected(null)}>
          <EditUserForm user={selected}
            onSave={async (changes) => { await updateUser(selected.id, changes); setSelected(null); }}
            onClose={()=>setSelected(null)} />
        </Modal>
      )}

      {/* Edit scores modal */}
      {editScores && (
        <Modal title={`Scores — ${editScores.name}`} onClose={()=>setEditScores(null)}>
          <EditScoresForm user={editScores}
            onSave={async (scores) => { await updateUser(editScores.id, { scores }); setEditScores(null); }}
            onClose={()=>setEditScores(null)} />
        </Modal>
      )}

      {/* Cancel confirm */}
      {confirm && (
        <Modal title="Cancel Subscription" onClose={()=>setConfirm(null)}>
          <p style={{ fontSize:14,color:text2,lineHeight:1.7,marginBottom:24 }}>
            Cancel <span style={{ color:text }}>{confirm.name}'s</span> subscription? They'll lose access at end of billing period.
          </p>
          <div style={{ display:"flex",gap:10 }}>
            <BtnOutline danger onClick={async ()=>{ await updateUser(confirm.id,{status:"cancelled"}); setConfirm(null); }}>YES, CANCEL</BtnOutline>
            <BtnOutline onClick={()=>setConfirm(null)}>KEEP ACTIVE</BtnOutline>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EditUserForm({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name:user.name, email:user.email, plan:user.plan, charityPct:user.charityPct });
  return (
    <div>
      {[["FULL NAME","name","text"],["EMAIL ADDRESS","email","email"]].map(([l,k,t]) => (
        <div key={k} style={{ marginBottom:14 }}>
          <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>{l}</label>
          <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
        </div>
      ))}
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>PLAN</label>
        <select value={form.plan} onChange={e=>setForm(f=>({...f,plan:e.target.value}))}>
          <option>Contender</option><option>Champion</option>
        </select>
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>CHARITY CONTRIBUTION %</label>
        <input type="number" min="10" max="50" value={form.charityPct} onChange={e=>setForm(f=>({...f,charityPct:Number(e.target.value)}))} />
      </div>
      <Divider style={{ marginBottom:20 }} />
      <div style={{ display:"flex",gap:10 }}>
        <BtnGold onClick={()=>onSave(form)} style={{ flex:1,justifyContent:"center" }}>SAVE CHANGES</BtnGold>
        <BtnOutline onClick={onClose}>CANCEL</BtnOutline>
      </div>
    </div>
  );
}

function EditScoresForm({ user, onSave, onClose }) {
  const [scores, setScores] = useState((user.scores||[]).map((s,i)=>({ id:i, score:s })));
  const [newScore, setNewScore] = useState("");

  const addScore = () => {
    const s = parseInt(newScore);
    if (!s || s<1 || s>45) return;
    setScores([{ id:Date.now(), score:s }, ...scores].slice(0,5));
    setNewScore("");
  };

  return (
    <div>
      <p style={{ fontSize:13,color:text2,lineHeight:1.6,marginBottom:18 }}>Only the last 5 Stableford scores are stored. Range: 1–45.</p>
      <div style={{ display:"flex",gap:8,marginBottom:18 }}>
        <input type="number" min="1" max="45" placeholder="Add score (1–45)" value={newScore}
          onChange={e=>setNewScore(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&addScore()} />
        <BtnGold sm onClick={addScore} disabled={scores.length>=5}>ADD</BtnGold>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:24 }}>
        {scores.length===0 && <div style={{ fontSize:13,color:text2,padding:"12px 0" }}>No scores.</div>}
        {scores.map((s,i) => (
          <div key={s.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:bg,border:`1px solid ${border}`,borderRadius:4 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",border:`1.5px solid ${i===0?gold:border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <span className="disp" style={{ fontSize:16,fontWeight:600,color:i===0?gold:text2 }}>{s.score}</span>
            </div>
            <span style={{ flex:1,fontSize:13,color:text2 }}>{i===0?"Latest":i===scores.length-1&&scores.length===5?"Oldest (replaced next)":  `Score ${i+1}`}</span>
            <button onClick={()=>setScores(scores.filter(x=>x.id!==s.id))} style={{ background:"none",border:"none",color:red,cursor:"pointer",fontSize:16,lineHeight:1 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:10 }}>
        <BtnGold onClick={()=>onSave(scores.map(s=>s.score))} style={{ flex:1,justifyContent:"center" }}>SAVE SCORES</BtnGold>
        <BtnOutline onClick={onClose}>CANCEL</BtnOutline>
      </div>
    </div>
  );
}

// ─── DRAW ENGINE TAB ──────────────────────────────────────────────────────────
function DrawTab() {
  const [draws, setDraws]         = useState([]);
  const [mode, setMode]           = useState("random");
  const [simResult, setSimResult] = useState(null);
  const [simRunning, setSimRunning] = useState(false);
  const [revealed, setRevealed]   = useState([]);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, color=green) => { setToast({msg,color}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    api.get("/admin/draws").then(r => setDraws(r.data)).catch(()=>{});
  }, []);

  const runSimulation = async () => {
    if (simRunning) return;
    setSimRunning(true); setSimResult(null); setRevealed([]);
    try {
      const { data } = await api.post("/admin/draws/simulate", { mode });
      data.numbers.forEach((_,i) => {
        setTimeout(() => {
          setRevealed(r => [...r, i]);
          if (i === data.numbers.length-1) { setSimResult(data.numbers); setSimRunning(false); }
        }, 500*(i+1));
      });
    } catch {
      setSimRunning(false);
      showToast("Simulation failed.","#E05555");
    }
  };

  const publishDraw = async () => {
    if (!simResult) return;
    try {
      await api.post("/admin/draws/publish", { numbers:simResult, mode });
      const { data } = await api.get("/admin/draws");
      setDraws(data);
      setSimResult(null); setRevealed([]); setPublishConfirm(false);
      showToast("Draw published. Winners identified and notified.");
    } catch { showToast("Publish failed.","#E05555"); }
  };

  const pending = draws.find(d=>d.status==="pending")||draws[0];

  return (
    <div className="fu">
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <SectionHeader label="DRAW MANAGEMENT" title="Draw" accent="Engine" />

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        {/* Config */}
        <Card>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>CURRENT DRAW — {pending?.month?.toUpperCase()||"—"}</div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13 }}>
            <span style={{ color:text2 }}>Status</span>
            <Tag color="gold">{pending?.status?.toUpperCase()||"—"}</Tag>
          </div>
          {[["Jackpot (5-match)",`£${pending?.jackpot?.toLocaleString()||0}`],["4-match pool",`£${pending?.pool4?.toLocaleString()||0}`],["3-match pool",`£${pending?.pool3?.toLocaleString()||0}`]].map(([k,v]) => (
            <div key={k} style={{ display:"flex",justifyContent:"space-between",fontSize:13,padding:"9px 0",borderBottom:`1px solid ${border}` }}>
              <span style={{ color:text2 }}>{k}</span><span style={{ color:gold }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.08em",marginBottom:10 }}>DRAW MODE</div>
            <div style={{ display:"flex",gap:8 }}>
              {["random","algorithmic"].map(m => (
                <button key={m} onClick={()=>setMode(m)} style={{ flex:1,padding:"9px 0",border:`1px solid ${mode===m?gold:border}`,background:mode===m?"rgba(201,168,76,0.1)":"transparent",color:mode===m?gold:text2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",borderRadius:2,letterSpacing:"0.08em",textTransform:"uppercase",transition:"all 0.18s" }}>{m}</button>
              ))}
            </div>
            <div style={{ fontSize:11,color:text2,marginTop:8,lineHeight:1.6 }}>
              {mode==="random" ? "Standard lottery-style random generation (1–45)." : "Algorithmic: weighted by most/least frequent user scores."}
            </div>
          </div>
        </Card>

        {/* Simulation */}
        <Card>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>SIMULATION & PUBLISH</div>
          <div style={{ display:"flex",gap:12,justifyContent:"center",marginBottom:24,flexWrap:"wrap" }}>
            {Array.from({length:5}).map((_,i) => (
              <div key={i} style={{
                width:64,height:64,borderRadius:"50%",
                border:`2px solid ${revealed.includes(i)?gold:"rgba(201,168,76,0.18)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:revealed.includes(i)?"rgba(201,168,76,0.12)":"transparent",
                transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                transform:revealed.includes(i)?"scale(1.1)":"scale(1)",
              }}>
                <span className="disp" style={{ fontSize:22,fontWeight:600,color:revealed.includes(i)?gold:"rgba(201,168,76,0.22)",transition:"color 0.3s" }}>
                  {revealed.includes(i)&&simResult ? simResult[i] : "?"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex",gap:10,marginBottom:12 }}>
            <BtnGold onClick={runSimulation} disabled={simRunning} style={{ flex:1,justifyContent:"center" }}>
              {simRunning ? "DRAWING…" : "RUN SIMULATION"}
            </BtnGold>
            {simResult && !simRunning && (
              <BtnGold onClick={()=>setPublishConfirm(true)} style={{ background:green,flex:1,justifyContent:"center" }}>
                PUBLISH DRAW
              </BtnGold>
            )}
          </div>

          {simResult && !simRunning && (
            <div style={{ padding:"12px 14px",background:"rgba(29,158,117,0.08)",border:"1px solid rgba(29,158,117,0.2)",borderRadius:4 }}>
              <div style={{ fontSize:11,color:green,letterSpacing:"0.1em",marginBottom:6 }}>SIMULATION COMPLETE</div>
              <div style={{ fontSize:13,color:text2 }}>Numbers: <span style={{ color:text }}>{simResult.join(", ")}</span></div>
              <div style={{ fontSize:11,color:text2,marginTop:4 }}>Confirm and publish to make official and notify users.</div>
            </div>
          )}
        </Card>
      </div>

      {/* Draw history */}
      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"18px 24px 14px",borderBottom:`1px solid ${border}` }}>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em" }}>DRAW HISTORY</div>
        </div>
        <table>
          <thead><tr><th style={{ paddingLeft:24 }}>MONTH</th><th>STATUS</th><th>NUMBERS</th><th>JACKPOT</th><th>5-MATCH</th><th>4-MATCH</th><th style={{ paddingRight:24 }}>3-MATCH</th></tr></thead>
          <tbody>
            {draws.map(d => (
              <tr key={d.id}>
                <td style={{ paddingLeft:24,fontWeight:500 }}>{d.month}</td>
                <td><Tag color={d.status==="published"?"green":"gold"}>{d.status}</Tag></td>
                <td style={{ color:text2,fontFamily:"monospace" }}>{d.numbers?.join(", ")||"—"}</td>
                <td style={{ color:gold }}>£{d.jackpot?.toLocaleString()||0}</td>
                <td style={{ color:d.winners5>0?green:text2 }}>{d.winners5??0}</td>
                <td style={{ color:d.winners4>0?gold:text2 }}>{d.winners4??0}</td>
                <td style={{ paddingRight:24,color:text2 }}>{d.winners3??0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Publish confirm modal */}
      {publishConfirm && (
        <Modal title="Publish Draw Results" onClose={()=>setPublishConfirm(false)}>
          <p style={{ fontSize:14,color:text2,lineHeight:1.7,marginBottom:12 }}>
            You are about to publish the draw with numbers: <strong style={{ color:text }}>{simResult?.join(", ")}</strong>.
          </p>
          <p style={{ fontSize:13,color:text2,lineHeight:1.7,marginBottom:24 }}>
            This will identify all winners, calculate prize splits, update payout states, and send email notifications. This action cannot be undone.
          </p>
          <div style={{ display:"flex",gap:10 }}>
            <BtnGold onClick={publishDraw} style={{ flex:1,justifyContent:"center",background:green }}>CONFIRM & PUBLISH</BtnGold>
            <BtnOutline onClick={()=>setPublishConfirm(false)}>CANCEL</BtnOutline>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CHARITIES TAB ────────────────────────────────────────────────────────────
function CharitiesTab() {
  const [charities, setCharities] = useState([]);
  const [showAdd, setShowAdd]     = useState(false);
  const [editing, setEditing]     = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, color=green) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  useEffect(() => {
    api.get("/admin/charities").then(r => setCharities(r.data)).catch(()=>{});
  }, []);

  const saveCharity = async (data, id) => {
    try {
      if (id) {
        const { data: updated } = await api.patch(`/admin/charities/${id}`, data);
        setCharities(cs => cs.map(c => c.id===id ? updated : c));
      } else {
        const { data: created } = await api.post("/admin/charities", data);
        setCharities(cs => [...cs, created]);
      }
      setShowAdd(false); setEditing(null);
      showToast(id ? "Charity updated." : "Charity added.");
    } catch { showToast("Failed to save.","#E05555"); }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await api.patch(`/admin/charities/${id}/toggle`);
      setCharities(cs => cs.map(c => c.id===id ? data : c));
    } catch { showToast("Failed.","#E05555"); }
  };

  const deleteCharity = async (id) => {
    try {
      await api.delete(`/admin/charities/${id}`);
      setCharities(cs => cs.filter(c => c.id!==id));
      showToast("Charity removed.");
    } catch { showToast("Failed to delete.","#E05555"); }
  };

  return (
    <div className="fu">
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:16 }}>
        <SectionHeader label="CHARITY MANAGEMENT" title="Charities &" accent="Impact" />
        <BtnGold sm onClick={()=>setShowAdd(true)}>+ ADD CHARITY</BtnGold>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16 }}>
        {charities.map(c => (
          <Card key={c.id}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
              <div>
                <div style={{ fontSize:15,fontWeight:500,marginBottom:4 }}>{c.name}</div>
                <div style={{ fontSize:11,color:text2,letterSpacing:"0.08em",textTransform:"uppercase" }}>{c.category}</div>
              </div>
              <Tag color={c.active?"green":"gray"}>{c.active?"ACTIVE":"INACTIVE"}</Tag>
            </div>
            {c.description && <p style={{ fontSize:12,color:text2,lineHeight:1.6,marginBottom:14 }}>{c.description}</p>}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
              <div style={{ background:bg,border:`1px solid ${border}`,borderRadius:4,padding:"10px 12px" }}>
                <div style={{ fontSize:10,color:text2,letterSpacing:"0.08em" }}>SUBSCRIBERS</div>
                <div className="disp" style={{ fontSize:22,color:gold,fontWeight:600,marginTop:2 }}>{c.subscribers||0}</div>
              </div>
              <div style={{ background:bg,border:`1px solid ${border}`,borderRadius:4,padding:"10px 12px" }}>
                <div style={{ fontSize:10,color:text2,letterSpacing:"0.08em" }}>TOTAL RECEIVED</div>
                <div className="disp" style={{ fontSize:22,color:gold,fontWeight:600,marginTop:2 }}>£{(c.totalReceived||0).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <BtnOutline sm onClick={()=>setEditing(c)} style={{ flex:1,justifyContent:"center" }}>EDIT</BtnOutline>
              <button onClick={()=>toggleActive(c.id)} style={{ flex:1,padding:"6px 10px",borderRadius:2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em",background:"transparent",transition:"all 0.18s",border:`1px solid ${c.active?"rgba(224,85,85,0.3)":"rgba(29,158,117,0.3)"}`,color:c.active?red:green }}>
                {c.active?"DEACTIVATE":"ACTIVATE"}
              </button>
              <button onClick={()=>deleteCharity(c.id)} style={{ background:"transparent",border:"1px solid rgba(224,85,85,0.2)",color:red,padding:"6px 12px",borderRadius:2,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>✕</button>
            </div>
          </Card>
        ))}
      </div>

      {(showAdd||editing) && (
        <Modal title={editing?`Edit — ${editing.name}`:"Add New Charity"} onClose={()=>{ setShowAdd(false); setEditing(null); }}>
          <CharityForm charity={editing} onSave={(data)=>saveCharity(data,editing?.id)} onClose={()=>{ setShowAdd(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

function CharityForm({ charity, onSave, onClose }) {
  const [form, setForm] = useState({ name:charity?.name||"", category:charity?.category||"", description:charity?.description||"" });
  return (
    <div>
      {[["CHARITY NAME","name","text"],["CATEGORY","category","text"]].map(([l,k,t]) => (
        <div key={k} style={{ marginBottom:14 }}>
          <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>{l}</label>
          <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
        </div>
      ))}
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:11,color:text2,display:"block",marginBottom:6,letterSpacing:"0.08em" }}>DESCRIPTION</label>
        <textarea rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
      </div>
      <div style={{ display:"flex",gap:10 }}>
        <BtnGold onClick={()=>onSave(form)} disabled={!form.name.trim()} style={{ flex:1,justifyContent:"center" }}>SAVE CHARITY</BtnGold>
        <BtnOutline onClick={onClose}>CANCEL</BtnOutline>
      </div>
    </div>
  );
}

// ─── WINNERS TAB ──────────────────────────────────────────────────────────────
function WinnersTab() {
  const [winners, setWinners] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, color=green) => { setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  useEffect(() => {
    api.get("/admin/winners").then(r => setWinners(r.data)).catch(()=>{});
  }, []);

  const approve = async (id) => {
    try {
      const { data } = await api.patch(`/admin/winners/${id}`, { status:"pending" });
      setWinners(ws => ws.map(w => w.id===id ? data : w));
      setSelected(null);
      showToast("Winner approved. Payout is now pending.");
    } catch { showToast("Failed.","#E05555"); }
  };

  const reject = async (id) => {
    try {
      const { data } = await api.patch(`/admin/winners/${id}`, { status:"rejected" });
      setWinners(ws => ws.map(w => w.id===id ? data : w));
      setSelected(null);
      showToast("Submission rejected.","#E05555");
    } catch { showToast("Failed.","#E05555"); }
  };

  const markPaid = async (id) => {
    try {
      const { data } = await api.patch(`/admin/winners/${id}`, { status:"paid" });
      setWinners(ws => ws.map(w => w.id===id ? data : w));
      showToast("Payout marked complete.");
    } catch { showToast("Failed.","#E05555"); }
  };

  const statusColor = s => ({ paid:"green", pending:"gold", review:"gray", rejected:"red" }[s]||"gray");

  return (
    <div className="fu">
      {toast && <Toast msg={toast.msg} color={toast.color} />}
      <SectionHeader label="WINNERS MANAGEMENT" title="Verification &" accent="Payouts" />

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
        {[["Review",winners.filter(w=>w.status==="review").length,text2],["Pending payout",winners.filter(w=>w.status==="pending").length,gold],["Paid",winners.filter(w=>w.status==="paid").length,green],["Rejected",winners.filter(w=>w.status==="rejected").length,red]].map(([l,v,c]) => (
          <StatCard key={l} label={l} value={v} color={c} />
        ))}
      </div>

      <Card style={{ padding:0,overflow:"hidden" }}>
        <table>
          <thead><tr>
            <th style={{ paddingLeft:24 }}>WINNER</th><th>DRAW</th><th>TIER</th>
            <th>PRIZE</th><th>PROOF</th><th>STATUS</th>
            <th style={{ paddingRight:24 }}>ACTIONS</th>
          </tr></thead>
          <tbody>
            {winners.map(w => (
              <tr key={w.id}>
                <td style={{ paddingLeft:24,fontWeight:500 }}>{w.userName}</td>
                <td style={{ color:text2 }}>{w.drawMonth}</td>
                <td><Tag color={w.tier==="5-match"?"green":w.tier==="4-match"?"gold":"gray"}>{w.tier}</Tag></td>
                <td style={{ color:gold }}>£{w.prize?.toLocaleString()}</td>
                <td>{w.proofUrl ? <span style={{ fontSize:11,color:green }}>✓ Submitted</span> : <span style={{ fontSize:11,color:text2 }}>Pending</span>}</td>
                <td><Tag color={statusColor(w.status)}>{w.status}</Tag></td>
                <td style={{ paddingRight:24 }}>
                  <div style={{ display:"flex",gap:8 }}>
                    {w.status==="review" && <BtnOutline sm onClick={()=>setSelected(w)}>REVIEW</BtnOutline>}
                    {w.status==="pending" && <BtnGold sm onClick={()=>markPaid(w.id)}>MARK PAID</BtnGold>}
                    {(w.status==="paid"||w.status==="rejected") && <span style={{ fontSize:11,color:text2,letterSpacing:"0.06em" }}>{w.status==="paid"?"Complete":"Rejected"}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected && (
        <Modal title={`Review — ${selected.userName}`} onClose={()=>setSelected(null)}>
          <div style={{ marginBottom:20 }}>
            {[["Draw month",selected.drawMonth],["Prize tier",selected.tier],["Prize amount",`£${selected.prize?.toLocaleString()}`],["Submitted",selected.submittedAt||"—"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${border}`,fontSize:13 }}>
                <span style={{ color:text2 }}>{k}</span>
                <span style={{ color:text }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11,color:text2,letterSpacing:"0.08em",marginBottom:10 }}>PROOF OF SCORES</div>
            {selected.proofUrl ? (
              <div style={{ padding:"20px",background:bg,border:`1px solid ${border}`,borderRadius:4,textAlign:"center" }}>
                <div style={{ fontSize:32,marginBottom:8 }}>📎</div>
                <div style={{ fontSize:13,color:gold }}>{selected.proofUrl}</div>
                <div style={{ fontSize:11,color:text2,marginTop:4 }}>Screenshot uploaded by user</div>
              </div>
            ) : (
              <div style={{ padding:"14px",background:"rgba(224,85,85,0.08)",border:"1px solid rgba(224,85,85,0.2)",borderRadius:4 }}>
                <div style={{ fontSize:13,color:red }}>No proof submitted yet.</div>
              </div>
            )}
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <BtnGold onClick={()=>approve(selected.id)} style={{ flex:1,justifyContent:"center" }} disabled={!selected.proofUrl}>APPROVE</BtnGold>
            <BtnOutline danger onClick={()=>reject(selected.id)} style={{ flex:1,justifyContent:"center" }}>REJECT</BtnOutline>
          </div>
          {!selected.proofUrl && <div style={{ fontSize:11,color:text2,marginTop:8,textAlign:"center" }}>Cannot approve until proof is submitted.</div>}
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS TAB ──────────────────────────────────────────────────────────────
function ReportsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/reports").then(r => setData(r.data)).catch(()=>{});
  }, []);

  if (!data) return <div style={{ color:text2,padding:"60px 0",textAlign:"center" }}>Loading reports…</div>;

  const barMax = Math.max(...(data.charityBreakdown||[]).map(c=>c.totalReceived), 1);

  return (
    <div className="fu">
      <SectionHeader label="REPORTS & ANALYTICS" title="Platform" accent="Insights" />

      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24 }}>
        <StatCard label="Total Users"           value={data.totalUsers}              sub={`${data.activeUsers} active`} />
        <StatCard label="Total Prize Pool"      value={`£${(data.totalPool/1000).toFixed(0)}K`} sub="Across all draws" />
        <StatCard label="Total Charity Donated" value={`£${data.totalDonated?.toLocaleString()}`} sub="All time" />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        <Card>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>SUBSCRIPTION BREAKDOWN</div>
          {[["Active",data.activeUsers,green],["Lapsed",data.lapsedUsers,gold],["Cancelled",data.cancelledUsers,red]].map(([l,v,c]) => (
            <div key={l} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13 }}>
                <span style={{ color:text2 }}>{l}</span>
                <span style={{ color:c,fontWeight:500 }}>{v} ({Math.round(v/data.totalUsers*100)}%)</span>
              </div>
              <div style={{ height:4,background:"rgba(255,255,255,0.05)",borderRadius:2 }}>
                <div style={{ width:`${v/data.totalUsers*100}%`,height:"100%",background:c,borderRadius:2,transition:"width 1s ease" }} />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>DRAW STATISTICS</div>
          {[["Draws run",data.drawsRun],["5-match winners (all time)",data.winners5],["4-match winners (all time)",data.winners4],["3-match winners (all time)",data.winners3],["Total paid out",`£${data.totalPaidOut?.toLocaleString()}`],["Current jackpot",`£${data.currentJackpot?.toLocaleString()}`]].map(([k,v]) => (
            <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${border}`,fontSize:13 }}>
              <span style={{ color:text2 }}>{k}</span>
              <span style={{ color:gold }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:18 }}>CHARITY CONTRIBUTION BREAKDOWN</div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {(data.charityBreakdown||[]).sort((a,b)=>b.totalReceived-a.totalReceived).map(c => (
            <div key={c.name}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13 }}>
                <span style={{ color:text }}>{c.name}</span>
                <span style={{ color:gold }}>£{c.totalReceived?.toLocaleString()}</span>
              </div>
              <div style={{ height:5,background:"rgba(255,255,255,0.05)",borderRadius:2 }}>
                <div style={{ width:`${c.totalReceived/barMax*100}%`,height:"100%",background:`linear-gradient(90deg,${gold},${goldDim})`,borderRadius:2,transition:"width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const location = useLocation();
  const getActive = () => {
    const p = location.pathname;
    if (p.includes("users"))     return "users";
    if (p.includes("draw"))      return "draw";
    if (p.includes("charities")) return "charities";
    if (p.includes("winners"))   return "winners";
    if (p.includes("reports"))   return "reports";
    return "overview";
  };

  return (
    <div style={{ display:"flex",minHeight:"100vh" }}>
      <Sidebar active={getActive()} />
      <main style={{ flex:1,padding:"48px 44px 60px",overflowY:"auto",overflowX:"hidden",background:bg }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <Routes>
            <Route index             element={<OverviewTab />}   />
            <Route path="users"      element={<UsersTab />}      />
            <Route path="draw"       element={<DrawTab />}       />
            <Route path="charities"  element={<CharitiesTab />}  />
            <Route path="winners"    element={<WinnersTab />}    />
            <Route path="reports"    element={<ReportsTab />}    />
          </Routes>
        </div>
      </main>
    </div>
  );
}
