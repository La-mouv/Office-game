import type {
  GameState,
  Incident,
  IncidentChoice,
  Milestone,
  MissionReward,
  Mission,
  OfficeLocation,
  Skill,
  Worker,
} from "@/types/incremental";
import { INCIDENTS } from "@/lib/incrementalData";

export type GameLanguage = "fr" | "en" | "es";

export const LANGUAGE_STORAGE_KEY = "office-village-language";

export const LANGUAGE_OPTIONS: ReadonlyArray<{ code: GameLanguage; flag: string; label: string }> = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

export const DEFAULT_LANGUAGE: GameLanguage = "fr";

type CopyMap<T> = Record<GameLanguage, T>;

type ChoiceCopy = {
  label: string;
  outcome: string;
};

type IncidentCopy = {
  title: string;
  description: string;
  options: Record<string, ChoiceCopy>;
};

type MissionCopy = {
  title: string;
  description: string;
};

type EntityCopy = {
  name: string;
  description: string;
};

type MilestoneCopy = {
  name?: string;
  title: string;
  description: string;
};

export type TranslationBundle = {
  locale: string;
  resources: Record<keyof GameState["resources"], string>;
  tutorial: {
    menuLabel: string;
    progress: (current: number, total: number) => string;
    skip: string;
    next: string;
    finish: string;
    steps: {
      title: string;
      body: string;
    }[];
  };
  welcome: {
    eyebrow: string;
    title: string;
    subtitle: string;
    playerLabel: string;
    playerPlaceholder: string;
    playerError: string;
    playerTakenError: string;
    playerReserveError: string;
    start: string;
    language: string;
    leaderboardTitle: string;
    leaderboardBadge: string;
    leaderboardLoading: string;
    leaderboardPlaceholder: string;
    leaderboardShowAll: string;
    leaderboardShowTop: (count: number) => string;
  };
  ui: {
    loading: string;
    menu: string;
    close: string;
    achievements: string;
    achievementsDialog: string;
    languageTitle: string;
    overview: string;
    colleagues: string;
    locations: string;
    combos: string;
    objective: string;
    objectiveDone: string;
    objectiveInProgress: string;
    goldenRuleTitle: string;
    goldenRule: string;
    save: string;
    load: string;
    autoSaveStatus: string;
    newGameConfirmTitle: string;
    newGameConfirmBody: string;
    cancel: string;
    time: string;
    newGame: string;
    toDo: string;
    doNow: string;
    reward: string;
    rewardDuring: (seconds: number) => string;
    journal: string;
    development: string;
    recruitment: string;
    expansion: string;
    talent: string;
    talentPlural: string;
    unlocked: string;
    collection: string;
    achievementWall: string;
    achievementCount: (current: number, total: number) => string;
    lockedAchievement: string;
    level: string;
    max: string;
    allWorkersInOffice: string;
    allLocationsInOffice: string;
    unlockedAt: (resource: string, amount: string) => string;
    noEffect: string;
    incidentTitle: string;
    activeIncident: string;
    unknownEffect: string;
    completionTitle: string;
    completionBody: string;
    endScreenEyebrow: string;
    endScreenTitle: string;
    endScreenBody: string;
    endPlayer: string;
    endTime: string;
    endRank: string;
    endLeaderboardReady: string;
    endLeaderboardSyncing: string;
    lossTitle: string;
    lossBody: string;
    keepPlaying: string;
    restart: string;
    emptyLog: string;
    milestone: string;
    combo: string;
    shopCategoryAria: string;
    hire: (cost: string) => string;
    buy: (cost: string) => string;
    buyTalent: (cost: string, label: string) => string;
    reputationRequired: (amount: string) => string;
  };
  effects: {
    production: (resource: string, value: string) => string;
    multiplier: (resource: string, value: string) => string;
    costReduction: (value: string) => string;
    incidentChance: (value: string) => string;
    autoClick: string;
    unlockAction: (action: string) => string;
  };
};

export type WelcomeCopy = TranslationBundle["welcome"];

