import { Sparkles } from "lucide-react";
import { AppRoute, navItems } from "../../app/routes";

export function TopBar({ route, setRoute, onOpenDrawer }: { route: AppRoute; setRoute: (route: AppRoute) => void; onOpenDrawer: () => void }) {
  const reference = navItems.filter(item => ["grammar","tables","vocabulary","phrases","audio","qa"].includes(item.view));
  const primary = navItems.filter(item => !reference.includes(item));
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={() => setRoute({ view: "home" })}>
        <span className="brand-mark" aria-hidden="true"><i className="flag-kz" /><i className="flag-ua" /></span>
        <span><strong>Казахська через українську</strong><small>інтерактивний курс</small></span>
      </button>
      <nav className="topnav" aria-label="Головна навігація">
        {primary.map((item) => (
          <button key={item.view} className={route.view === item.view ? "active" : ""} onClick={() => setRoute({ view: item.view })}>{item.label}</button>
        ))}
        <select className="reference-select" aria-label="Довідники та аудіо" value={reference.find(item=>item.view===route.view)?.view ?? ""}
          onChange={event=>{const item=reference.find(item=>item.view===event.target.value);if(item)setRoute({view:item.view});}}>
          <option value="" disabled>Довідники</option>
          {reference.map(item=><option key={item.view} value={item.view}>{item.label}</option>)}
        </select>
      </nav>
      <div className="top-actions">
        <button className="reference-button" onClick={onOpenDrawer}><Sparkles size={18} /> Довідка</button>
      </div>
    </header>
  );
}
