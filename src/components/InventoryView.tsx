import { CraftingPanel } from "@/components/CraftingPanel";
import { GameCard } from "@/components/GameCard";
import type { GameState } from "@/types/game";

type InventoryViewProps = {
  state: GameState;
  onCraft: (recipeId: string) => void;
  onUseInventory: (cardId: string) => void;
  onRemoveInventory: (index: number) => void;
};

export function InventoryView({
  state,
  onCraft,
  onUseInventory,
  onRemoveInventory,
}: InventoryViewProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Inventaire</h2>
          <span className="paper-pill">{state.inventory.length}/20</span>
        </div>
        {state.inventory.length === 0 ? (
          <div className="paper-note">
            <p className="handwritten">Ton inventaire est encore vide.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.inventory.map((card, index) => (
              <div key={`${card.id}-${index}`} className="space-y-2">
                <GameCard card={card} />
                <div className="grid grid-cols-2 gap-2">
                  {card.instantEffect && (
                    <button
                      type="button"
                      className="paper-button bg-[var(--yellow)]"
                      onClick={() => onUseInventory(card.id)}
                    >
                      Utiliser
                    </button>
                  )}
                  <button
                    type="button"
                    className="paper-button bg-white"
                    onClick={() => onRemoveInventory(index)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <CraftingPanel onCraft={onCraft} />
    </div>
  );
}