const COPY: CopyMap<TranslationBundle> = {
  fr: {
    locale: "fr-FR",
    resources: {
      ideas: "Idées",
      budget: "Budget",
      ambiance: "Ambiance",
      reputation: "Réputation",
      chaos: "Chaos",
    },
    tutorial: {
      menuLabel: "Tutoriel",
      progress: (current, total) => `${current}/${total}`,
      skip: "Passer",
      next: "Suivant",
      finish: "Terminer",
      steps: [
        {
          title: "But du jeu",
          body:
            "Objectif : finir le plus vite possible. Pour gagner : 1 000 000 de réputation, le Bureau autonome, puis le combo final avec l’Agent IA. Simple sur le papier.",
        },
        {
          title: "Chrono",
          body:
            "Le chrono vit dans le Journal. Plus il reste petit, plus ton badge aura l’air compétent au leaderboard.",
        },
        {
          title: "Actions rapides",
          body:
            "Ces actions lancent la machine : clique, produis, recommence. Oui, c’est presque un process.",
        },
        {
          title: "Missions",
          body:
            "Les missions te disent quoi viser. Suis-les pour éviter le pilotage au doigt mouillé.",
        },
        {
          title: "Développement",
          body:
            "Ces cartes font grandir le bureau : collègues, salles, talents. Pour aller vite, il faut tout utiliser.",
        },
        {
          title: "Menu et incidents",
          body:
            "Le menu garde ce tuto sous la main. Les incidents, eux, gardent le chaos bien vivant. Bureau sous contrôle, enfin presque.",
        },
      ],
    },
    welcome: {
      eyebrow: "Open-space en crise permanente",
      title: "Office Village",
      subtitle: "Choisis ton badge, lance la partie, et essaie de sauver la boîte.",
      playerLabel: "Pseudo",
      playerPlaceholder: "Ton nom de bureau",
      playerError: "Entre un pseudo avant de passer le badge.",
      playerTakenError: "Pseudo déjà pris. Le badge est déjà sur un autre bureau.",
      playerReserveError: "Impossible de réserver ce pseudo. Le reporting bloque à l’accueil.",
      start: "Démarrer la partie",
      language: "Langue",
      leaderboardTitle: "Leaderboard",
      leaderboardBadge: "Branché",
      leaderboardLoading: "Connexion au reporting...",
      leaderboardPlaceholder: "En attente",
      leaderboardShowAll: "Voir tout le leaderboard",
      leaderboardShowTop: (count) => `Voir le top ${count}`,
    },
    ui: {
      loading: "Le stagiaire virtuel cherche les clés du bureau...",
      menu: "Menu",
      close: "Fermer",
      achievements: "Réussites",
      achievementsDialog: "Réussites débloquées",
      languageTitle: "Langue",
      overview: "Vue bureau",
      colleagues: "Collègues",
      locations: "Salles",
      combos: "Combos",
      objective: "Objectif",
      objectiveDone: "Validé",
      objectiveInProgress: "En cours",
      goldenRuleTitle: "Objectif",
      goldenRule:
        "Objectif : finir le plus vite possible. Pour gagner : 1 000 000 de réputation, le Bureau autonome, puis le combo final avec l’Agent IA. Simple sur le papier.",
      save: "Sauvegarder",
      load: "Charger",
      autoSaveStatus: "Sauvegarde automatique active",
      newGameConfirmTitle: "Nouvelle partie ?",
      newGameConfirmBody: "Ça remet la progression à zéro.",
      cancel: "Annuler",
      time: "Temps",
      newGame: "Nouvelle partie",
      toDo: "To-do",
      doNow: "À faire maintenant",
      reward: "Récompense :",
      rewardDuring: (seconds) => `Pendant ${seconds}s`,
      journal: "Journal",
      development: "Développement",
      recruitment: "Recrutement",
      expansion: "Aménagement",
      talent: "Talent",
      talentPlural: "Talents",
      unlocked: "Débloqué",
      collection: "Collection",
      achievementWall: "Mur des trophées",
      achievementCount: (current, total) => `${current}/${total} validés`,
      lockedAchievement: "Trophée masqué. Le bureau garde le dossier sous badge.",
      level: "Niv.",
      max: "Max",
      allWorkersInOffice: "Tout le monde est déjà dans l'open-space.",
      allLocationsInOffice: "Tous les espaces sont déjà ouverts.",
      unlockedAt: (resource, amount) => `Débloqué à ${amount} ${resource}`,
      noEffect: "Aucun effet. Le comité note quand même.",
      incidentTitle: "Incident",
      activeIncident: "Incident en cours",
      unknownEffect: "Effet à confirmer. Le bureau improvise.",
      completionTitle: "Bureau autonome lancé",
      completionBody:
        "La boîte tourne presque toute seule. Quelqu'un prépare déjà un reporting pour expliquer pourquoi.",
      endScreenEyebrow: "Reporting final",
      endScreenTitle: "Partie terminée",
      endScreenBody:
        "Le bureau est sauvé. Le comité de pilotage cherche déjà qui mettre dans le PowerPoint.",
      endPlayer: "Pseudo",
      endTime: "Temps final",
      endRank: "Position",
      endLeaderboardReady: "Classé",
      endLeaderboardSyncing: "Synchronisation",
      lossTitle: "Partie perdue",
      lossBody:
        "Ambiance à 0 % ou chaos à 100 %. Le comité de crise reprend la main, et personne n’a réservé la salle.",
      keepPlaying: "Continuer",
      restart: "Recommencer",
      emptyLog: "Rien à signaler. Même Teams respecte le silence.",
      milestone: "Palier",
      combo: "Combo",
      shopCategoryAria: "Choisir une catégorie de développement",
      hire: (cost) => `Acheter ${cost} €`,
      buy: (cost) => `Acheter ${cost} €`,
      buyTalent: (cost, label) => `Acheter ${cost} ${label}`,
      reputationRequired: (amount) => `${amount} réputation requise`,
    },
    effects: {
      production: (resource, value) => `${resource} +${value}/s`,
      multiplier: (resource, value) => `${resource} x${value}`,
      costReduction: (value) => `Coûts -${value}%`,
      incidentChance: (value) => `Incidents -${value}%`,
      autoClick: "Action auto",
      unlockAction: (action) => `Débloque ${action}`,
    },
  },
  en: {
    locale: "en-US",
    resources: {
      ideas: "Ideas",
      budget: "Budget",
      ambiance: "Mood",
      reputation: "Reputation",
      chaos: "Chaos",
    },
    tutorial: {
      menuLabel: "Tutorial",
      progress: (current, total) => `${current}/${total}`,
      skip: "Skip",
      next: "Next",
      finish: "Finish",
      steps: [
        {
          title: "Game goal",
          body:
            "Goal: finish as fast as possible. To win: 1,000,000 reputation, the Autonomous office, then the final combo with the AI Agent. Simple on paper.",
        },
        {
          title: "Timer",
          body:
            "The timer lives in the Log. The smaller it stays, the better your badge will look on the leaderboard.",
        },
        {
          title: "Quick actions",
          body:
            "These actions start the machine: click, produce, repeat. Yes, it is almost a process.",
        },
        {
          title: "Missions",
          body:
            "Missions tell you what to chase. Follow them to avoid managing by open-office instinct.",
        },
        {
          title: "Development",
          body:
            "These cards grow the office: colleagues, rooms, talents. If you want speed, use everything.",
        },
        {
          title: "Menu and incidents",
          body:
            "The menu keeps this tutorial close. Incidents keep chaos alive. Office under control, almost.",
        },
      ],
    },
    welcome: {
      eyebrow: "Open office in permanent crisis",
      title: "Office Village",
      subtitle: "Pick your badge, start the run, and try to save the company.",
      playerLabel: "Nickname",
      playerPlaceholder: "Your office name",
      playerError: "Enter a nickname before swiping the badge.",
      playerTakenError: "Nickname already taken. That badge is already on another desk.",
      playerReserveError: "Could not reserve this nickname. Reporting got stuck at reception.",
      start: "Start game",
      language: "Language",
      leaderboardTitle: "Leaderboard",
      leaderboardBadge: "Live",
      leaderboardLoading: "Connecting the reporting pipeline...",
      leaderboardPlaceholder: "Waiting",
      leaderboardShowAll: "View full leaderboard",
      leaderboardShowTop: (count) => `Show top ${count}`,
    },
    ui: {
      loading: "Hold on, the virtual intern is hunting for the office keys...",
      menu: "Menu",
      close: "Close",
      achievements: "Achievements",
      achievementsDialog: "Unlocked achievements",
      languageTitle: "Language",
      overview: "Office view",
      colleagues: "Colleagues",
      locations: "Rooms",
      combos: "Combos",
      objective: "Objective",
      objectiveDone: "Done",
      objectiveInProgress: "In progress",
      goldenRuleTitle: "Goal",
      goldenRule:
        "Goal: finish as fast as possible. To win: 1,000,000 reputation, the Autonomous office, then the final combo with the AI Agent. Simple on paper.",
      save: "Save",
      load: "Load",
      autoSaveStatus: "Autosave active",
      newGameConfirmTitle: "New game?",
      newGameConfirmBody: "This resets your progress.",
      cancel: "Cancel",
      time: "Time",
      newGame: "New game",
      toDo: "To-do",
      doNow: "Do now",
      reward: "Reward:",
      rewardDuring: (seconds) => `For ${seconds}s`,
      journal: "Log",
      development: "Development",
      recruitment: "Recruitment",
      expansion: "Expansion",
      talent: "Talent",
      talentPlural: "Talents",
      unlocked: "Unlocked",
      collection: "Collection",
      achievementWall: "Achievement wall",
      achievementCount: (current, total) => `${current}/${total} cleared`,
      lockedAchievement: "Hidden achievement. The office keeps that file behind a badge.",
      level: "Lvl",
      max: "Max",
      allWorkersInOffice: "Everyone is already in the open office.",
      allLocationsInOffice: "Every room is already open.",
      unlockedAt: (resource, amount) => `Unlocks at ${amount} ${resource}`,
      noEffect: "No effect. The committee writes it down anyway.",
      incidentTitle: "Incident",
      activeIncident: "Active incident",
      unknownEffect: "Effect pending. The office is improvising.",
      completionTitle: "Autonomous office online",
      completionBody:
        "The company almost runs itself now. Someone is already preparing a report to explain why.",
      endScreenEyebrow: "Final reporting",
      endScreenTitle: "Run complete",
      endScreenBody:
        "The office is saved. The steering committee is already looking for someone to put in the deck.",
      endPlayer: "Nickname",
      endTime: "Final time",
      endRank: "Rank",
      endLeaderboardReady: "Ranked",
      endLeaderboardSyncing: "Syncing",
      lossTitle: "Run lost",
      lossBody:
        "Mood at 0% or chaos at 100%. Crisis committee takes over, and nobody booked the room.",
      keepPlaying: "Keep playing",
      restart: "Restart",
      emptyLog: "Nothing to report. Even Teams is respecting the silence.",
      milestone: "Milestone",
      combo: "Combo",
      shopCategoryAria: "Choose a development category",
      hire: (cost) => `Hire ${cost} €`,
      buy: (cost) => `Buy ${cost} €`,
      buyTalent: (cost, label) => `Buy ${cost} ${label}`,
      reputationRequired: (amount) => `${amount} reputation required`,
    },
    effects: {
      production: (resource, value) => `${resource} +${value}/s`,
      multiplier: (resource, value) => `${resource} x${value}`,
      costReduction: (value) => `Costs -${value}%`,
      incidentChance: (value) => `Incidents -${value}%`,
      autoClick: "Auto action",
      unlockAction: (action) => `Unlocks ${action}`,
    },
  },
  es: {
    locale: "es-ES",
    resources: {
      ideas: "Ideas",
      budget: "Presupuesto",
      ambiance: "Ambiente",
      reputation: "Reputación",
      chaos: "Caos",
    },
    tutorial: {
      menuLabel: "Tutorial",
      progress: (current, total) => `${current}/${total}`,
      skip: "Saltar",
      next: "Siguiente",
      finish: "Terminar",
      steps: [
        {
          title: "Objetivo del juego",
          body:
            "Objetivo: terminar lo más rápido posible. Para ganar: 1.000.000 de reputación, la Oficina autónoma y el combo final con el Agente IA. Fácil en el PowerPoint.",
        },
        {
          title: "Cronómetro",
          body:
            "El cronómetro vive en el Registro. Cuanto más bajo se quede, mejor queda tu tarjeta en el leaderboard.",
        },
        {
          title: "Acciones rápidas",
          body:
            "Estas acciones arrancan la máquina: clic, producción, repetir. Sí, casi parece un proceso.",
        },
        {
          title: "Misiones",
          body:
            "Las misiones te dicen qué perseguir. Síguelas para no dirigir por intuición de open space.",
        },
        {
          title: "Desarrollo",
          body:
            "Estas cartas hacen crecer la oficina: colegas, salas, talentos. Si quieres ir rápido, úsalo todo.",
        },
        {
          title: "Menú e incidentes",
          body:
            "El menú guarda este tutorial a mano. Los incidentes mantienen vivo el caos. Oficina bajo control, casi.",
        },
      ],
    },
    welcome: {
      eyebrow: "Open space en crisis permanente",
      title: "Office Village",
      subtitle: "Elige tu tarjeta, empieza la partida e intenta salvar la empresa.",
      playerLabel: "Pseudo",
      playerPlaceholder: "Tu nombre de oficina",
      playerError: "Escribe un pseudo antes de pasar la tarjeta.",
      playerTakenError: "Pseudo ya ocupado. Esa tarjeta ya está en otro escritorio.",
      playerReserveError: "No se pudo reservar el pseudo. El reporting se quedó en recepción.",
      start: "Empezar partida",
      language: "Idioma",
      leaderboardTitle: "Leaderboard",
      leaderboardBadge: "Conectado",
      leaderboardLoading: "Conectando el reporting...",
      leaderboardPlaceholder: "En espera",
      leaderboardShowAll: "Ver todo el leaderboard",
      leaderboardShowTop: (count) => `Ver top ${count}`,
    },
    ui: {
      loading: "Espera, el becario virtual está buscando las llaves de la oficina...",
      menu: "Menú",
      close: "Cerrar",
      achievements: "Logros",
      achievementsDialog: "Logros desbloqueados",
      languageTitle: "Idioma",
      overview: "Vista oficina",
      colleagues: "Colegas",
      locations: "Salas",
      combos: "Combos",
      objective: "Objetivo",
      objectiveDone: "Validado",
      objectiveInProgress: "En curso",
      goldenRuleTitle: "Objetivo",
      goldenRule:
        "Objetivo: terminar lo más rápido posible. Para ganar: 1.000.000 de reputación, la Oficina autónoma y el combo final con el Agente IA. Fácil en el PowerPoint.",
      save: "Guardar",
      load: "Cargar",
      autoSaveStatus: "Guardado automático activo",
      newGameConfirmTitle: "¿Nueva partida?",
      newGameConfirmBody: "Esto reinicia tu progreso.",
      cancel: "Cancelar",
      time: "Tiempo",
      newGame: "Nueva partida",
      toDo: "Tareas",
      doNow: "Hacer ahora",
      reward: "Recompensa:",
      rewardDuring: (seconds) => `Durante ${seconds}s`,
      journal: "Registro",
      development: "Desarrollo",
      recruitment: "Contratación",
      expansion: "Expansión",
      talent: "Talento",
      talentPlural: "Talentos",
      unlocked: "Desbloqueado",
      collection: "Colección",
      achievementWall: "Muro de logros",
      achievementCount: (current, total) => `${current}/${total} validados`,
      lockedAchievement: "Logro oculto. La oficina guarda ese archivo con tarjeta.",
      level: "Nv.",
      max: "Máx.",
      allWorkersInOffice: "Todo el mundo ya está en el open space.",
      allLocationsInOffice: "Todos los espacios ya están abiertos.",
      unlockedAt: (resource, amount) => `Se desbloquea con ${amount} ${resource}`,
      noEffect: "Sin efecto. El comité lo apunta igual.",
      incidentTitle: "Incidente",
      activeIncident: "Incidente activo",
      unknownEffect: "Efecto por confirmar. La oficina improvisa.",
      completionTitle: "Oficina autónoma activada",
      completionBody:
        "La empresa casi funciona sola. Alguien ya prepara un informe para explicar por qué.",
      endScreenEyebrow: "Reporting final",
      endScreenTitle: "Partida terminada",
      endScreenBody:
        "La oficina está salvada. El comité ya busca a quién meter en el PowerPoint.",
      endPlayer: "Pseudo",
      endTime: "Tiempo final",
      endRank: "Posición",
      endLeaderboardReady: "Clasificado",
      endLeaderboardSyncing: "Sincronizando",
      lossTitle: "Partida perdida",
      lossBody:
        "Ambiente al 0 % o caos al 100 %. El comité de crisis toma el mando, y nadie reservó la sala.",
      keepPlaying: "Continuar",
      restart: "Reiniciar",
      emptyLog: "Nada que reportar. Hasta Teams respeta el silencio.",
      milestone: "Hito",
      combo: "Combo",
      shopCategoryAria: "Elegir una categoría de desarrollo",
      hire: (cost) => `Contratar ${cost} €`,
      buy: (cost) => `Comprar ${cost} €`,
      buyTalent: (cost, label) => `Comprar ${cost} ${label}`,
      reputationRequired: (amount) => `${amount} reputación requerida`,
    },
    effects: {
      production: (resource, value) => `${resource} +${value}/s`,
      multiplier: (resource, value) => `${resource} x${value}`,
      costReduction: (value) => `Costes -${value}%`,
      incidentChance: (value) => `Incidentes -${value}%`,
      autoClick: "Acción automática",
      unlockAction: (action) => `Desbloquea ${action}`,
    },
  },
};

