import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo, BtnOutline, gold, text2 } from "./ui";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Charities",    href: "/#charities"    },
  { label: "Prizes",       href: "/#prizes"       },
];

const DASHBOARD_TABS = [
  { label: "Overview",  path: "/dashboard"          },
  { label: "Scores",    path: "/dashboard/scores"   },
  { label: "Draw",      path: "/dashboard/draw"     },
  { label: "Charity",   path: "/dashboard/charity"  },
  { label: "Account",   path: "/dashboard/account"  },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const showSolidBg = scrolled || isDashboard || isAdmin;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "18px 48px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: showSolidBg ? "rgba(10,10,8,0.95)" : "transparent",
      backdropFilter: showSolidBg ? "blur(14px)" : "none",
      borderBottom: showSolidBg ? "1px solid var(--border)" : "none",
      transition: "all 0.35s ease",
    }}>
      {/* Logo */}
      <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <Logo />
      </div>

      {/* Centre links */}
      <div className="hide-mobile" style={{ display: "flex", gap: 28, fontSize: 13, color: text2 }}>
        {isDashboard
          ? DASHBOARD_TABS.map(t => (
              <span key={t.path}
                onClick={() => navigate(t.path)}
                style={{
                  cursor: "pointer", letterSpacing: "0.06em", transition: "color 0.2s",
                  color: location.pathname === t.path ? gold : text2,
                  fontWeight: location.pathname === t.path ? 500 : 400,
                }}
                onMouseEnter={e => e.target.style.color = gold}
                onMouseLeave={e => e.target.style.color = location.pathname === t.path ? gold : text2}
              >{t.label}</span>
            ))
          : !isAdmin && NAV_LINKS.map(l => (
              <span key={l.label}
                style={{ cursor: "pointer", letterSpacing: "0.06em", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = gold}
                onMouseLeave={e => e.target.style.color = text2}
              >{l.label}</span>
            ))
        }
      </div>

      {/* Right CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {user ? (
          <>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(201,168,76,0.15)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: gold, cursor: "pointer", fontWeight: 500,
            }}>
              {user.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <span
              onClick={logout}
              style={{ fontSize: 12, color: text2, cursor: "pointer", letterSpacing: "0.08em", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = gold}
              onMouseLeave={e => e.target.style.color = text2}
            >SIGN OUT</span>
          </>
        ) : (
          <>
            <span
              className="hide-mobile"
              onClick={() => navigate("/login")}
              style={{ fontSize: 12, color: text2, cursor: "pointer", letterSpacing: "0.08em", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = gold}
              onMouseLeave={e => e.target.style.color = text2}
            >SIGN IN</span>
            <BtnOutline sm onClick={() => navigate("/subscribe")}>JOIN NOW</BtnOutline>
          </>
        )}
      </div>
    </nav>
  );
}
