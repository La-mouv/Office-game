import { CRAFT_RECIPES } from "@/lib/recipes";

export function CraftingPanel({
  onCraft,
}: {
  onCraft: (recipeId: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black">Craft</h2>
      <div className="grid gap-3 xl:grid-cols-3">
        {CRAFT_RECIPES.map((recipe) => (
          <div key={recipe.id} className="paper-note bg-white">
            <h3 className="font-black">{recipe.name}</h3>
            <p className="handwritten mt-2 text-sm">{recipe.description}</p>
            <p className="mt-3 text-xs">Ingrédients : {recipe.ingredientIds.join(" + ")}</p>
            <button
              type="button"
              className="paper-button mt-3 bg-[var(--yellow)]"
              onClick={() => onCraft(recipe.id)}
            >
              Fabriquer
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