const WORKER_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, EntityCopy>> = {
  en: {
    intern: {
      name: "Motivated intern",
      description: "Turns coffee into ideas, tickets, and slightly panicked Post-its.",
    },
    "tired-dev": {
      name: "Tired developer",
      description: "Ships code between two meetings that could have been emails.",
    },
    designer: {
      name: "Overloaded designer",
      description: "Adds clarity, style, and one more Figma file nobody will rename.",
    },
    manager: {
      name: "Inspiring manager",
      description: "Turns chaos into roadmap. Sometimes the roadmap wins.",
    },
    "senior-dev": {
      name: "Senior developer",
      description: "Refactors the mess before it becomes company culture.",
    },
    sales: {
      name: "Enthusiastic salesperson",
      description: "Sells the dream, the feature, and occasionally the next sprint.",
    },
    hr: {
      name: "Kind HR",
      description: "Keeps the mood alive while the process files a ticket.",
    },
    "office-manager": {
      name: "Office Manager",
      description: "Knows where the badges, rooms, and emotional first-aid kits are.",
    },
    "ai-agent": {
      name: "AI Agent",
      description: "Automates the grind and asks if the chaos has an API.",
    },
  },
  es: {
    intern: {
      name: "Becario motivado",
      description: "Convierte café en ideas, tickets y post-its ligeramente nerviosos.",
    },
    "tired-dev": {
      name: "Desarrollador agotado",
      description: "Entrega código entre dos reuniones que debieron ser emails.",
    },
    designer: {
      name: "Diseñadora saturada",
      description: "Aporta claridad, estilo y otro Figma que nadie renombrará.",
    },
    manager: {
      name: "Manager inspirador",
      description: "Convierte caos en roadmap. A veces gana el roadmap.",
    },
    "senior-dev": {
      name: "Desarrolladora senior",
      description: "Refactoriza el lío antes de que sea cultura de empresa.",
    },
    sales: {
      name: "Comercial entusiasta",
      description: "Vende el sueño, la feature y a veces el próximo sprint.",
    },
    hr: {
      name: "RR. HH. amable",
      description: "Mantiene vivo el ambiente mientras el proceso abre un ticket.",
    },
    "office-manager": {
      name: "Office Manager",
      description: "Sabe dónde están las tarjetas, las salas y el botiquín emocional.",
    },
    "ai-agent": {
      name: "Agente IA",
      description: "Automatiza la faena y pregunta si el caos tiene API.",
    },
  },
};

