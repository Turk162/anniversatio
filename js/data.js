// =============================================================
// data.js — TUTTI I CONTENUTI DELLA CACCIA AL TESORO
// =============================================================
// Questo è l'UNICO file da modificare per i contenuti del gioco
// (testi, coordinate, immagini). Il resto del codice non cambia.
//
// TEMA: "La Signora in Giallo ad Otranto — Il mistero del regalo
// scomparso". La signora Fletcher accompagna la protagonista di
// indizio in indizio; il senso di ogni indovinello resta quello
// originale (personale, legato all'anniversario), solo raccontato
// in chiave investigativa.
//
// Percorso reale (Otranto):
//   Indizio n.1 (nessuna mappa, solo l'indovinello) → Porta a Terra
//   → mappa → Indizio n.2 (Monumento eroi e martiri 1480)
//   → mappa → Indizio n.3 (lampione sul Lungomare degli Eroi)
//   → mappa → Indizio n.4 (Cattedrale)
//   → mappa → soluzione del caso: Aromisia (regalo).
//
// Ogni tappa ha un campo `hintImage`: la foto mostrata SOLO quando
// uno scan fallisce ("Sei proprio sicura? La signora Fletcher forse
// ti consiglierebbe di cercare questo:"), come aiuto extra.
// =============================================================

const CONFIG = {
  // Tutte le tappe hanno coordinate reali fisse: modalità test
  // (auto-calibrazione sulla posizione attuale) disattivata.
  testMode: false,
  // Se true, il controllo GPS è completamente disattivato (ogni tappa si
  // sblocca subito, ovunque ci si trovi) — usalo per provare l'intero
  // flusso da casa senza dover raggiungere le location reali. Le
  // coordinate reali qui sotto restano intatte: rimetti a false prima
  // dell'evento vero, è l'unico interruttore da cambiare.
  skipGpsCheck: true,
  // Raggio di default (metri) entro cui il GPS "conferma" la tappa.
  // Ampio di proposito: il controllo GPS è volutamente permissivo e
  // non deve mai bloccare la sorpresa.
  defaultRadius: 80,
};

// Schermata di apertura: la locandina del "caso".
const INTRO = {
  coverImage: "assets/images/copertina.png",
  title: "La Signora in Giallo ad Otranto",
  subtitle: "Il mistero del regalo scomparso",
  lead:
    "Un regalo d'anniversario è scomparso da qualche parte tra le vie di Otranto. " +
    "La signora Fletcher ha già aperto il suo taccuino, ma questa volta le serve " +
    "un'assistente: quattro indizi, quattro luoghi, e un solo modo per risolvere il caso.",
  hint:
    "Ogni investigatrice ha i suoi strumenti: la fotocamera per raccogliere le prove e " +
    "la posizione per non perdere la strada. Concedili quando l'app te li chiede.",
  startButton: "Accetto il caso",
};

const TAPPE = [
  {
    id: 1,
    title: "Indizio n. 1",
    // Nessuna mappa per questo primo indizio: va risolto solo con
    // l'indovinello, come apertura del caso.
    clue:
      "«Si comincia sempre dal principio, mia cara» dice la signora Fletcher aprendo il " +
      "taccuino. «C'è un ingresso, non lontano dagli alberi, che porta alla storia di un " +
      "posto di mare pur partendo da un nome polveroso. Elementi diversi che si uniscono " +
      "per creare una storia comune... chi ti ricorda?»",
    targetLabel: "La prova da raccogliere",
    targetHint:
      "Tieni il soggetto al centro del riquadro e scatta: senza fotografia non c'è prova, " +
      "e senza prova non si va avanti.",
    routeImages: [],
    hintImage: "assets/images/tappa1-riferimento.png",
    gps: { lat: 40.14640176241202, lng: 18.490193677702766, radius: 80 },
  },
  {
    id: 2,
    title: "Indizio n. 2",
    clue:
      "«Fu lunga la lotta contro il Pascià» annota la signora Fletcher, «ma pur sconfitti " +
      "li ricordiamo, perché alla fine ci hanno creduto. Sconfitte, vittorie, difficoltà: " +
      "tutto costruisce la memoria di una vita insieme. Anche la vostra, se posso " +
      "permettermi.»",
    targetLabel: "La prova da raccogliere",
    targetHint: "Anche qui: inquadra bene il soggetto al centro e scatta.",
    routeImages: ["assets/images/tratto-1-2.png"],
    hintImage: "assets/images/tappa2-riferimento.png",
    gps: { lat: 40.14686328063995, lng: 18.49063147061505, radius: 80 },
  },
  {
    id: 3,
    title: "Indizio n. 3",
    clue:
      "«È l'ultima fonte di luce che osserva la distesa di blu» legge la signora Fletcher. " +
      "«La strada finisce, ma ti puoi fermare ad ammirare le innumerevoli possibilità che " +
      "lui illumina. Un bravo investigatore sa sempre quando fermarsi a guardare.»",
    targetLabel: "La prova da raccogliere",
    targetHint: "Inquadra bene il soggetto al centro e scatta.",
    routeImages: ["assets/images/tratto-2-3.png"],
    hintImage: "assets/images/tappa3-riferimento.png",
    gps: { lat: 40.14655642930042, lng: 18.49156803696568, radius: 80 },
  },
  {
    id: 4,
    title: "Indizio n. 4",
    clue:
      "«Una vita raccolta in un luogo sacro, e un albero che la racconta» mormora la " +
      "signora Fletcher. «Inquadra l'ingresso e, se vuoi, ricorda tutta quella passata " +
      "insieme: nei dettagli si nasconde sempre la soluzione.»",
    targetLabel: "L'ultima prova",
    targetHint: "Ultima prova prima della soluzione: inquadra bene e scatta.",
    routeImages: ["assets/images/tratto-3-4.png"],
    hintImage: "assets/images/tappa4-riferimento.png",
    gps: { lat: 40.14577479315327, lng: 18.49073716764695, radius: 80 },
  },
];

const FINALE = {
  id: "finale",
  // Attenzione: né `title`, né `routeTitle`, né i testi qui sotto devono
  // nominare il negozio — il nome compare solo nella rivelazione finale,
  // dopo l'ultimo scatto.
  title: "La soluzione del caso",
  routeTitle: "La soluzione del caso",
  routeImages: ["assets/images/tratto-4-negozio.png"],
  routeClue:
    "«Ci siamo, mia cara» dice la signora Fletcher richiudendo il taccuino di scatto. " +
    "«Ho messo insieme tutti gli indizi e ora so dove si nasconde il nostro regalo. È a " +
    "pochi passi da qui: segui il percorso fino in fondo.»",
  targetLabel: "Il luogo della soluzione",
  targetHint:
    "Inquadra bene l'insegna del locale davanti a te: è qui che l'indagine si chiude.",
  hintImage: "assets/images/tappa5-riferimento.png",
  // Coordinata reale di Aromisia.
  gps: { lat: 40.1456941285958, lng: 18.491972559712774, radius: 80 },
  revealTitle: "Caso risolto: Aromisia!",
  revealMessage:
    "«Il regalo non era mai scomparso, mia cara» sorride la signora Fletcher chiudendo il " +
    "taccuino. «Aspettava soltanto che tu ripercorressi i luoghi giusti. Entra pure: da " +
    "qui in poi il caso non è più mio.»",
  // Ultima riga: qui la voce torna a essere quella vera.
  revealSignature: "Buon anniversario, amore mio.",
};
