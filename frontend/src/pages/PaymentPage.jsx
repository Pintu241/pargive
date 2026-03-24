import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import {
  BtnGold, BtnOutline, Logo, Tag, FieldLabel, FieldErr, Divider,
  gold, goldLight, goldDim, bg, bg2, bg3, text, text2, border, green, red,
} from "../components/ui";

const PLANS = [
  {
    key:"contender", label:"Contender", emoji:"◉",
    monthly:9.99, annual:99,
    features:["Monthly draw entry","5-score tracking","1 charity supported","Email draw results","Basic dashboard"],
  },
  {
    key:"champion", label:"Champion", emoji:"◈",
    monthly:20.99, annual:199,
    features:["Everything in Contender","Priority draw weighting","Boosted charity contribution","Winner fast-track review","Full analytics dashboard"],
    popular:true,
  },
];

const CHARITIES = [
  "St Andrews Trust","Green Hearts","Fairway Foundation","Links Legacy",
  "Youth Golf Academy","Disabled Golfers Association","Course Access Fund","Mental Health Outdoors",
];

// ─── PLAN PICKER ─────────────────────────────────────────────────────────────
function PlanPicker({ onSelect }) {
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px",background:bg }}>
      <div style={{ position:"fixed",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)",pointerEvents:"none" }} />

      <div className="fu" style={{ width:"100%",maxWidth:800 }}>
        <div style={{ textAlign:"center",marginBottom:48 }}>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:28 }}><Logo /></div>
          <h1 className="disp" style={{ fontSize:"clamp(32px,5vw,52px)",fontWeight:300,lineHeight:1.05,marginBottom:16 }}>
            Choose your <em style={{ color:gold }}>membership</em>
          </h1>
          <p style={{ fontSize:14,color:text2,fontWeight:300 }}>Cancel anytime. No setup fees.</p>
        </div>

        {/* Billing toggle */}
        <div style={{ display:"flex",justifyContent:"center",marginBottom:36 }}>
          <div style={{ display:"inline-flex",border:`1px solid ${border}`,borderRadius:2,overflow:"hidden" }}>
            {["Monthly","Yearly"].map(opt => (
              <button key={opt} onClick={() => setYearly(opt==="Yearly")} style={{
                padding:"10px 32px",border:"none",
                background:(opt==="Yearly")===yearly?"rgba(201,168,76,0.12)":"transparent",
                color:(opt==="Yearly")===yearly?gold:text2,
                fontSize:12,letterSpacing:"0.1em",cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",
              }}>
                {opt}
                {opt==="Yearly" && <span style={{ fontSize:10,color:gold,marginLeft:6 }}>save ~20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
          {PLANS.map(p => {
            const price = yearly ? p.annual : p.monthly;
            return (
              <div key={p.key} style={{
                border:`1px solid ${p.popular?gold:border}`,borderRadius:6,padding:"32px",
                background:p.popular?"rgba(201,168,76,0.04)":bg3,position:"relative",
              }}>
                {p.popular && (
                  <div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:gold,color:bg,fontSize:10,letterSpacing:"0.14em",fontWeight:600,padding:"3px 14px",borderRadius:2 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize:11,color:text2,letterSpacing:"0.14em",marginBottom:8 }}>{p.label.toUpperCase()}</div>
                <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:24 }}>
                  <span className="disp" style={{ fontSize:48,fontWeight:600,color:gold }}>£{price}</span>
                  <span style={{ fontSize:13,color:text2 }}>/{yearly?"year":"month"}</span>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:28 }}>
                  {p.features.map((f,j) => (
                    <div key={j} style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <span style={{ color:gold,fontSize:12,flexShrink:0 }}>◆</span>
                      <span style={{ fontSize:13,color:text2,fontWeight:300 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <BtnGold onClick={() => onSelect(p, yearly)} style={{ width:"100%",justifyContent:"center" }}>
                  SELECT {p.label.toUpperCase()}
                </BtnGold>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CHARITY SELECTOR STEP ────────────────────────────────────────────────────
function CharityStep({ onSelect, onBack }) {
  const [selected, setSelected] = useState("");
  const [pct, setPct] = useState(10);

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 24px",background:bg }}>
      <div className="fu" style={{ width:"100%",maxWidth:520 }}>
        <div style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:20 }}><Logo /></div>
          <h2 className="disp" style={{ fontSize:36,fontWeight:300,marginBottom:8 }}>
            Choose your <em style={{ color:gold }}>charity</em>
          </h2>
          <p style={{ fontSize:13,color:text2,fontWeight:300 }}>A minimum 10% of your subscription is donated monthly.</p>
        </div>

        <div style={{ background:bg3,border:`1px solid ${border}`,borderRadius:6,padding:"28px",marginBottom:20 }}>
          <FieldLabel>SELECT A CHARITY</FieldLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:24 }}>
            {CHARITIES.map(c => (
              <div key={c} onClick={() => setSelected(c)} style={{
                padding:"12px 16px",border:`1px solid ${selected===c?gold:border}`,
                borderRadius:4,cursor:"pointer",
                background:selected===c?"rgba(201,168,76,0.07)":"transparent",
                transition:"all 0.18s",display:"flex",alignItems:"center",gap:12,
              }}>
                <div style={{ width:15,height:15,borderRadius:"50%",border:`1.5px solid ${selected===c?gold:text2}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:selected===c?gold:"transparent" }}>
                  {selected===c && <div style={{ width:6,height:6,borderRadius:"50%",background:bg }} />}
                </div>
                <span style={{ fontSize:13,color:selected===c?gold:text }}>{c}</span>
              </div>
            ))}
          </div>

          <FieldLabel>CONTRIBUTION RATE</FieldLabel>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10 }}>
            <span style={{ fontSize:13,color:text2 }}>Your monthly donation</span>
            <span className="disp" style={{ fontSize:28,color:gold,fontWeight:600 }}>{pct}%</span>
          </div>
          <input type="range" min="10" max="50" step="1" value={pct} onChange={e => setPct(Number(e.target.value))} style={{ width:"100%",accentColor:gold,marginBottom:6 }} />
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:text2 }}>
            <span>Min 10%</span><span>Max 50%</span>
          </div>
        </div>

        <div style={{ display:"flex",gap:12 }}>
          <BtnOutline onClick={onBack} style={{ flex:0.4,justifyContent:"center" }}>← BACK</BtnOutline>
          <BtnGold onClick={() => selected && onSelect(selected,pct)} disabled={!selected} style={{ flex:1,justifyContent:"center" }}>
            CONTINUE →
          </BtnGold>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT FORM ─────────────────────────────────────────────────────────────
// NOTE: In production replace card inputs with <CardElement> from @stripe/react-stripe-js
// The form below collects data for demo; real implementation uses Stripe Elements
// to tokenize and never passes raw card data to your server.
function PaymentForm({ plan, yearly, charity, charityPct, onSuccess, onBack }) {
  const { user } = useAuth();
  const price = yearly ? plan.annual : plan.monthly;

  const [step, setStep] = useState(1);  // 1=account 2=card
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "",
    cardNumber:"", expMonth:"01", expYear:"2025", cvc:"",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cardNum, setCardNum] = useState("");

  const fmtCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();

  const brand = (() => {
    const n = cardNum.replace(/\D/g,"");
    if (n[0]==="4") return "VISA";
    if (["51","52","53","54","55"].some(p=>n.startsWith(p))) return "MC";
    if (n.startsWith("34")||n.startsWith("37")) return "AMEX";
    return "";
  })();

  const submit = async () => {
    setLoading(true);
    try {
      // In production: use Stripe.js to create a paymentMethod, then send paymentMethodId to backend
      await api.post("/subscriptions/create", {
        planKey: plan.key,
        yearly,
        charity,
        charityPct,
        // paymentMethodId: stripePaymentMethod.id  ← real implementation
      });
      onSuccess();
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Payment failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 24px",background:bg }}>
      <div className="fu" style={{ width:"100%",maxWidth:940,display:"grid",gridTemplateColumns:"1fr 380px",gap:32,alignItems:"start" }}>

        {/* Left: form */}
        <div>
          <div style={{ display:"flex",justifyContent:"flex-start",marginBottom:32 }}><Logo /></div>

          <div style={{ background:bg3,border:`1px solid ${border}`,borderRadius:6,padding:"32px" }}>
            {/* Card visual */}
            <div style={{ background:`linear-gradient(135deg,#1a1a14 0%,#2a2410 50%,#1a1a0e 100%)`,border:`1px solid rgba(201,168,76,0.25)`,borderRadius:12,padding:"28px 28px 22px",marginBottom:28,position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(201,168,76,0.05)" }} />
              <div style={{ position:"absolute",bottom:-30,left:-30,width:120,height:120,borderRadius:"50%",background:"rgba(201,168,76,0.04)" }} />
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32 }}>
                <div style={{ fontSize:10,color:"rgba(201,168,76,0.5)",letterSpacing:"0.14em" }}>PARGIVE CARD</div>
                {brand && <div style={{ fontSize:13,color:gold,fontWeight:600,letterSpacing:"0.08em" }}>{brand}</div>}
              </div>
              <div className="disp" style={{ fontSize:22,letterSpacing:"0.18em",color:gold,marginBottom:20,fontWeight:300 }}>
                {fmtCard(cardNum) || "•••• •••• •••• ••••"}
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(201,168,76,0.6)",letterSpacing:"0.1em" }}>
                <span>{form.name || "CARD HOLDER"}</span>
                <span>{form.expMonth}/{form.expYear.slice(-2)}</span>
              </div>
            </div>

            {/* Fields */}
            {[["FULL NAME","name","text","James Harrington"],["EMAIL ADDRESS","email","email","you@example.com"]].map(([l,k,t,p]) => (
              <div key={k} style={{ marginBottom:14 }}>
                <FieldLabel>{l}</FieldLabel>
                <input type={t} placeholder={p} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <FieldLabel>CARD NUMBER</FieldLabel>
              <input value={fmtCard(cardNum)} placeholder="•••• •••• •••• ••••" onChange={e => setCardNum(e.target.value.replace(/\D/g,""))} maxLength={19} />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:24 }}>
              <div>
                <FieldLabel>MONTH</FieldLabel>
                <select value={form.expMonth} onChange={e => setForm(f=>({...f,expMonth:e.target.value}))}>
                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>YEAR</FieldLabel>
                <select value={form.expYear} onChange={e => setForm(f=>({...f,expYear:e.target.value}))}>
                  {Array.from({length:10},(_,i)=>String(2025+i)).map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>CVC</FieldLabel>
                <input type="text" placeholder="•••" maxLength={4} value={form.cvc} onChange={e => setForm(f=>({...f,cvc:e.target.value.replace(/\D/g,"")}))} />
              </div>
            </div>

            {errors.api && <div style={{ padding:"10px 14px",background:"rgba(224,85,85,0.1)",border:"1px solid rgba(224,85,85,0.25)",borderRadius:4,fontSize:12,color:red,marginBottom:16 }}>{errors.api}</div>}

            <BtnGold loading={loading} onClick={submit} style={{ width:"100%",justifyContent:"center" }}>
              PAY £{price} {yearly?"/ YEAR":"/ MONTH"} →
            </BtnGold>
            <div style={{ marginTop:12,fontSize:11,color:text2,textAlign:"center",lineHeight:1.6 }}>
              🔒 Secured by Stripe · PCI DSS compliant · Cancel anytime
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div style={{ background:bg3,border:`1px solid ${border}`,borderRadius:6,padding:"28px",position:"sticky",top:80 }}>
          <div style={{ fontSize:11,color:text2,letterSpacing:"0.1em",marginBottom:20 }}>ORDER SUMMARY</div>
          <div className="disp" style={{ fontSize:28,fontWeight:300,marginBottom:4 }}>
            {plan.label} <em style={{ color:gold }}>{yearly?"Yearly":"Monthly"}</em>
          </div>
          <div style={{ fontSize:13,color:text2,marginBottom:24 }}>
            Billed {yearly?"once per year":"every month"}
          </div>
          <Divider style={{ marginBottom:20 }} />
          {[
            ["Plan",`${plan.label} · ${yearly?"Yearly":"Monthly"}`],
            ["Charity",charity],
            ["Donation",`${charityPct}% of subscription`],
            ["Draw entry","Immediate upon first score"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:12,fontSize:13 }}>
              <span style={{ color:text2 }}>{k}</span>
              <span style={{ color:text,textAlign:"right",maxWidth:180 }}>{v}</span>
            </div>
          ))}
          <Divider style={{ margin:"16px 0" }} />
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline" }}>
            <span style={{ fontSize:13,color:text2 }}>Total today</span>
            <span className="disp" style={{ fontSize:32,color:gold,fontWeight:600 }}>£{price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUCCESS ─────────────────────────────────────────────────────────────────
function SuccessScreen({ plan, yearly }) {
  const navigate = useNavigate();
  const price = yearly ? plan.annual : plan.monthly;

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:bg,padding:24 }}>
      <div className="fu" style={{ width:"100%",maxWidth:520,textAlign:"center" }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:"rgba(29,158,117,0.12)",border:"1px solid rgba(29,158,117,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",animation:"checkPop 0.5s ease both" }}>
          <span style={{ fontSize:32,color:green }}>✓</span>
        </div>

        <div style={{ fontSize:11,letterSpacing:"0.2em",color:green,marginBottom:12 }}>PAYMENT SUCCESSFUL</div>
        <h1 className="disp" style={{ fontSize:"clamp(34px,5vw,48px)",fontWeight:300,lineHeight:1.08,marginBottom:16 }}>
          You're in. <em className="shimmer">Welcome.</em>
        </h1>
        <p style={{ fontSize:14,color:text2,lineHeight:1.7,marginBottom:32,fontWeight:300 }}>
          Your <strong style={{ color:text }}>{plan.label}</strong> membership is now active. A receipt has been sent to your email.
        </p>

        {/* Receipt */}
        <div style={{ background:bg2,border:`1px solid ${border}`,borderRadius:8,padding:"24px 28px",marginBottom:32,textAlign:"left" }}>
          <div style={{ fontSize:10,color:text2,letterSpacing:"0.12em",marginBottom:16 }}>PAYMENT RECEIPT</div>
          {[
            ["Plan",`${plan.label} · ${yearly?"Yearly":"Monthly"}`],
            ["Amount charged",`£${price}`],
            ["Next billing", yearly ? "March 2027" : "April 2026"],
            ["Transaction ID",`PG-${Math.random().toString(36).slice(2,10).toUpperCase()}`],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${border}`,fontSize:13 }}>
              <span style={{ color:text2 }}>{k}</span>
              <span style={{ color:text }}>{v}</span>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:32 }}>
          {[["Enter scores","Log your first round to enter the draw"],["Charity active","Your contribution starts this month"],["Draw entry","You're in the next monthly draw"]].map(([t,d]) => (
            <div key={t} style={{ background:bg3,border:`1px solid ${border}`,borderRadius:6,padding:"16px 12px",textAlign:"left" }}>
              <div style={{ fontSize:11,color:gold,fontWeight:500,marginBottom:6 }}>◆</div>
              <div style={{ fontSize:12,color:text,fontWeight:500,marginBottom:4,lineHeight:1.3 }}>{t}</div>
              <div style={{ fontSize:11,color:text2,lineHeight:1.5 }}>{d}</div>
            </div>
          ))}
        </div>

        <BtnGold onClick={() => navigate("/dashboard")} style={{ width:"100%",justifyContent:"center" }}>
          GO TO MY DASHBOARD →
        </BtnGold>
      </div>
    </div>
  );
}

// ─── PAGE ORCHESTRATOR ────────────────────────────────────────────────────────
export default function PaymentPage() {
  const [screen, setScreen]     = useState("plans");
  const [plan, setPlan]         = useState(null);
  const [yearly, setYearly]     = useState(false);
  const [charity, setCharity]   = useState("");
  const [charityPct, setCharityPct] = useState(10);

  return (
    <>
      {screen === "plans" && (
        <PlanPicker onSelect={(p,y) => { setPlan(p); setYearly(y); setScreen("charity"); }} />
      )}
      {screen === "charity" && (
        <CharityStep
          onBack={() => setScreen("plans")}
          onSelect={(c,pct) => { setCharity(c); setCharityPct(pct); setScreen("payment"); }}
        />
      )}
      {screen === "payment" && plan && (
        <PaymentForm
          plan={plan} yearly={yearly} charity={charity} charityPct={charityPct}
          onSuccess={() => setScreen("success")}
          onBack={() => setScreen("charity")}
        />
      )}
      {screen === "success" && plan && (
        <SuccessScreen plan={plan} yearly={yearly} />
      )}
    </>
  );
}