const LOCATION_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, EntityCopy>> = {
  en: {
    "starting-office": {
      name: "Starter desk",
      description: "Three chairs, a wobbly table, and ambition held together with tape.",
    },
    "coffee-machine": {
      name: "Coffee machine",
      description: "The real headquarters. Ideas queue here before stand-up.",
    },
    "open-space": {
      name: "Open office",
      description: "Productivity, keyboard noise, and controlled despair in one room.",
    },
    "project-room": {
      name: "Project room",
      description: "Where plans are born, then immediately challenged by reality.",
    },
    "relax-corner": {
      name: "Break corner",
      description: "The mood recovers here before the next urgent-not-priority email.",
    },
    "meeting-room": {
      name: "Meeting room",
      description: "Generates reputation, action plans, and mild existential doubt.",
    },
    "creative-studio": {
      name: "Creative studio",
      description: "Where wild concepts get a deadline and a shared folder.",
    },
    "client-desk": {
      name: "Client lobby",
      description: "Polished smiles, shaky demos, and reputation under fluorescent lights.",
    },
    "autonomous-office": {
      name: "Autonomous office",
      description: "The office runs itself. Management calls it a transformation plan.",
    },
  },
  es: {
    "starting-office": {
      name: "Mesa inicial",
      description: "Tres sillas, una mesa coja y ambición pegada con cinta.",
    },
    "coffee-machine": {
      name: "Máquina de café",
      description: "La sede real. Las ideas hacen cola aquí antes del stand-up.",
    },
    "open-space": {
      name: "Open space",
      description: "Productividad, teclados y desesperación controlada en una sala.",
    },
    "project-room": {
      name: "Sala de proyecto",
      description: "Donde nacen los planes y la realidad los interrumpe al instante.",
    },
    "relax-corner": {
      name: "Zona de descanso",
      description: "El ambiente se recupera aquí antes del próximo urgente-no-prioritario.",
    },
    "meeting-room": {
      name: "Sala de reuniones",
      description: "Genera reputación, planes de acción y dudas existenciales suaves.",
    },
    "creative-studio": {
      name: "Estudio creativo",
      description: "Donde las ideas locas reciben deadline y carpeta compartida.",
    },
    "client-desk": {
      name: "Recepción cliente",
      description: "Sonrisas pulidas, demos temblorosas y reputación bajo fluorescentes.",
    },
    "autonomous-office": {
      name: "Oficina autónoma",
      description: "La oficina funciona sola. Dirección lo llama plan de transformación.",
    },
  },
};

const ACTION_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, EntityCopy>> = {
  en: {
    brainstorm: {
      name: "Brainstorm",
      description: "Shake the room until ideas fall from the ceiling tiles.",
    },
    "coffee-break": {
      name: "Coffee break",
      description: "Refuel the team before the mood opens an incident ticket.",
    },
    "client-pitch": {
      name: "Client pitch",
      description: "Sell the vision while reality hides behind the projector.",
    },
  },
  es: {
    brainstorm: {
      name: "Brainstorming",
      description: "Sacude la sala hasta que caigan ideas del falso techo.",
    },
    "coffee-break": {
      name: "Pausa café",
      description: "Recarga al equipo antes de que el ambiente abra un ticket.",
    },
    "client-pitch": {
      name: "Pitch cliente",
      description: "Vende la visión mientras la realidad se esconde tras el proyector.",
    },
  },
};

const SKILL_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, EntityCopy>> = {
  en: {
    organization: {
      name: "Organization",
      description: "+10% ideas. The Post-its stop living their own lives.",
    },
    "efficient-meetings": {
      name: "Efficient meetings",
      description: "+20% global efficiency. Yes, a meeting can technically help.",
    },
    "postit-empire": {
      name: "Post-it empire",
      description: "+50% ideas. The wall is officially out of control.",
    },
    "green-plants": {
      name: "Green plants",
      description: "+5 mood. The plants judge less than the committee.",
    },
    "coffee-culture": {
      name: "Coffee culture",
      description: "+10 mood. Social fuel is now unlimited.",
    },
    "team-culture": {
      name: "Team culture",
      description: "Minimum mood 50. Bad vibes have to sign a charter.",
    },
    "pitch-deck": {
      name: "Pitch deck",
      description: "+10% reputation. The slides pretend to be modest.",
    },
    "clear-offer": {
      name: "Clear offer",
      description: "+20% budget. Even finance understands the sentence.",
    },
    "scale-up": {
      name: "Scale-up",
      description: "+50% budget and reputation. Reporting starts sweating.",
    },
  },
  es: {
    organization: {
      name: "Organización",
      description: "+10% ideas. Los post-its dejan de vivir por su cuenta.",
    },
    "efficient-meetings": {
      name: "Reuniones eficaces",
      description: "+20% eficiencia global. Sí, una reunión puede servir.",
    },
    "postit-empire": {
      name: "Imperio del Post-it",
      description: "+50% ideas. El muro queda oficialmente incontrolable.",
    },
    "green-plants": {
      name: "Plantas verdes",
      description: "+5 ambiente. Las plantas juzgan menos que el comité.",
    },
    "coffee-culture": {
      name: "Cultura café",
      description: "+10 ambiente. El combustible social pasa a ilimitado.",
    },
    "team-culture": {
      name: "Cultura de equipo",
      description: "Ambiente mínimo 50. El mal humor firma una carta.",
    },
    "pitch-deck": {
      name: "Pitch deck",
      description: "+10% reputación. Las slides fingen ser modestas.",
    },
    "clear-offer": {
      name: "Oferta clara",
      description: "+20% presupuesto. Hasta finanzas entiende la frase.",
    },
    "scale-up": {
      name: "Scale-up",
      description: "+50% presupuesto y reputación. El reporting empieza a sudar.",
    },
  },
};

const SYNERGY_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, EntityCopy>> = {
  en: {
    "caffeinated-dev": {
      name: "Caffeinated developer",
      description: "Coffee plus code. The roadmap pretends this was controlled.",
    },
    junior_team: {
      name: "Junior team",
      description: "Two motivated people, three Post-its, and a suspiciously optimistic plan.",
    },
    "permanent-brainstorm": {
      name: "Permanent brainstorm",
      description: "Ideas bounce around until someone dares to write them down.",
    },
    calm_team: {
      name: "Calm team",
      description: "The office exhales. Nobody sends a passive-aggressive email for a minute.",
    },
    business_pipeline: {
      name: "Business pipeline",
      description: "Sales and reception align. Somewhere, a forecast stops sweating.",
    },
    "office-autopilot": {
      name: "Office Autopilot",
      description: "The AI closes loops before the committee notices there were loops.",
    },
  },
  es: {
    "caffeinated-dev": {
      name: "Desarrollador cafeinado",
      description: "Café más código. El roadmap finge que estaba controlado.",
    },
    junior_team: {
      name: "Equipo junior",
      description: "Dos personas motivadas, tres post-its y un plan sospechosamente optimista.",
    },
    "permanent-brainstorm": {
      name: "Brainstorming permanente",
      description: "Las ideas rebotan hasta que alguien se atreve a escribirlas.",
    },
    calm_team: {
      name: "Equipo sereno",
      description: "La oficina respira. Nadie manda un email pasivo-agresivo por un minuto.",
    },
    business_pipeline: {
      name: "Pipeline comercial",
      description: "Ventas y recepción se alinean. Un forecast deja de sudar.",
    },
    "office-autopilot": {
      name: "Office Autopilot",
      description: "La IA cierra bucles antes de que el comité note que existían.",
    },
  },
};

