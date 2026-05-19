# Office Village

Office Village est un incremental office builder cozy où tu fais grandir un petit bureau en machine à idées.

## Règles du jeu

### But du jeu

Ton objectif est de transformer un petit bureau en Office Village autonome.
Pour terminer la partie, tu dois :

- atteindre 1 000 000 de réputation ;
- construire le Bureau autonome ;
- débloquer la synergie Office Autopilot.

Quand l’objectif final est atteint, la partie peut continuer en mode sandbox.

### Ressources

Le jeu utilise 5 ressources principales :

- Idées : la matière première du bureau. Elles servent surtout à faire des pitchs client ;
- Budget : l’argent du bureau. Il sert à recruter, construire et améliorer ;
- Ambiance : le moral de l’équipe. Plus elle est haute, meilleure est la production ;
- Réputation : elle débloque de nouveaux personnages, lieux et skills ;
- Chaos : plus il monte, plus la production ralentit et plus les incidents arrivent vite.

Au départ, tu commences avec 50 de budget, 50 d’ambiance, 0 idée, 0 réputation et 0 chaos.

### Boucle principale

La boucle de base est :

1. Recruter un premier Stagiaire motivé ;
2. Gagner des idées automatiquement ;
3. Utiliser Brainstorm si tu veux gagner des idées plus vite ;
4. Utiliser Pitch client pour transformer 25 idées en budget et réputation ;
5. Utiliser le budget pour recruter, construire et améliorer ;
6. Utiliser la réputation pour débloquer de nouvelles options ;
7. Répéter jusqu’à créer un bureau autonome.

### Actions manuelles

Les actions manuelles donnent un petit coup de pouce, mais elles ont un temps d’attente avant de pouvoir être réutilisées :

- Brainstorm : donne 12 idées, avec 3 secondes de cooldown ;
- Pause café : donne 5 ambiance, avec 15 secondes de cooldown. Il faut avoir construit la Machine à café ;
- Pitch client : coûte 25 idées, donne 30 budget et 15 réputation, avec 20 secondes de cooldown.

### Personnages

Les personnages produisent automatiquement des ressources chaque seconde.
Par exemple, le Stagiaire motivé produit des idées, puis d’autres profils débloquent des effets plus forts.

Chaque personnage a :

- un coût en budget ;
- une condition de réputation pour être débloqué ;
- un niveau de 1 à 5 ;
- une production automatique.

Plus tu recrutes le même personnage, plus son prochain coût augmente.
Améliorer un personnage augmente fortement sa production.

### Lieux

Les lieux améliorent ton bureau.
Ils peuvent augmenter la production, améliorer l’ambiance, réduire le chaos ou débloquer des synergies.

Chaque lieu a :

- un coût en budget ;
- une condition de réputation ;
- un niveau maximum ;
- un effet sur le bureau.

Exemple : la Machine à café augmente l’ambiance et rend les idées plus efficaces.

### Réputation, talents et skills

La réputation sert à progresser dans la partie.
Quand ta réputation passe certains paliers, tu gagnes des points de talent.

Les points de talent permettent de débloquer des skills comme :

- Organisation : plus d’idées ;
- Réunions efficaces : meilleure production globale ;
- Plantes vertes : plus d’ambiance ;
- Offre claire : plus de budget ;
- Scale-up : gros bonus de budget et réputation.

### Synergies

Certaines combinaisons de personnages et de lieux débloquent automatiquement des synergies.
Une synergie est un bonus permanent.

Exemples :

- Développeur fatigué + Machine à café = production d’idées boostée ;
- 5 Stagiaires motivés + Open Space = bonus d’équipe junior ;
- Commercial enthousiaste + Accueil client = meilleur budget et meilleure réputation ;
- Agent IA + Bureau autonome = Office Autopilot.

### Missions et réussites

Le jeu propose des missions pour guider la progression.
Les premières missions t’apprennent les bases : recruter, accumuler des idées, faire un pitch, construire la Machine à café et débloquer Organisation.

Ensuite, des missions dynamiques apparaissent.
Elles peuvent demander de recruter, construire, lancer des actions manuelles, améliorer l’ambiance ou trouver des synergies.

Les réussites donnent aussi des bonus permanents quand tu atteins certains objectifs.

### Incidents

Des incidents peuvent apparaître pendant la partie.
Ils demandent de choisir une réponse.
Chaque choix peut modifier tes ressources : budget, ambiance, réputation, idées ou chaos.

Plus le chaos est haut, plus les incidents arrivent souvent.
Certaines réponses sont sûres, d’autres ont une chance de réussite ou d’échec.

### Ambiance et chaos

L’ambiance et le chaos influencent directement la production :

- ambiance haute : production meilleure ;
- ambiance basse : production plus faible ;
- chaos haut : production ralentie ;
- chaos très haut : incidents plus fréquents.

Une bonne stratégie consiste à faire grandir le bureau sans laisser le chaos exploser.

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
