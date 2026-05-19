import type { CraftRecipe } from "@/types/game";

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "craft-productive-brainstorm",
    name: "Brainstorm productif",
    ingredientIds: ["post-it", "boss-mug"],
    resultCardId: "brainstorm-express",
    cost: { ideas: 2 },
    description: "Transforme un mug et des post-its en vraie séance d’idées.",
  },
  {
    id: "craft-relax-corner",
    name: "Coin détente",
    ingredientIds: ["green-plant", "comfortable-chair"],
    resultCardId: "relax-corner",
    cost: { budget: 15 },
    description: "Crée un espace de repos pour faire baisser le stress.",
  },
  {
    id: "craft-project-room-plus",
    name: "Salle projet améliorée",
    ingredientIds: ["whiteboard", "post-it"],
    resultCardId: "project-room",
    cost: { ideas: 5, budget: 20 },
    description: "Améliore fortement la production d’idées.",
  },
];