const MILESTONE_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, MilestoneCopy>> = {
  en: {
    "ten-interns": {
      name: "Intern class",
      title: "Intern class",
      description: "Recruit 10 interns. Temporary badges suddenly look strategic. +10% global.",
    },
    "first-office": {
      name: "Real office",
      title: "Real office",
      description: "Build the open office. Noise rises, ideas too. +10% ideas.",
    },
    "happy-office": {
      name: "Good mood",
      title: "Good mood",
      description: "Reach 90 mood. Even the calendar feels less hostile. +10% reputation.",
    },
    "one-million-ideas": {
      name: "Idea machine",
      title: "Idea machine",
      description: "Earn 1,000,000 total ideas. The Post-it wall asks for a union. +20% ideas.",
    },
    "synergy-master": {
      name: "Combo office",
      title: "Combo office",
      description: "Discover 5 combos. The office pretends everything was planned. +20% global.",
    },
  },
  es: {
    "ten-interns": {
      name: "Promoción de becarios",
      title: "Promoción de becarios",
      description: "Recluta 10 becarios. La tarjeta temporal se vuelve estratégica. +10% global.",
    },
    "first-office": {
      name: "Oficina de verdad",
      title: "Oficina de verdad",
      description: "Construye el open space. Sube el ruido, y también las ideas. +10% ideas.",
    },
    "happy-office": {
      name: "Buen ambiente",
      title: "Buen ambiente",
      description: "Llega a 90 de ambiente. Hasta el calendario parece menos hostil. +10% reputación.",
    },
    "one-million-ideas": {
      name: "Máquina de ideas",
      title: "Máquina de ideas",
      description: "Consigue 1.000.000 ideas acumuladas. El muro de post-its pide sindicato. +20% ideas.",
    },
    "synergy-master": {
      name: "Oficina combo",
      title: "Oficina combo",
      description: "Descubre 5 combos. La oficina finge que todo estaba previsto. +20% global.",
    },
  },
};

const BOOST_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, EntityCopy>> = {
  en: {
    "pitch-spark": {
      name: "First pitch spark",
      description: "The pitch catches. Reputation puts on a blazer.",
    },
    "organized-desk": {
      name: "Tidy desk",
      description: "+15% global. The office briefly knows where things are.",
    },
    "brainstorm-rush": {
      name: "Post-it wall",
      description: "+25% ideas. The whiteboard enters crisis mode.",
    },
    "good-quarter": {
      name: "Good quarter",
      description: "+25% budget. Reporting straightens its tie.",
    },
    "fresh-recruits": {
      name: "Fresh energy",
      description: "+15% ideas. The onboarding deck is sweating.",
    },
    "good-vibes": {
      name: "Good vibes",
      description: "+20% reputation. Even HR sounds relieved.",
    },
    "skill-momentum": {
      name: "Sharpened team",
      description: "+15% global. The process briefly behaves.",
    },
    "team-flow": {
      name: "Team flow",
      description: "+15% global. The open office pretends it meant to do that.",
    },
  },
  es: {
    "pitch-spark": {
      name: "Impulso del primer pitch",
      description: "El pitch prende. La reputación se pone americana.",
    },
    "organized-desk": {
      name: "Mesa ordenada",
      description: "+15% global. La oficina sabe dónde están las cosas por un segundo.",
    },
    "brainstorm-rush": {
      name: "Muro de post-its",
      description: "+25% ideas. La pizarra entra en modo crisis.",
    },
    "good-quarter": {
      name: "Buen trimestre",
      description: "+25% presupuesto. El reporting se acomoda la corbata.",
    },
    "fresh-recruits": {
      name: "Nueva energía",
      description: "+15% ideas. El onboarding empieza a sudar.",
    },
    "good-vibes": {
      name: "Buena onda",
      description: "+20% reputación. Hasta RR. HH. suena aliviado.",
    },
    "skill-momentum": {
      name: "Equipo afilado",
      description: "+15% global. El proceso se porta bien un instante.",
    },
    "team-flow": {
      name: "Flow de equipo",
      description: "+15% global. El open space finge que era el plan.",
    },
  },
};

