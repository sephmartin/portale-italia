import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation } from "wouter";

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeCtx = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

// ─── Module config ─────────────────────────────────────────────────────────────
export const MODULES = [
  { id: "inps",    label: "INPS",              href: "/inps",    color: "var(--color-inps)",    bg: "var(--color-inps-light)",    icon: ShieldIcon },
  { id: "entrate", label: "Agenzia Entrate",   href: "/entrate", color: "var(--color-entrate)", bg: "var(--color-entrate-light)", icon: FileTextIcon },
  { id: "pagopa",  label: "PagoPA",            href: "/pagopa",  color: "var(--color-pagopa)",  bg: "var(--color-pagopa-light)",  icon: CreditCardIcon },
  { id: "anpr",    label: "ANPR",              href: "/anpr",    color: "var(--color-anpr)",    bg: "var(--color-anpr-light)",    icon: UsersIcon },
  { id: "salute",  label: "Fascicolo Sanitario",href: "/salute", color: "var(--color-salute)",  bg: "var(--color-salute-light)",  icon: HeartIcon },
  { id: "auto",    label: "Automobilista",     href: "/auto",    color: "var(--color-auto)",    bg: "var(--color-auto-light)",    icon: CarIcon },
];

function ShieldIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function FileTextIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function CreditCardIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function UsersIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function HeartIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function CarIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
}
function GridIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function CodeIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}
function BellIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
}
function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

