# Office Village

Office Village est un incremental office builder cozy où tu fais grandir un petit bureau en machine à idées.

## Ce qui est déjà jouable

- voir les ressources monter automatiquement chaque seconde ;
- recruter des personnages avec un coût progressif ;
- construire et améliorer des lieux ;
- débloquer des synergies automatiques ;
- gérer des incidents absurdes avec des choix ;
- utiliser quelques actions manuelles avec cooldown ;
- débloquer des skills et des milestones ;
- sauvegarder et recharger localement ;
- atteindre l’objectif final puis continuer en sandbox.

## Lancer le jeu

```bash
npm install
npm run dev
```

Puis ouvre l’URL indiquée par Next.js, en général `http://localhost:3000`.

## Vérifier le projet

```bash
npm test
npm run build
```

## Architecture

- `src/lib/` : règles du jeu, données incrémentales, sauvegarde ;
- `src/components/` : interface du jeu ;
- `src/types/` : types TypeScript partagés ;
- `tests/` : tests déterministes du moteur de jeu.

## Limites volontaires de cette V1

- pas de backend ;
- pas de backend ;
- pas d’assets externes ;
- l’ancien prototype deckbuilder reste dans le code, mais la partie visible est maintenant incrémentale ;
- priorité donnée à une boucle claire, jouable et stable plutôt qu’au polish.

## Idées pour une V2

- équilibrage plus fin ;
- plus d’incidents ;
- sons doux ;
- achievements visuels plus riches ;
- export JSON ;
- animations plus généreuses.