const INCIDENT_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, IncidentCopy>> = {
  en: {
    "coffee-noise": {
      title: "Suspicious coffee machine",
      description: "It coughs, whistles, and threatens morale. The open office freezes.",
      options: {
        repair: {
          label: "Fix it properly",
          outcome: "The machine survives. Coffee governance can stand down.",
        },
        hit: {
          label: "Tap it gently",
          outcome: "It works, somehow. Facilities is pretending not to see.",
        },
        ignore: {
          label: "Say it is normal",
          outcome: "Everyone doubts you, but caffeine keeps flowing.",
        },
      },
    },
    "wild-meeting": {
      title: "Rogue meeting",
      description: "A meeting spawned without agenda. Classic third-floor panic.",
      options: {
        accept: {
          label: "Accept",
          outcome: "You survive. The action plan has three owners and zero clarity.",
        },
        standup: {
          label: "Make it a 10-min stand-up",
          outcome: "The meeting shrinks. Productivity sends a cautious thumbs-up.",
        },
        email: {
          label: "Send an email instead",
          outcome: "The room stays free. The thread will haunt you later.",
        },
      },
    },
    "intern-blockchain": {
      title: "Intern's big idea",
      description: "The intern says blockchain with the confidence of a fresh deck.",
      options: {
        listen: {
          label: "Actually listen",
          outcome: "Surprise: there is one usable idea buried under the buzzwords.",
        },
        v2: {
          label: "Say 'we keep it for V2'",
          outcome: "The idea enters the sacred backlog, where legends nap.",
        },
        whiteboard: {
          label: "Give them the whiteboard",
          outcome: "The wall is full. Nobody knows if it is strategy or weather.",
        },
      },
    },
    "microwave-fish": {
      title: "Fish in the microwave",
      description: "The smell attacks the mood like an uninvited steering committee.",
      options: {
        windows: {
          label: "Open the windows",
          outcome: "Fresh air returns. So do the complaints, but softer.",
        },
        rule: {
          label: "Install an official rule",
          outcome: "A process is born. HR sheds one professional tear.",
        },
        printer: {
          label: "Blame the printer",
          outcome: "Nobody believes it, but blaming the printer remains tradition.",
        },
      },
    },
    "postit-wall": {
      title: "Unreadable Post-it wall",
      description: "The wall looks strategic, which means nobody can explain it.",
      options: {
        colors: {
          label: "Sort by color",
          outcome: "It looks organized. Meaning is still in a shared folder somewhere.",
        },
        "keep-all": {
          label: "Keep everything",
          outcome: "The wall becomes a monument to scope creep.",
        },
        photo: {
          label: "Take a photo and flee",
          outcome: "Documentation exists. Nobody will ever open it.",
        },
      },
    },
    "designer-redesign": {
      title: "Surprise art direction reboot",
      description: "The designer saw one pixel and now the whole brand is in danger.",
      options: {
        "give-time": {
          label: "Give them 30 minutes",
          outcome: "The redesign stays tiny. The deadline remains mostly alive.",
        },
        "keep-simple": {
          label: "Say 'keep it simple'",
          outcome: "A brave sentence. The Figma file has opinions.",
        },
        "design-sprint": {
          label: "Run a mini design sprint",
          outcome: "Everyone draws boxes. Somehow the mood improves.",
        },
      },
    },
    "sales-fake-feature": {
      title: "Sold feature that does not exist",
      description: "Sales promised tomorrow. Engineering just discovered today.",
      options: {
        pretend: {
          label: "Pretend it was planned",
          outcome: "The roadmap swallows it with a corporate smile.",
        },
        reframe: {
          label: "Gently reset expectations",
          outcome: "Reality joins the call. Slightly late, but welcome.",
        },
        prototype: {
          label: "Launch an express prototype",
          outcome: "Tape, code, and hope produce something demo-shaped.",
        },
      },
    },
    "demo-bug": {
      title: "Demo bug",
      description: "The bug waited for the client call. Respect the professionalism.",
      options: {
        "fix-live": {
          label: "Fix it live",
          outcome: "It works. Nobody breathes for twelve seconds.",
        },
        "call-it-beta": {
          label: "Say it is beta",
          outcome: "The ancient sentence works again. Reputation limps forward.",
        },
        "blame-cache": {
          label: "Blame browser cache",
          outcome: "A classic. The cache was innocent, obviously.",
        },
      },
    },
    "slack-fire": {
      title: "Slack on fire",
      description: "The channel is exploding. No one remembers the original question.",
      options: {
        mute: {
          label: "Mute the channel for 1h",
          outcome: "Peace returns. The unread badge is now a lifestyle choice.",
        },
        thread: {
          label: "Ask for a thread",
          outcome: "A thread appears. Civilization is not dead yet.",
        },
        "react-gif": {
          label: "Reply with a GIF",
          outcome: "Nobody is helped, but morale appreciates the gesture.",
        },
      },
    },
    "ai-too-motivated": {
      title: "AI Agent too motivated",
      description: "It suggests automating the automation. The office sweats.",
      options: {
        accept: {
          label: "Accept",
          outcome: "The AI eats a process and asks for dessert.",
        },
        refuse: {
          label: "Politely refuse",
          outcome: "You keep control. The AI writes a very calm note.",
        },
        "test-client": {
          label: "Test it on a client",
          outcome: "Bold. The client calls it innovation, so everyone relaxes.",
        },
      },
    },
  },
  es: {
    "coffee-noise": {
      title: "Máquina de café sospechosa",
      description: "Tose, silba y amenaza el ambiente. El open space se congela.",
      options: {
        repair: {
          label: "Arreglarla bien",
          outcome: "La máquina sobrevive. El comité del café puede calmarse.",
        },
        hit: {
          label: "Darle un toque suave",
          outcome: "Funciona, no se sabe cómo. Mantenimiento mira a otro lado.",
        },
        ignore: {
          label: "Decir que es normal",
          outcome: "Nadie te cree, pero la cafeína sigue fluyendo.",
        },
      },
    },
    "wild-meeting": {
      title: "Reunión salvaje",
      description: "Nació una reunión sin agenda. Pánico clásico del tercer piso.",
      options: {
        accept: {
          label: "Aceptar",
          outcome: "Sobrevives. El plan tiene tres responsables y cero claridad.",
        },
        standup: {
          label: "Convertirla en stand-up de 10 min",
          outcome: "La reunión encoge. La productividad manda un pulgar prudente.",
        },
        email: {
          label: "Enviar un email mejor",
          outcome: "La sala queda libre. El hilo te perseguirá luego.",
        },
      },
    },
    "intern-blockchain": {
      title: "Gran idea del becario",
      description: "El becario dice blockchain con confianza de PowerPoint recién hecho.",
      options: {
        listen: {
          label: "Escucharlo de verdad",
          outcome: "Sorpresa: hay una idea útil bajo las buzzwords.",
        },
        v2: {
          label: "Decir 'lo dejamos para V2'",
          outcome: "La idea entra en el backlog sagrado, donde duermen las leyendas.",
        },
        whiteboard: {
          label: "Darle la pizarra",
          outcome: "La pared está llena. Nadie sabe si es estrategia o clima.",
        },
      },
    },
    "microwave-fish": {
      title: "Pescado en el microondas",
      description: "El olor ataca el ambiente como un comité no invitado.",
      options: {
        windows: {
          label: "Abrir las ventanas",
          outcome: "Vuelve el aire fresco. También las quejas, pero más suaves.",
        },
        rule: {
          label: "Crear una regla oficial",
          outcome: "Nace un proceso. RR. HH. suelta una lágrima profesional.",
        },
        printer: {
          label: "Culpar a la impresora",
          outcome: "Nadie lo cree, pero culpar a la impresora es tradición.",
        },
      },
    },
    "postit-wall": {
      title: "Muro de post-its ilegible",
      description: "La pared parece estratégica, o sea que nadie puede explicarla.",
      options: {
        colors: {
          label: "Ordenar por color",
          outcome: "Parece organizado. El sentido sigue en alguna carpeta compartida.",
        },
        "keep-all": {
          label: "Conservarlo todo",
          outcome: "El muro se vuelve monumento al scope creep.",
        },
        photo: {
          label: "Hacer una foto y huir",
          outcome: "Hay documentación. Nadie la abrirá jamás.",
        },
      },
    },
    "designer-redesign": {
      title: "Rediseño sorpresa de DA",
      description: "La diseñadora vio un píxel y ahora toda la marca peligra.",
      options: {
        "give-time": {
          label: "Darle 30 minutos",
          outcome: "El rediseño queda pequeño. El deadline sigue más o menos vivo.",
        },
        "keep-simple": {
          label: "Decir 'mantenlo simple'",
          outcome: "Frase valiente. El Figma tiene opiniones.",
        },
        "design-sprint": {
          label: "Organizar un mini design sprint",
          outcome: "Todos dibujan cajas. De algún modo mejora el ambiente.",
        },
      },
    },
    "sales-fake-feature": {
      title: "Feature vendida que no existe",
      description: "Ventas prometió mañana. Ingeniería acaba de enterarse hoy.",
      options: {
        pretend: {
          label: "Fingir que estaba previsto",
          outcome: "El roadmap lo traga con sonrisa corporativa.",
        },
        reframe: {
          label: "Reajustar con cariño",
          outcome: "La realidad entra en la llamada. Tarde, pero bienvenida.",
        },
        prototype: {
          label: "Lanzar prototipo exprés",
          outcome: "Cinta, código y esperanza producen algo con forma de demo.",
        },
      },
    },
    "demo-bug": {
      title: "Bug de demo",
      description: "El bug esperó a la llamada cliente. Hay que respetar el oficio.",
      options: {
        "fix-live": {
          label: "Corregirlo en directo",
          outcome: "Funciona. Nadie respira durante doce segundos.",
        },
        "call-it-beta": {
          label: "Decir que es beta",
          outcome: "La frase ancestral funciona otra vez. La reputación avanza coja.",
        },
        "blame-cache": {
          label: "Culpar a la caché del navegador",
          outcome: "Un clásico. La caché era inocente, obviamente.",
        },
      },
    },
    "slack-fire": {
      title: "Slack en llamas",
      description: "El canal explota. Nadie recuerda la pregunta original.",
      options: {
        mute: {
          label: "Silenciar el canal 1h",
          outcome: "Vuelve la paz. La insignia de no leídos ya es estilo de vida.",
        },
        thread: {
          label: "Pedir que lo pasen a hilo",
          outcome: "Aparece un hilo. La civilización aún respira.",
        },
        "react-gif": {
          label: "Responder con un GIF",
          outcome: "No ayuda a nadie, pero el ánimo agradece el gesto.",
        },
      },
    },
    "ai-too-motivated": {
      title: "Agente IA demasiado motivado",
      description: "Propone automatizar la automatización. La oficina suda.",
      options: {
        accept: {
          label: "Aceptar",
          outcome: "La IA devora un proceso y pide postre.",
        },
        refuse: {
          label: "Rechazar con educación",
          outcome: "Mantienes el control. La IA escribe una nota muy calmada.",
        },
        "test-client": {
          label: "Probarlo con un cliente",
          outcome: "Audaz. El cliente lo llama innovación y todos se relajan.",
        },
      },
    },
  },
};