// ─── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8 flex-shrink-0" aria-label="CittadinoOS">
        {/* Tricolore shield */}
        <rect width="36" height="36" rx="10" fill="var(--color-brand)"/>
        <path d="M18 6L28 10V20C28 26 18 30 18 30C18 30 8 26 8 20V10Z" fill="white" opacity="0.15"/>
        <path d="M18 6L28 10V20C28 26 18 30 18 30C18 30 8 26 8 20V10Z" stroke="white" strokeWidth="1.5" fill="none"/>
        {/* Italian flag stripes inside shield */}
        <clipPath id="shield-clip">
          <path d="M18 7.5L27 11V20C27 25.5 18 29 18 29C18 29 9 25.5 9 20V11Z"/>
        </clipPath>
        <g clipPath="url(#shield-clip)">
          <rect x="9" y="7" width="6" height="23" fill="#009246"/>
          <rect x="15" y="7" width="6" height="23" fill="white"/>
          <rect x="21" y="7" width="6" height="23" fill="#CE2B37"/>
        </g>
        {/* Star */}
        <circle cx="18" cy="18.5" r="3.5" fill="none" stroke="white" strokeWidth="1.5"/>
        <path d="M18 15.5L18.5 17.5H20.5L19 18.8L19.5 20.8L18 19.5L16.5 20.8L17 18.8L15.5 17.5H17.5Z" fill="white"/>
      </svg>
      {!collapsed && (
        <div>
          <p className="font-extrabold text-sm leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            CittadinoOS
          </p>
          <p className="text-xs leading-none mt-0.5" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            Portale Unificato PA
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle, isMobile, mobileOpen }: { collapsed: boolean; onToggle: () => void; isMobile?: boolean; mobileOpen?: boolean }) {
  const [location] = useLocation();
  const { dark, toggle } = useTheme();

  const topNav = [
    { href: "/", label: "Hub", Icon: GridIcon },
    { href: "/dashboard", label: "Dashboard", Icon: ({ size = 18 }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    )},
  ];

  return (
    <aside
      className="fixed top-0 h-full z-50 flex flex-col border-r"
      style={{
        left: 0,
        width: isMobile ? "var(--sidebar-width)" : (collapsed ? "64px" : "var(--sidebar-width)"),
        transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
        transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), width 0.3s",
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo area */}
      <div className="h-16 flex items-center px-4 border-b flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
        <Link href="/" className="flex-1 min-w-0">
          <Logo collapsed={collapsed} />
        </Link>
        {!collapsed && (
          <button onClick={onToggle} className="ml-2 w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--color-border)] flex-shrink-0" aria-label="Comprimi sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {collapsed && (
          <button onClick={onToggle} className="absolute -right-3 top-16 w-6 h-6 rounded-full border flex items-center justify-center text-xs"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Top nav */}
        {topNav.map(({ href, label, Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "nav-active" : ""}`}
              style={{
                background: active ? "var(--color-brand-light)" : "transparent",
                color: active ? "var(--color-brand)" : "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon size={16} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Divider + modules */}
        {!collapsed && (
          <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
            Servizi PA
          </p>
        )}
        {collapsed && <div className="my-2 mx-2 h-px" style={{ background: "var(--color-divider)" }} />}

        {MODULES.map(({ id, href, label, color, bg, icon: Icon }) => {
          const active = location.startsWith(href);
          return (
            <Link key={id} href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "nav-active" : ""}`}
              style={{
                background: active ? bg : "transparent",
                color: active ? color : "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
              title={collapsed ? label : undefined}
              data-testid={`nav-module-${id}`}
            >
              <span style={{ color: active ? color : "var(--color-text-faint)" }}><Icon size={16} /></span>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {!collapsed && <div className="mx-1 my-2 h-px" style={{ background: "var(--color-divider)" }} />}
        {collapsed && <div className="my-2 mx-2 h-px" style={{ background: "var(--color-divider)" }} />}

        <Link href="/api"
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location === "/api" ? "nav-active" : ""}`}
          style={{
            background: location === "/api" ? "var(--color-brand-light)" : "transparent",
            color: location === "/api" ? "var(--color-brand)" : "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
          title={collapsed ? "API Gateway" : undefined}
        >
          <CodeIcon size={16} />
          {!collapsed && <span>API Gateway</span>}
        </Link>
      </nav>

      {/* Bottom: user + theme */}
      <div className="border-t px-3 py-3 space-y-1 flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[var(--color-border)] transition-colors"
          style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
          {!collapsed && <span>{dark ? "Modalità chiara" : "Modalità scura"}</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
              style={{ background: "var(--color-brand)", fontFamily: "var(--font-display)" }}>MR</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>Mario Rossi</p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-faint)" }}>SPID · CIE attivi</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────────
function HamburgerIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}

function Topbar({ sidebarWidth, onMobileMenu, isMobile }: { sidebarWidth: number; onMobileMenu?: () => void; isMobile?: boolean }) {
  const [location] = useLocation();
  const module = MODULES.find(m => location.startsWith(m.href));

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 flex items-center px-5 gap-4 border-b"
      style={{
        left: sidebarWidth,
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Hamburger on mobile */}
      {isMobile && (
        <button onClick={onMobileMenu} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-border)] transition-colors flex-shrink-0" style={{ color: "var(--color-text-muted)" }} aria-label="Menu">
          <HamburgerIcon />
        </button>
      )}
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {module && (
          <>
            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: module.bg, color: module.color }}>
              <module.icon size={12} />
            </div>
            <span className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-display)", color: module.color }}>
              {module.label}
            </span>
          </>
        )}
        {!module && (
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            {location === "/" ? "Hub servizi" : location === "/dashboard" ? "Dashboard" : location === "/api" ? "API Gateway" : "CittadinoOS"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications badge */}
        <Link href="/dashboard"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-border)] transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          <BellIcon size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
        </Link>
        {/* SPID badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold"
          style={{ borderColor: "var(--color-brand)", color: "var(--color-brand)", background: "var(--color-brand-light)", fontFamily: "var(--font-body)" }}>
          <div className="status-online" />
          SPID
        </div>
      </div>
    </header>
  );
}

// ─── Mobile check ──────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 640 : false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ─── AppShell ──────────────────────────────────────────────────────────────────
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const sidebarWidth = isMobile ? 0 : (collapsed ? 64 : 240);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Sidebar */}
      <Sidebar
        collapsed={isMobile ? false : collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onToggle={() => {
          if (isMobile) setMobileOpen(false);
          else setCollapsed(c => !c);
        }}
      />
      <Topbar sidebarWidth={sidebarWidth} onMobileMenu={() => setMobileOpen(o => !o)} isMobile={isMobile} />
      <main
        className="min-h-dvh pt-16 transition-all duration-300"
        style={{ paddingLeft: sidebarWidth, background: "var(--color-bg)" }}
      >
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
        <footer className="border-t py-4 px-6 mt-8" style={{ borderColor: "var(--color-border)" }}>
          <div className="max-w-7xl mx-auto flex items-center gap-1.5">
            <p className="text-xs" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
              Seph Martin ·
            </p>
            <a href="https://github.com/sephmartin/portale-italia" target="_blank" rel="noopener noreferrer"
              className="text-xs flex items-center gap-1.5 hover:underline underline-offset-2"
              style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Open Source
            </a>
          </div>
        </footer>
      </main>
    </ThemeCtx.Provider>
  );
}
