import type { GameState } from "@/types/game";

export type GameView = "office" | "inventory" | "skills" | "projects";

type SidebarProps = {
  activeView: GameView;
  state: GameState;
  onViewChange: (view: GameView) => void;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
};

const VIEWS: { id: GameView; label: string; emoji: string }[] = [
  { id: "office", label: "Bureau", emoji: "🏢" },
  { id: "inventory", label: "Inventaire & Craft", emoji: "🎒" },
  { id: "skills", label: "Skill Tree", emoji: "🌳" },
  { id: "projects", label: "Projets", emoji: "🚀" },
];

export function Sidebar({
  activeView,
  state,
  onViewChange,
  onNewGame,
  onSave,
  onLoad,
}: SidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-4 border-r-[3px] border-black bg-white/80 p-4 lg:w-64">
      <div>
        <p className="handwritten text-sm">Tableau vivant</p>
        <h1 className="text-3xl font-black tracking-tight">Office Village</h1>
      </div>

      <nav className="grid gap-2">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onViewChange(view.id)}
            className={`paper-button justify-start ${
              activeView === view.id ? "bg-[var(--yellow)]" : "bg-white"
            }`}
          >
            <span>{view.emoji}</span>
            {view.label}
          </button>
        ))}
      </nav>

      <div className="paper-note space-y-2">
        <h2 className="font-black">Ressources secondaires</h2>
        <p>🗒️ Post-its : {state.resources.postIts}</p>
        <p>🌱 Talent : {state.resources.talentPoints}</p>
        <p>🃏 Main : {state.hand.length}/8</p>
      </div>

      <div className="paper-note space-y-2 bg-[var(--yellow-soft)]">
        <h2 className="font-black">Astuce du jour</h2>
        <p className="handwritten text-sm">
          Le bonheur rend le bureau plus productif. Le stress, lui, finit toujours par demander sa facture.
        </p>
      </div>

      <div className="mt-auto grid gap-2">
        <button type="button" className="paper-button bg-white" onClick={onSave}>
          💾 Sauvegarder
        </button>
        <button type="button" className="paper-button bg-white" onClick={onLoad}>
          📂 Charger
        </button>
        <button type="button" className="paper-button bg-[var(--pink)]" onClick={onNewGame}>
          🔄 Nouvelle partie
        </button>
      </div>
    </aside>
  );
}
