import { Sparkles } from "lucide-react";
import { AppRoute, navItems } from "../../app/routes";

export function TopBar({ route, setRoute, onOpenDrawer }: { route: AppRoute; setRoute: (route: AppRoute) => void; onOpenDrawer: () => void }) {
  return (
    <header className="topbar">
      <div className="brand" onClick={() => setRoute({ view: "home" })}>
        <span className="brand-mark" aria-hidden="true"><i className="flag-kz" /><i className="flag-ua" /></span>
        <span><strong>Казахська через українську</strong><small>інтерактивний курс</small></span>
      </div>
      <nav className="topnav" aria-label="Головна навігація">
        {navItems.map((item) => (
          <button key={item.view} className={route.view === item.view ? "active" : ""} onClick={() => setRoute({ view: item.view })}>{item.label}</button>
        ))}
      </nav>
      <div className="top-actions">
        <button className="reference-button" onClick={onOpenDrawer}><Sparkles size={18} /> Довідка</button>
      </div>
    </header>
  );
}
