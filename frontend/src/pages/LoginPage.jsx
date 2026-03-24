import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BtnGold, Logo, FieldLabel, FieldErr, Card, gold, text2, bg, red } from "../components/ui";

// ─── SHARED AUTH LAYOUT ───────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:bg,padding:"24px",
    }}>
      {/* Glow */}
      <div style={{ position:"fixed",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%)",pointerEvents:"none" }} />

      <div className="fu" style={{ width:"100%",maxWidth:460 }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:24 }}>
            <Logo />
          </div>
          <h1 className="disp" style={{ fontSize:34,fontWeight:300,marginBottom:8 }}>
            {title}
          </h1>
          <p style={{ fontSize:13,color:text2,fontWeight:300 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back." subtitle="Sign in to your ParGive account.">
      <Card style={{ padding:"32px 36px" }}>
        <form onSubmit={handle}>
          <div style={{ marginBottom:16 }}>
            <FieldLabel>EMAIL ADDRESS</FieldLabel>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({...f,email:e.target.value}))} placeholder="you@example.com" />
          </div>
          <div style={{ marginBottom:24 }}>
            <FieldLabel>PASSWORD</FieldLabel>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({...f,password:e.target.value}))} placeholder="••••••••" />
          </div>

          {error && <div style={{ padding:"10px 14px",background:"rgba(224,85,85,0.1)",border:"1px solid rgba(224,85,85,0.25)",borderRadius:4,fontSize:12,color:red,marginBottom:20 }}>{error}</div>}

          <BtnGold loading={loading} style={{ width:"100%",justifyContent:"center" }}>SIGN IN</BtnGold>
        </form>
      </Card>
      <div style={{ textAlign:"center",marginTop:20,fontSize:13,color:text2 }}>
        Don't have an account?{" "}
        <Link to="/subscribe" style={{ color:gold,textDecoration:"none",fontWeight:500 }}>Join ParGive →</Link>
      </div>
    </AuthLayout>
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name = "Name is required.";
    if (!form.email.includes("@"))        e.email = "Valid email required.";
    if (form.password.length < 8)         e.password = "Minimum 8 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handle = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      await register({ name:form.name, email:form.email, password:form.password });
      navigate("/subscribe");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div style={{ marginBottom:16 }}>
      <FieldLabel>{label}</FieldLabel>
      <input type={type} value={form[key]} placeholder={placeholder}
        className={errors[key] ? "err" : ""}
        onChange={e => setForm(f => ({...f,[key]:e.target.value}))} />
      <FieldErr msg={errors[key]} />
    </div>
  );

  return (
    <AuthLayout title="Create your account." subtitle="Start playing with purpose.">
      <Card style={{ padding:"32px 36px" }}>
        <form onSubmit={handle}>
          {field("name","FULL NAME","text","James Harrington")}
          {field("email","EMAIL ADDRESS","email","you@example.com")}
          {field("password","PASSWORD","password","Minimum 8 characters")}
          {field("confirmPassword","CONFIRM PASSWORD","password","Repeat password")}

          {errors.api && <div style={{ padding:"10px 14px",background:"rgba(224,85,85,0.1)",border:"1px solid rgba(224,85,85,0.25)",borderRadius:4,fontSize:12,color:red,marginBottom:20 }}>{errors.api}</div>}

          <BtnGold loading={loading} style={{ width:"100%",justifyContent:"center",marginTop:8 }}>CREATE ACCOUNT</BtnGold>
        </form>
      </Card>
      <div style={{ textAlign:"center",marginTop:20,fontSize:13,color:text2 }}>
        Already a member?{" "}
        <Link to="/login" style={{ color:gold,textDecoration:"none",fontWeight:500 }}>Sign in →</Link>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
