import AgentWidget from "./AgentWidget";

interface Service { label: string; icon: string; desc: string; badge?: string; badgeColor?: string; }
interface Stat { value: string; label: string; }

interface Props {
  id: string;
  name: string;
  tagline: string;
  color: string;
  colorHex: string;
  darkHex: string;
  bg: string;
  icon: React.ComponentType<{ size?: number }>;
  services: Service[];
  stats?: Stat[];
  infoCards?: { title: string; items: string[] }[];
  children?: React.ReactNode;
}

export default function ModulePage({ id, name, tagline, color, colorHex, darkHex, bg, icon: Icon, services, stats, infoCards, children }: Props) {
  return (
    <div className="space-y-7 fade-in">
      {/* Module header */}
      <div className="rounded-2xl p-6 flex items-start justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${colorHex} 0%, ${darkHex} 100%)` }}>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Icon size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-white" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)" }}>{name}</h1>
              <p className="text-xs text-white/60" style={{ fontFamily: "var(--font-body)" }}>{tagline}</p>
            </div>
          </div>
          {stats && (
            <div className="flex flex-wrap gap-4 mt-2">
              {stats.map(s => (
                <div key={s.label}>
                  <p className="text-lg font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
                  <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
          <Icon size={32} />
        </div>
      </div>

      {/* Agent */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          Assistente {name}
        </p>
        <AgentWidget module={id} accent={color} />
      </div>

      {/* Services grid */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-faint)", fontFamily: "var(--font-body)" }}>
          Servizi disponibili
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {services.map(s => (
            <button key={s.label}
              className="p-4 rounded-xl border text-left card-hover fade-in group"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                {s.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.badgeColor ? `${s.badgeColor}18` : bg, color: s.badgeColor || color, fontFamily: "var(--font-body)" }}>
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm mb-0.5 group-hover:underline decoration-[var(--color-border)]"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{s.label}</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Info cards */}
      {infoCards && (
        <div className="grid sm:grid-cols-2 gap-4">
          {infoCards.map(card => (
            <div key={card.title} className="p-5 rounded-xl border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <h2 className="font-bold text-sm mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>{card.title}</h2>
              <ul className="space-y-1.5">
                {card.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                    <span style={{ color, marginTop: "2px" }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
