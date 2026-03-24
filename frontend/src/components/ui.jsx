// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
// Used across homepage, user dashboard, admin panel, and payment flow.

const gold = "#C9A84C", goldLight = "#E8C97A", goldDim = "#8A6B2A";
const bg = "#0A0A08", bg2 = "#111109", bg3 = "#181814";
const text = "#F0EDE6", text2 = "#9C9A8E", border = "rgba(201,168,76,0.15)";
const green = "#1D9E75", red = "#E05555";

export { gold, goldLight, goldDim, bg, bg2, bg3, text, text2, border, green, red };

// ─── BUTTONS ──────────────────────────────────────────────────────────────────
export const BtnGold = ({ children, onClick, style = {}, sm, loading, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      background: (disabled || loading) ? "rgba(201,168,76,0.22)" : gold,
      color: (disabled || loading) ? goldDim : bg,
      border: "none",
      padding: sm ? "8px 20px" : "13px 32px",
      borderRadius: 2,
      fontSize: sm ? 11 : 13,
      letterSpacing: "0.12em",
      fontWeight: 500,
      cursor: (disabled || loading) ? "not-allowed" : "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      ...style,
    }}
    onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = goldLight; }}
    onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = gold; }}
  >
    {loading && (
      <span style={{
        width: 13, height: 13,
        border: "2px solid rgba(10,10,8,0.3)",
        borderTopColor: bg,
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }} />
    )}
    {children}
  </button>
);

export const BtnOutline = ({ children, onClick, style = {}, sm, danger }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      border: `1px solid ${danger ? "rgba(224,85,85,0.35)" : "rgba(201,168,76,0.35)"}`,
      color: danger ? red : gold,
      padding: sm ? "7px 18px" : "12px 28px",
      borderRadius: 2,
      fontSize: sm ? 11 : 13,
      letterSpacing: "0.11em",
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
      transition: "all 0.2s",
      ...style,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? "rgba(224,85,85,0.1)" : "rgba(201,168,76,0.1)";
    }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
  >{children}</button>
);

// ─── CARD ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div style={{
    background: bg3,
    border: `1px solid ${border}`,
    borderRadius: 6,
    padding: "24px",
    ...style,
  }}>
    {children}
  </div>
);

// ─── TAG / BADGE ───────────────────────────────────────────────────────────────
export const Tag = ({ children, color = "gold" }) => {
  const palette = {
    gold:  { bg: "rgba(201,168,76,0.12)",  text: gold  },
    green: { bg: "rgba(29,158,117,0.14)",  text: green },
    red:   { bg: "rgba(224,85,85,0.12)",   text: red   },
    gray:  { bg: "rgba(156,154,142,0.12)", text: text2 },
  };
  const c = palette[color] || palette.gold;
  return (
    <span style={{
      fontSize: 10, letterSpacing: "0.12em", fontWeight: 500,
      padding: "3px 8px", borderRadius: 2,
      background: c.bg, color: c.text,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

// ─── MODAL ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 200,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    padding: 24,
  }}>
    <div className="fu" style={{
      background: bg2,
      border: `1px solid ${border}`,
      borderRadius: 8,
      padding: "32px",
      width: "100%",
      maxWidth: wide ? 680 : 520,
      maxHeight: "90vh",
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="disp" style={{ fontSize: 26, fontWeight: 300 }}>{title}</div>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: text2,
          fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "4px",
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── TOAST ─────────────────────────────────────────────────────────────────────
export const Toast = ({ msg, color = green }) => (
  <div style={{
    position: "fixed", top: 24, right: 24, zIndex: 300,
    background: bg3,
    border: `1px solid ${color === green ? "rgba(29,158,117,0.4)" : "rgba(224,85,85,0.4)"}`,
    borderRadius: 4,
    padding: "12px 20px",
    fontSize: 13,
    color,
    animation: "slideLeft 0.3s ease both",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  }}>
    ✓ {msg}
  </div>
);

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: bg3,
    border: `1px solid ${border}`,
    borderRadius: 6,
    padding: "20px 22px",
  }}>
    <div style={{ fontSize: 10, color: text2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div className="disp" style={{ fontSize: 32, fontWeight: 600, color: color || gold }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: text2, marginTop: 4 }}>{sub}</div>}
  </div>
);

// ─── SECTION HEADER ────────────────────────────────────────────────────────────
export const SectionHeader = ({ label, title, accent }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 10, letterSpacing: "0.18em", color: gold, marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <h2 className="disp" style={{ fontSize: 34, fontWeight: 300, lineHeight: 1.1 }}>
      {title} {accent && <em style={{ color: gold }}>{accent}</em>}
    </h2>
  </div>
);

// ─── LOGO ──────────────────────────────────────────────────────────────────────
export const Logo = ({ size = "md" }) => {
  const sz = size === "sm" ? 26 : 30;
  const fs = size === "sm" ? 17 : 20;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{
        width: sz, height: sz, borderRadius: "50%",
        border: `1.5px solid ${gold}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: sz * 0.45, color: gold,
      }}>◇</div>
      <span className="disp" style={{ fontSize: fs, letterSpacing: "0.04em", color: text }}>
        Par<em style={{ color: gold }}>Give</em>
      </span>
    </div>
  );
};

// ─── FORM FIELD HELPERS ────────────────────────────────────────────────────────
export const FieldLabel = ({ children }) => (
  <label style={{
    fontSize: 10, color: text2, display: "block",
    marginBottom: 7, letterSpacing: "0.12em", fontWeight: 500,
  }}>{children}</label>
);

export const FieldErr = ({ msg }) => msg
  ? <div style={{ fontSize: 11, color: red, marginTop: 5, letterSpacing: "0.02em" }}>↑ {msg}</div>
  : null;

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export const Divider = ({ style = {} }) => (
  <div style={{ height: 1, background: border, ...style }} />
);
