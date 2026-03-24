import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import {
  BtnGold, BtnOutline,
  gold, goldLight, goldDim, bg, bg2, bg3, text, text2, border,
} from "../components/ui";

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      padding: "140px 24px 80px",
      textAlign: "center",
    }}>
      {/* Decorative glows */}
      <div style={{ position:"absolute",top:"32%",left:"50%",transform:"translate(-50%,-50%)",width:680,height:680,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)",pointerEvents:"none"}} />
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:510,height:510,borderRadius:"50%",border:"1px solid rgba(201,168,76,0.08)",pointerEvents:"none"}} />
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:710,height:710,borderRadius:"50%",border:"1px solid rgba(201,168,76,0.04)",pointerEvents:"none"}} />

      <div className="fi" style={{ animationDelay:"0.1s",marginBottom:22,display:"flex",alignItems:"center",gap:12,justifyContent:"center",fontSize:11,letterSpacing:"0.22em",color:gold,fontWeight:500}}>
        <span style={{ display:"inline-block",width:32,height:1,background:gold,opacity:0.6 }} />
        Golf · Giving · Glory
        <span style={{ display:"inline-block",width:32,height:1,background:gold,opacity:0.6 }} />
      </div>

      <h1 className="disp fu" style={{ fontSize:"clamp(50px,8vw,94px)",fontWeight:300,lineHeight:1.05,animationDelay:"0.2s",maxWidth:860,color:text }}>
        Play your game.<br />
        <em className="shimmer" style={{ fontStyle:"italic" }}>Change someone's life.</em>
      </h1>

      <p className="fu" style={{ animationDelay:"0.38s",marginTop:28,fontSize:16,color:text2,fontWeight:300,maxWidth:500,lineHeight:1.75 }}>
        A subscription platform where every round you play enters a monthly prize draw — and a portion of every membership funds a charity you believe in.
      </p>

      <div className="fu" style={{ animationDelay:"0.52s",display:"flex",gap:14,marginTop:44,flexWrap:"wrap",justifyContent:"center" }}>
        <BtnGold onClick={() => navigate("/subscribe")}>START PLAYING</BtnGold>
        <BtnOutline onClick={() => {}}>WATCH HOW IT WORKS</BtnOutline>
      </div>

      {/* Stats bar */}
      <div className="fu" style={{ animationDelay:"0.68s",marginTop:72,display:"flex",border:`1px solid ${border}`,borderRadius:2,overflow:"hidden",flexWrap:"wrap",justifyContent:"center" }}>
        {[["£2.4M+","Donated to charity"],["18,000+","Active subscribers"],["£340K","Jackpot this month"],["92","Charities supported"]].map(([n,l],i,arr) => (
          <div key={i} style={{ padding:"18px 32px",textAlign:"center",borderRight:i<arr.length-1?`1px solid ${border}`:"none",background:"rgba(201,168,76,0.03)" }}>
            <div className="disp" style={{ fontSize:26,fontWeight:600,color:gold }}>{n}</div>
            <div style={{ fontSize:10,color:text2,letterSpacing:"0.1em",marginTop:4,textTransform:"uppercase" }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding:"110px 48px",maxWidth:1200,margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:64,flexWrap:"wrap",gap:24 }}>
        <div>
          <div style={{ fontSize:11,letterSpacing:"0.2em",color:gold,textTransform:"uppercase",fontWeight:500 }}>How it works</div>
          <h2 className="disp" style={{ fontSize:"clamp(34px,5vw,56px)",fontWeight:300,marginTop:10,lineHeight:1.1 }}>Four steps to<br /><em style={{ color:gold }}>everything</em></h2>
        </div>
        <p style={{ maxWidth:320,color:text2,fontSize:14,lineHeight:1.75,fontWeight:300 }}>No complexity. No jargon. Just golf, community, and the satisfaction of knowing your game does good.</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:1,background:border }}>
        {[
          ["01","◈","Subscribe","Choose a monthly or yearly membership. A fixed portion goes straight into the prize pool."],
          ["02","◉","Enter your scores","Log your last five Stableford scores after each round. Your rolling scores are your draw entries."],
          ["03","◎","The monthly draw","Every month our engine runs a live draw. Match 3, 4, or all 5 numbers to win your tier."],
          ["04","◇","Give & win","10% of your subscription flows directly to your chosen charity. Increase it any time."],
        ].map(([n,ic,title,body],i) => (
          <div key={i}
            style={{ background:bg,padding:"44px 32px",transition:"background 0.3s",position:"relative",overflow:"hidden",cursor:"default" }}
            onMouseEnter={e => e.currentTarget.style.background = bg3}
            onMouseLeave={e => e.currentTarget.style.background = bg}
          >
            <div style={{ fontSize:10,color:goldDim,letterSpacing:"0.2em",marginBottom:18 }}>{n}</div>
            <div style={{ fontSize:26,color:gold,marginBottom:18,opacity:0.7 }}>{ic}</div>
            <h3 className="disp" style={{ fontSize:26,fontWeight:400,marginBottom:14,color:text }}>{title}</h3>
            <p style={{ fontSize:13,color:text2,lineHeight:1.8,fontWeight:300 }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── PRIZE POOL ───────────────────────────────────────────────────────────────
function PrizePool() {
  const navigate = useNavigate();
  return (
    <section id="prizes" style={{ padding:"110px 48px",background:bg2 }}>
      <div style={{ maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:72,alignItems:"center" }}>
        <div>
          <div style={{ fontSize:11,letterSpacing:"0.2em",color:gold,textTransform:"uppercase",fontWeight:500 }}>Prize structure</div>
          <h2 className="disp" style={{ fontSize:"clamp(32px,4vw,52px)",fontWeight:300,marginTop:10,lineHeight:1.15,marginBottom:20 }}>Three ways<br />to <em style={{ color:gold }}>win monthly</em></h2>
          <p style={{ color:text2,fontSize:14,lineHeight:1.8,fontWeight:300,marginBottom:36 }}>Every subscription feeds the pool. Match more numbers, win a larger share. The jackpot rolls over until someone claims it.</p>
          <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
            {[["£340K","Current jackpot"],["Mar 31","Next draw"]].map(([n,l]) => (
              <div key={l} style={{ padding:"18px 26px",border:`1px solid ${border}`,borderRadius:2 }}>
                <div className="disp" style={{ fontSize:28,color:gold,fontWeight:600 }}>{n}</div>
                <div style={{ fontSize:11,color:text2,marginTop:3,letterSpacing:"0.08em",textTransform:"uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {[
            { match:"5-Number Match",share:"40%",label:"JACKPOT",rollover:true,  highlight:true  },
            { match:"4-Number Match",share:"35%",label:"TIER 2", rollover:false, highlight:false },
            { match:"3-Number Match",share:"25%",label:"TIER 3", rollover:false, highlight:false },
          ].map(t => (
            <div key={t.match} style={{
              padding:"22px 26px",
              border:`1px solid ${t.highlight ? gold : border}`,
              borderRadius:4,
              background:t.highlight?"rgba(201,168,76,0.06)":"transparent",
              display:"flex",alignItems:"center",justifyContent:"space-between",
            }}>
              <div>
                <span style={{ fontSize:10,letterSpacing:"0.14em",color:t.highlight?gold:text2,fontWeight:500,textTransform:"uppercase" }}>{t.label}</span>
                <div className="disp" style={{ fontSize:22,marginTop:4,color:text }}>{t.match}</div>
                {t.rollover && <div style={{ fontSize:11,color:text2,marginTop:4 }}>Rolls over if unclaimed</div>}
              </div>
              <div className="disp" style={{ fontSize:36,fontWeight:600,color:t.highlight?gold:text2 }}>{t.share}</div>
            </div>
          ))}
          <BtnGold onClick={() => navigate("/subscribe")} style={{ marginTop:8 }}>JOIN THE DRAW</BtnGold>
        </div>
      </div>
    </section>
  );
}

// ─── DRAW DEMO ────────────────────────────────────────────────────────────────
function DrawDemo() {
  const [numbers]  = useState([14, 27, 33, 8, 41]);
  const [revealed, setRevealed] = useState([]);
  const [running,  setRunning]  = useState(false);

  const runDraw = () => {
    if (running) return;
    setRunning(true); setRevealed([]);
    numbers.forEach((_, i) => setTimeout(() => {
      setRevealed(r => [...r, i]);
      if (i === numbers.length - 1) setRunning(false);
    }, 550 * (i + 1)));
  };

  return (
    <section style={{ padding:"120px 48px",textAlign:"center" }}>
      <div style={{ maxWidth:680,margin:"0 auto" }}>
        <span style={{ fontSize:11,letterSpacing:"0.2em",color:gold,textTransform:"uppercase",fontWeight:500 }}>Monthly draw</span>
        <h2 className="disp" style={{ fontSize:"clamp(36px,5vw,58px)",fontWeight:300,marginTop:12,lineHeight:1.1,marginBottom:20 }}>
          The moment<br />of <em style={{ color:gold }}>reckoning</em>
        </h2>
        <p style={{ color:text2,fontSize:15,lineHeight:1.7,fontWeight:300,marginBottom:56 }}>
          Every month, five numbers are drawn. Your five scores are your entries. Match them all and the jackpot is yours.
        </p>

        <div style={{ display:"flex",gap:16,justifyContent:"center",marginBottom:40,flexWrap:"wrap" }}>
          {numbers.map((n, i) => (
            <div key={i} style={{
              width:72,height:72,borderRadius:"50%",
              border:`2px solid ${revealed.includes(i)?gold:"rgba(201,168,76,0.2)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              background:revealed.includes(i)?"rgba(201,168,76,0.12)":"transparent",
              transition:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              transform:revealed.includes(i)?"scale(1.1)":"scale(1)",
            }}>
              <span className="disp" style={{ fontSize:26,fontWeight:600,color:revealed.includes(i)?gold:"rgba(201,168,76,0.25)",transition:"color 0.3s" }}>
                {revealed.includes(i) ? n : "?"}
              </span>
            </div>
          ))}
        </div>

        <button onClick={runDraw} disabled={running} style={{
          background:running?"rgba(201,168,76,0.2)":gold,
          border:"none",color:running?gold:bg,
          padding:"14px 44px",borderRadius:2,
          fontSize:12,letterSpacing:"0.14em",fontWeight:500,
          cursor:running?"not-allowed":"pointer",
          fontFamily:"'DM Sans',sans-serif",transition:"all 0.25s",
        }}>
          {running ? "DRAWING..." : "SIMULATE DRAW"}
        </button>
        <p style={{ marginTop:20,fontSize:12,color:text2,letterSpacing:"0.06em" }}>
          Scores range 1–45 · Stableford format · Monthly cadence
        </p>
      </div>
    </section>
  );
}

// ─── CHARITY SECTION ──────────────────────────────────────────────────────────
function CharitySection() {
  const navigate = useNavigate();
  const charities = [
    { name:"St Andrews Trust",      category:"Youth Development",  amount:"£18,400",icon:"🏌️" },
    { name:"Green Hearts",           category:"Environment",         amount:"£9,200", icon:"🌿" },
    { name:"Fairway Foundation",     category:"Access & Inclusion",  amount:"£14,800",icon:"♿" },
    { name:"Youth Golf Academy",     category:"Youth Development",  amount:"£21,300",icon:"⭐" },
    { name:"Mental Health Outdoors", category:"Wellbeing",           amount:"£5,200", icon:"🧠" },
    { name:"Course Access Fund",     category:"Access & Inclusion",  amount:"£7,800", icon:"⛳" },
  ];

  return (
    <section id="charities" style={{ padding:"110px 48px",background:bg2 }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:60 }}>
          <div style={{ fontSize:11,letterSpacing:"0.2em",color:gold,textTransform:"uppercase",fontWeight:500 }}>Your impact</div>
          <h2 className="disp" style={{ fontSize:"clamp(34px,5vw,58px)",fontWeight:300,marginTop:12,lineHeight:1.1 }}>Golf that<br /><em style={{ color:gold }}>gives back</em></h2>
          <p style={{ maxWidth:480,margin:"20px auto 0",color:text2,fontSize:14,lineHeight:1.75,fontWeight:300 }}>
            Choose a charity at signup. A minimum 10% of your subscription is donated automatically every month.
          </p>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:48 }}>
          {charities.map(c => (
            <div key={c.name} style={{
              padding:"22px",border:`1px solid ${border}`,borderRadius:6,
              background:bg3,transition:"border-color 0.2s",cursor:"default",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}
            >
              <div style={{ fontSize:28,marginBottom:12 }}>{c.icon}</div>
              <div style={{ fontSize:15,fontWeight:500,marginBottom:4 }}>{c.name}</div>
              <div style={{ fontSize:11,color:text2,letterSpacing:"0.08em",marginBottom:12,textTransform:"uppercase" }}>{c.category}</div>
              <div className="disp" style={{ fontSize:22,color:gold,fontWeight:600 }}>{c.amount}</div>
              <div style={{ fontSize:11,color:text2,marginTop:2 }}>raised all time</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center" }}>
          <BtnGold onClick={() => navigate("/subscribe")}>CHOOSE YOUR CHARITY</BtnGold>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name:"Contender", price: yearly ? "£99" : "£9.99",
      period: yearly ? "/year" : "/month",
      saving: yearly ? "Save £20.88" : null,
      features:["Monthly draw entry","5-score tracking","1 charity supported","Email draw results","Basic dashboard"],
      cta:"GET STARTED", featured:false,
    },
    {
      name:"Champion", price: yearly ? "£199" : "£20.99",
      period: yearly ? "/year" : "/month",
      saving: yearly ? "Save £52.88" : null,
      features:["Everything in Contender","Priority draw weighting","Boosted charity contribution","Winner fast-track review","Full analytics dashboard"],
      cta:"JOIN CHAMPION", featured:true,
    },
  ];

  return (
    <section style={{ padding:"110px 48px",background:bg }}>
      <div style={{ maxWidth:900,margin:"0 auto",textAlign:"center" }}>
        <div style={{ fontSize:11,letterSpacing:"0.2em",color:gold,textTransform:"uppercase",fontWeight:500 }}>Membership</div>
        <h2 className="disp" style={{ fontSize:"clamp(34px,5vw,58px)",fontWeight:300,marginTop:12,lineHeight:1.1,marginBottom:20 }}>
          Choose your<br /><em style={{ color:gold }}>commitment</em>
        </h2>

        {/* Toggle */}
        <div style={{ display:"inline-flex",border:`1px solid ${border}`,borderRadius:2,overflow:"hidden",marginBottom:48 }}>
          {["Monthly","Yearly"].map(opt => (
            <button key={opt} onClick={() => setYearly(opt==="Yearly")} style={{
              padding:"10px 28px",border:"none",
              background:(opt==="Yearly")===yearly?"rgba(201,168,76,0.12)":"transparent",
              color:(opt==="Yearly")===yearly?gold:text2,
              fontSize:12,letterSpacing:"0.1em",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",
            }}>{opt}{opt==="Yearly"&&<span style={{ fontSize:10,color:gold,marginLeft:6 }}>●</span>}</button>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,textAlign:"left" }}>
          {plans.map(p => (
            <div key={p.name} style={{
              border:`1px solid ${p.featured?gold:border}`,borderRadius:6,padding:"32px",
              background:p.featured?"rgba(201,168,76,0.04)":bg3,position:"relative",
            }}>
              {p.featured && (
                <div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:gold,color:bg,fontSize:10,letterSpacing:"0.14em",fontWeight:600,padding:"3px 14px",borderRadius:2 }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize:11,color:text2,letterSpacing:"0.14em",marginBottom:8 }}>{p.name.toUpperCase()}</div>
              <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:p.saving?4:24 }}>
                <span className="disp" style={{ fontSize:48,fontWeight:600,color:gold }}>{p.price}</span>
                <span style={{ fontSize:13,color:text2 }}>{p.period}</span>
              </div>
              {p.saving && <div style={{ fontSize:11,color:gold,marginBottom:20,letterSpacing:"0.08em" }}>{p.saving}</div>}
              <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:28 }}>
                {p.features.map((f,j) => (
                  <div key={j} style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ color:gold,fontSize:12,flexShrink:0 }}>◆</span>
                    <span style={{ fontSize:14,color:text2,fontWeight:300 }}>{f}</span>
                  </div>
                ))}
              </div>
              <BtnGold onClick={() => navigate("/subscribe")} style={{ width:"100%",textAlign:"center" }}>{p.cta}</BtnGold>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  const navigate = useNavigate();
  return (
    <section style={{ padding:"140px 48px",background:bg2,textAlign:"center",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)",pointerEvents:"none" }} />
      <span style={{ fontSize:11,letterSpacing:"0.22em",color:gold,textTransform:"uppercase",fontWeight:500 }}>Ready to start?</span>
      <h2 className="disp" style={{ fontSize:"clamp(42px,6vw,72px)",fontWeight:300,marginTop:16,lineHeight:1.05,marginBottom:28 }}>
        Your next round<br />could<em style={{ color:gold }}> change everything.</em>
      </h2>
      <p style={{ maxWidth:440,margin:"0 auto 48px",color:text2,fontSize:15,lineHeight:1.7,fontWeight:300 }}>
        Join 18,000 golfers who play with purpose. Subscribe today and your very first score enters you into the draw.
      </p>
      <BtnGold onClick={() => navigate("/subscribe")} style={{ margin:"0 auto",minWidth:240 }}>BEGIN YOUR MEMBERSHIP</BtnGold>
      <div style={{ marginTop:24,fontSize:12,color:text2 }}>Cancel anytime · No setup fees · Instant draw entry</div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding:"48px",borderTop:`1px solid ${border}`,background:bg }}>
      <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:24 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",border:`1px solid ${gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:gold }}>◇</div>
          <span className="disp" style={{ fontSize:18,color:text }}>Par<em style={{ color:gold }}>Give</em></span>
        </div>
        <div style={{ display:"flex",gap:32,fontSize:12,color:text2,letterSpacing:"0.06em",flexWrap:"wrap" }}>
          {["Privacy","Terms","Draw Rules","Responsible Gambling","Contact"].map(l => (
            <span key={l} style={{ cursor:"pointer" }}
              onMouseEnter={e => e.target.style.color = gold}
              onMouseLeave={e => e.target.style.color = text2}
            >{l}</span>
          ))}
        </div>
        <div style={{ fontSize:12,color:text2 }}>© 2026 ParGive Ltd. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ background:bg,minHeight:"100vh",color:text }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <PrizePool />
      <DrawDemo />
      <CharitySection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
