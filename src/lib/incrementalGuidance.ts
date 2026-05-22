import type { GameState } from "@/types/incremental";

export type OfficeGuidance = {
  title: string;
  actionLabel: string;
  description: string;
};

export function getOfficeGuidance(state: GameState): OfficeGuidance {
  const intern = state.workers.find((worker) => worker.id === "intern");
  const coffeeMachine = state.locations.find((location) => location.id === "coffee-machine");
  const tiredDev = state.workers.find((worker) => worker.id === "tired-dev");
  const openSpace = state.locations.find((location) => location.id === "open-space");

  if ((intern?.count ?? 0) === 0) {
    return {
      title: "Commence ici",
      actionLabel: "Recrute ton premier stagiaire",
      description:
        "Les personnages fabriquent des idées automatiquement. Le stagiaire est ton premier moteur.",
    };
  }

  if (state.totalReputationEarned === 0 && state.resources.ideas < 25) {
    return {
      title: "Fais monter les idées",
      actionLabel: "Attends ou clique Brainstorm",
      description:
        "Quand tu auras 25 idées, tu pourras les transformer en argent et réputation.",
    };
  }

  if (state.totalReputationEarned === 0) {
    return {
      title: "Transforme tes idées",
      actionLabel: "Utilise Pitch client",
      description:
        "Pitch client dépense 25 idées pour gagner du budget et de la réputation. C’est la boucle de départ.",
    };
  }

  if (!coffeeMachine?.owned) {
    return {
      title: "Premier vrai boost",
      actionLabel: "Construis la Machine à café",
      description:
        "Elle arrive vite, augmente l’ambiance et rend toutes tes idées plus rentables.",
    };
  }

  if ((tiredDev?.count ?? 0) === 0) {
    return {
      title: "Passe à l’étape suivante",
      actionLabel: "Recrute un Développeur fatigué",
      description:
        "Il produit beaucoup plus d’idées que le stagiaire. La partie commence à s’accélérer.",
    };
  }

  if (!openSpace?.owned) {
    return {
      title: "Construis ton équipe",
      actionLabel: "Ouvre l’Open Space",
      description:
        "Il booste les idées et prépare ton premier vrai combo d’équipe.",
    };
  }

  return {
    title: "Boucle principale",
    actionLabel: "Achète → optimise → débloque",
    description:
      "Garde l’ambiance haute, limite le chaos et cherche les combinaisons qui ouvrent des combos.",
  };
}