const MISSION_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, MissionCopy>> = {
  en: {
    "guided-first-intern": {
      title: "First hire",
      description: "Recruit the first pair of hands before planning turns into a crisis committee.",
    },
    "guided-first-ideas": {
      title: "A little brain fuel",
      description: "Collect 25 ideas. The Post-it wall needs its daily ration.",
    },
    "guided-first-pitch": {
      title: "First pitch",
      description: "Turn one decent idea into a client conversation that almost sounds credible.",
    },
    "guided-coffee-machine": {
      title: "Diplomatic coffee",
      description: "Build the coffee machine. Without it, the office negotiates with the void.",
    },
    "guided-first-skill": {
      title: "A real method",
      description: "Buy Organization. Chaos hates when someone finds the right file.",
    },
    "brainstorm-burst": {
      title: "Post-it downpour",
      description: "Run 3 brainstorms. The whiteboard wants to suffer usefully.",
    },
    "pitch-round": {
      title: "Small sales tour",
      description: "Run 2 client pitches. The markers will not fund themselves.",
    },
    "fresh-air": {
      title: "Breathable air",
      description: "Raise the mood. The plants are starting to read HR emails.",
    },
    "find-synergy": {
      title: "Collective spark",
      description: "Discover a new combo. The office loves when chaos becomes profitable.",
    },
  },
  es: {
    "guided-first-intern": {
      title: "Primera contratación",
      description: "Recluta el primer par de manos antes de que la planificación se vuelva comité de crisis.",
    },
    "guided-first-ideas": {
      title: "Un poco de materia gris",
      description: "Acumula 25 ideas. El muro de post-its reclama su ración diaria.",
    },
    "guided-first-pitch": {
      title: "El primer pitch",
      description: "Convierte una idea decente en una conversación cliente casi creíble.",
    },
    "guided-coffee-machine": {
      title: "Café diplomático",
      description: "Construye la máquina de café. Sin ella, la oficina negocia con el vacío.",
    },
    "guided-first-skill": {
      title: "Un método de verdad",
      description: "Compra Organización. El caos odia cuando alguien encuentra el archivo correcto.",
    },
    "brainstorm-burst": {
      title: "Lluvia de post-its",
      description: "Lanza 3 brainstormings. La pizarra quiere sufrir con utilidad.",
    },
    "pitch-round": {
      title: "Pequeña gira comercial",
      description: "Haz 2 pitchs cliente. Los rotuladores no se pagan solos.",
    },
    "fresh-air": {
      title: "Aire respirable",
      description: "Sube el ambiente. Las plantas empiezan a leer los emails de RR. HH.",
    },
    "find-synergy": {
      title: "Chispa colectiva",
      description: "Descubre un nuevo combo. La oficina adora cuando el caos se vuelve rentable.",
    },
  },
};

const FRENCH_MISSION_TITLE_TO_TEMPLATE: Record<string, string> = {
  "Première recrue": "guided-first-intern",
  "Un peu de matière grise": "guided-first-ideas",
  "Le premier pitch": "guided-first-pitch",
  "Café diplomatique": "guided-coffee-machine",
  "Une vraie méthode": "guided-first-skill",
  "Pluie de post-its": "brainstorm-burst",
  "Petite tournée commerciale": "pitch-round",
  "Air respirable": "fresh-air",
  "Éclair de génie collectif": "find-synergy",
};

const FRENCH_DYNAMIC_MISSION_TITLE_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, string>> = {
  en: {
    "Renfort demandé": "Reinforcement requested",
    "Le bureau pousse": "Office expansion",
    "La bonne habitude": "Good habit",
  },
  es: {
    "Renfort demandé": "Refuerzo solicitado",
    "Le bureau pousse": "La oficina crece",
    "La bonne habitude": "La buena costumbre",
  },
};

const DYNAMIC_MISSION_COPY: Record<
  Exclude<GameLanguage, "fr">,
  {
    "hire-team": (worker: string, amount: number) => MissionCopy;
    "build-next-room": (location: string) => MissionCopy;
    "unlock-skill": (skill: string) => MissionCopy;
  }
> = {
  en: {
    "hire-team": (worker: string, amount: number): MissionCopy => ({
      title: `More ${worker}`,
      description: `Hire ${amount} more ${worker.toLowerCase()} before the roadmap pretends everything is fine.`,
    }),
    "build-next-room": (location: string): MissionCopy => ({
      title: `Open ${location}`,
      description: `Open ${location.toLowerCase()} before someone books it without asking.`,
    }),
    "unlock-skill": (skill: string): MissionCopy => ({
      title: `Validate ${skill}`,
      description: `Unlock ${skill.toLowerCase()} before the process turns into office folklore.`,
    }),
  },
  es: {
    "hire-team": (worker: string, amount: number): MissionCopy => ({
      title: `Más ${worker}`,
      description: `Contrata ${amount} más de ${worker.toLowerCase()} antes de que el roadmap finja que todo va bien.`,
    }),
    "build-next-room": (location: string): MissionCopy => ({
      title: `Abrir ${location}`,
      description: `Abre ${location.toLowerCase()} antes de que alguien la reserve sin preguntar.`,
    }),
    "unlock-skill": (skill: string): MissionCopy => ({
      title: `Validar ${skill}`,
      description: `Desbloquea ${skill.toLowerCase()} antes de que el proceso sea leyenda de oficina.`,
    }),
  },
};

const KNOWN_LOG_COPY: Record<Exclude<GameLanguage, "fr">, Record<string, string>> = {
  en: {
    "Bienvenue dans Office Village. L’open-space respire encore, le chaos demande déjà un badge.":
      "Welcome to Office Village. The open office is still breathing; chaos is already asking for a badge.",
    "Office Village complet. Le comité de pilotage applaudit sans ouvrir le micro.":
      "Office Village complete. The steering committee claps without unmuting.",
  },
  es: {
    "Bienvenue dans Office Village. L’open-space respire encore, le chaos demande déjà un badge.":
      "Bienvenido a Office Village. El open space aún respira; el caos ya está pidiendo una tarjeta de acceso.",
    "Office Village complet. Le comité de pilotage applaudit sans ouvrir le micro.":
      "Office Village completado. El comité aplaude sin activar el micro.",
  },
};

const FRENCH_RESOURCE_KEYS: Record<string, keyof GameState["resources"]> = {
  Idées: "ideas",
  Budget: "budget",
  Ambiance: "ambiance",
  Réputation: "reputation",
  Chaos: "chaos",
};

export function isGameLanguage(value: string | null): value is GameLanguage {
  return value === "fr" || value === "en" || value === "es";
}

export function getCopy(language: GameLanguage): TranslationBundle {
  return COPY[language];
}

export function getResourceLabel(resource: keyof GameState["resources"], language: GameLanguage): string {
  return COPY[language].resources[resource];
}

export function getLocale(language: GameLanguage): string {
  return COPY[language].locale;
}

function shouldLocalize(language: GameLanguage): language is Exclude<GameLanguage, "fr"> {
  return language !== "fr";
}

function localizeEntity<T extends { id: string; name: string; description: string }>(
  entity: T,
  language: GameLanguage,
  source: Record<Exclude<GameLanguage, "fr">, Record<string, { name?: string; description?: string }>>,
): T {
  if (!shouldLocalize(language)) {
    return entity;
  }

  const copy = source[language][entity.id];

  if (!copy) {
    return entity;
  }

  return {
    ...entity,
    name: copy.name ?? entity.name,
    description: copy.description ?? entity.description,
  };
}

function localizeSkill(skill: Skill, language: GameLanguage): Skill {
  return localizeEntity(skill, language, SKILL_COPY);
}

function localizeBoost<T extends { id: string; name: string; description: string }>(
  boost: T,
  language: GameLanguage,
): T {
  return localizeEntity(boost, language, BOOST_COPY);
}

function localizeIncidentOption(
  option: IncidentChoice,
  incidentId: string,
  language: GameLanguage,
): IncidentChoice {
  if (!shouldLocalize(language)) {
    return option;
  }

  const copy = INCIDENT_COPY[language][incidentId]?.options[option.id];

  if (!copy) {
    return option;
  }

  return {
    ...option,
    label: copy.label,
    description: copy.outcome,
  };
}

function localizeIncident(incident: Incident, language: GameLanguage): Incident {
  if (!shouldLocalize(language)) {
    return incident;
  }

  const copy = INCIDENT_COPY[language][incident.id];

  if (!copy) {
    return incident;
  }

  return {
    ...incident,
    title: copy.title,
    description: copy.description,
    choices: incident.choices.map((choice) => localizeIncidentOption(choice, incident.id, language)),
  };
}

