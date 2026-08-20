// =============================================================
// data.js — TUTTI I CONTENUTI DELLA CACCIA AL TESORO
// =============================================================
// Questo è l'UNICO file che andrà modificato per i contenuti del
// gioco (indizi, coordinate, immagini dei percorsi, negozio finale).
// Il resto del codice non cambia.
//
// Percorso reale (Otranto):
//   Indizio iniziale (nessuna mappa, solo l'indovinello) → Tappa 1
//   (Porta a Terra) → mappa → Tappa 2 (Monumento eroi e martiri 1480)
//   → mappa → Tappa 3 (lampione sul Lungomare degli Eroi) → mappa →
//   Tappa 4 (Cattedrale) → mappa → Aromisia (traguardo/regalo).
//
// Ogni tappa ha un campo `hintImage`: è la foto mostrata SOLO quando
// uno scan fallisce ("Sei proprio sicura? La signora Flethcher forse
// ti consiglierebbe di cercare questo:"), come aiuto extra. Sono
// ancora placeholder generati automaticamente — vanno sostituiti con
// le foto reali (stesso nome file in assets/images/, oppure cambia i
// path qui sotto).
//
// Le immagini in `routeImages` sono ancora placeholder: verranno
// sostituite con i 4 screenshot reali di Google Maps (i "tratti" dopo
// il primo indizio risolto).
// =============================================================

const CONFIG = {
  // Tutte le tappe hanno ormai coordinate reali fisse: modalità test
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
  coupleNames: "Per te",
};

const TAPPE = [
  {
    id: 1,
    title: "Tappa 1",
    // Nessuna mappa per questa prima tappa: è l'indizio di apertura,
    // va trovata solo grazie all'indovinello.
    clue:
      "C'è un ingresso, non lontano dagli alberi, che porta alla storia di un posto di " +
      "mare pur partendo da un nome polveroso. Elementi diversi che si uniscono per " +
      "creare una storia comune... chi ti ricorda?",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint:
      "Inquadra bene l'elemento indicato dall'indizio: tienilo al centro del riquadro " +
      "e scatta quando è ben visibile e a fuoco.",
    routeImages: [],
    hintImage: "assets/images/tappa1-riferimento.png",
    gps: { lat: 40.14640176241202, lng: 18.490193677702766, radius: 80 },
  },
  {
    id: 2,
    title: "Tappa 2",
    clue:
      "Fu lunga la lotta contro il Pascià, ma pur sconfitti li ricordiamo, perché alla " +
      "fine ci hanno creduto. Sconfitte, vittorie, difficoltà: tutto costruisce la " +
      "memoria della nostra vita insieme.",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint: "Anche qui: inquadra bene l'elemento al centro e scatta.",
    routeImages: ["assets/images/tratto-1-2.png"],
    hintImage: "assets/images/tappa2-riferimento.png",
    gps: { lat: 40.14686328063995, lng: 18.49063147061505, radius: 80 },
  },
  {
    id: 3,
    title: "Tappa 3",
    clue:
      "È l'ultima fonte di luce che osserva la distesa di blu. La strada finisce, ma ti " +
      "puoi fermare ad ammirare le innumerevoli possibilità che lui illumina.",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint: "Inquadra bene l'elemento al centro e scatta.",
    routeImages: ["assets/images/tratto-2-3.png"],
    hintImage: "assets/images/tappa3-riferimento.png",
    gps: { lat: 40.14655642930042, lng: 18.49156803696568, radius: 80 },
  },
  {
    id: 4,
    title: "Tappa 4",
    clue:
      "Una vita raccolta in un luogo sacro. Un albero che la racconta. Inquadra " +
      "l'ingresso e, se vuoi, ricorda tutta quella passata insieme.",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint: "Ultimo scatto prima del traguardo: inquadra bene e conferma.",
    routeImages: ["assets/images/tratto-3-4.png"],
    hintImage: "assets/images/tappa4-riferimento.png",
    gps: { lat: 40.14577479315327, lng: 18.49073716764695, radius: 80 },
  },
];

const FINALE = {
  id: "finale",
  routeImages: ["assets/images/tratto-4-negozio.png"],
  routeTitle: "Il traguardo",
  routeClue: "Ultimo tratto: segui il percorso fino al traguardo finale.",
  targetLabel: "Il traguardo",
  targetHint:
    "Sei arrivata? Inquadra bene l'insegna del locale davanti a te per confermare di " +
    "essere nel posto giusto.",
  hintImage: "assets/images/tappa5-riferimento.png",
  // Coordinata reale di Aromisia.
  gps: { lat: 40.1456941285958, lng: 18.491972559712774, radius: 80 },
  revealTitle: "Sei arrivata da Aromisia!",
  revealMessage:
    "Hai seguito ogni indizio, hai trovato ogni dettaglio nascosto: il tuo regalo ti sta " +
    "aspettando qui dentro. Buon anniversario, amore mio.",
};