function localizeMissionReward(reward: MissionReward, language: GameLanguage): MissionReward {
  return {
    ...reward,
    boost: reward.boost ? localizeBoost(reward.boost, language) : undefined,
  };
}

function localizeMission(
  mission: Mission,
  language: GameLanguage,
  workers: Worker[],
  locations: OfficeLocation[],
  skills: Skill[],
): Mission {
  if (!shouldLocalize(language)) {
    return mission;
  }

  const staticCopy = MISSION_COPY[language][mission.templateId];
  let copy = staticCopy;

  if (!copy && mission.templateId === "hire-team" && mission.requirement.kind === "workerCount") {
    const requirement = mission.requirement;
    const worker = workers.find((item) => item.id === requirement.workerId);
    copy = DYNAMIC_MISSION_COPY[language]["hire-team"](
      worker?.name ?? requirement.workerId,
      requirement.count,
    );
  }

  if (
    !copy &&
    mission.templateId === "build-next-room" &&
    mission.requirement.kind === "locationOwned"
  ) {
    const requirement = mission.requirement;
    const location = locations.find((item) => item.id === requirement.locationId);
    copy = DYNAMIC_MISSION_COPY[language]["build-next-room"](
      location?.name ?? requirement.locationId,
    );
  }

  if (!copy && mission.templateId === "unlock-skill" && mission.requirement.kind === "skillUnlocked") {
    const requirement = mission.requirement;
    const skill = skills.find((item) => item.id === requirement.skillId);
    copy = DYNAMIC_MISSION_COPY[language]["unlock-skill"](skill?.name ?? requirement.skillId);
  }

  return {
    ...mission,
    title: copy?.title ?? mission.title,
    description: copy?.description ?? mission.description,
    reward: localizeMissionReward(mission.reward, language),
  };
}

function localizeMilestone(milestone: Milestone, language: GameLanguage): Milestone {
  if (!shouldLocalize(language)) {
    return milestone;
  }

  const copy = MILESTONE_COPY[language][milestone.id];

  if (!copy) {
    return milestone;
  }

  return {
    ...milestone,
    title: copy.title,
    description: copy.description,
  };
}

function translateByFrenchName(
  frenchName: string,
  language: Exclude<GameLanguage, "fr">,
  frenchEntities: Array<{ id: string; name: string }>,
  localizedEntities: Array<{ id: string; name: string }>,
): string {
  const source = frenchEntities.find((entity) => entity.name === frenchName);
  const localized = source ? localizedEntities.find((entity) => entity.id === source.id) : undefined;
  return localized?.name ?? frenchName;
}

function translateByFrenchTitle(
  frenchTitle: string,
  language: Exclude<GameLanguage, "fr">,
  frenchEntity: { id: string; title: string } | null,
  localizedEntity: { id: string; title: string } | null,
): string {
  if (frenchEntity?.title === frenchTitle && localizedEntity) {
    return localizedEntity.title;
  }

  const source = INCIDENTS.find((incident) => incident.title === frenchTitle);
  return source ? INCIDENT_COPY[language][source.id]?.title ?? frenchTitle : frenchTitle;
}

function translateMissionTitle(
  frenchTitle: string,
  language: Exclude<GameLanguage, "fr">,
  frenchMission: Mission | null,
  localizedMission: Mission | null,
): string {
  if (frenchMission?.title === frenchTitle && localizedMission) {
    return localizedMission.title;
  }

  const templateId = FRENCH_MISSION_TITLE_TO_TEMPLATE[frenchTitle];
  if (templateId) {
    return MISSION_COPY[language][templateId]?.title ?? frenchTitle;
  }

  return FRENCH_DYNAMIC_MISSION_TITLE_COPY[language][frenchTitle] ?? frenchTitle;
}

function localizeLogEntry(
  entry: string,
  language: GameLanguage,
  frenchState: GameState,
  localizedState: Pick<
    GameState,
    "workers" | "locations" | "synergies" | "manualActions" | "activeMission" | "activeIncident"
  >,
): string {
  if (!shouldLocalize(language)) {
    return entry;
  }

  const known = KNOWN_LOG_COPY[language][entry];

  if (known) {
    return known;
  }

  const workerJoin = /^(.+) rejoint le bureau\./.exec(entry);
  if (workerJoin) {
    const worker = translateByFrenchName(workerJoin[1], language, frenchState.workers, localizedState.workers);
    return language === "en"
      ? `${worker} joins the office. Someone adds a chair to the floor plan.`
      : `${worker} se une a la oficina. Alguien añade una silla al plano.`;
  }

  const action = /^Action lancée : (.+?)\./.exec(entry);
  if (action) {
    const actionName = translateByFrenchName(
      action[1],
      language,
      frenchState.manualActions,
      localizedState.manualActions,
    );
    const message =
      language === "en"
        ? `Action launched: ${actionName}. The office pretends to stay calm.`
        : `Acción lanzada: ${actionName}. La oficina finge mantener la calma.`;
    return message;
  }

  const combo = /^Combo découvert : (.+?)\./.exec(entry);
  if (combo) {
    const comboName = translateByFrenchName(combo[1], language, frenchState.synergies, localizedState.synergies);
    const message =
      language === "en"
        ? `Combo discovered: ${comboName}. The office pretends this was the plan.`
        : `Combo descubierto: ${comboName}. La oficina finge que era el plan.`;
    return message;
  }

  const incident = /^Incident bureau : (.+?)\./.exec(entry);
  if (incident) {
    const incidentTitle = translateByFrenchTitle(
      incident[1],
      language,
      frenchState.activeIncident,
      localizedState.activeIncident,
    );
    const message =
      language === "en"
        ? `Office incident: ${incidentTitle}. Calm just resigned.`
        : `Incidente de oficina: ${incidentTitle}. La calma acaba de dimitir.`;
    return message;
  }

  const mission = /^(?:Mission accomplie|Mission pliée) : (.+?)(?:\.| Le comité)/.exec(entry);
  if (mission) {
    const missionTitle = translateMissionTitle(mission[1], language, frenchState.activeMission, localizedState.activeMission);
    const message =
      language === "en"
        ? `Mission handled: ${missionTitle}. The steering committee claps on mute.`
        : `Misión resuelta: ${missionTitle}. El comité aplaude en silencio.`;
    return message;
  }

  return entry;
}

export function localizeGameState(state: GameState, language: GameLanguage): GameState {
  if (language === "fr") {
    return state;
  }

  const localizedWorkers = state.workers.map((worker) => localizeEntity(worker, language, WORKER_COPY));
  const localizedLocations = state.locations.map((location) => localizeEntity(location, language, LOCATION_COPY));
  const localizedManualActions = state.manualActions.map((action) => localizeEntity(action, language, ACTION_COPY));
  const localizedSkills = state.skills.map((skill) => localizeSkill(skill, language));
  const localizedSynergies = state.synergies.map((synergy) => localizeEntity(synergy, language, SYNERGY_COPY));
  const localizedActiveMission = state.activeMission
    ? localizeMission(state.activeMission, language, localizedWorkers, localizedLocations, localizedSkills)
    : null;

  const localizedState = {
    ...state,
    workers: localizedWorkers,
    locations: localizedLocations,
    manualActions: localizedManualActions,
    skills: localizedSkills,
    synergies: localizedSynergies,
    activeIncident: state.activeIncident ? localizeIncident(state.activeIncident, language) : null,
    activeMission: localizedActiveMission,
    milestones: state.milestones.map((milestone) => localizeMilestone(milestone, language)),
    activeBoosts: state.activeBoosts.map((boost) => localizeBoost(boost, language)),
  };

  return {
    ...localizedState,
    log: state.log.map((entry) => localizeLogEntry(entry, language, state, localizedState)),
  };
}

export function localizeResourceLabel(text: string, language: GameLanguage): string {
  const resourceKey = FRENCH_RESOURCE_KEYS[text];
  return resourceKey ? getResourceLabel(resourceKey, language) : text;
}

export { COPY as GAME_COPY };
