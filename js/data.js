// =============================================================
// data.js — TUTTI I CONTENUTI DELLA CACCIA AL TESORO
// =============================================================
// Questo è l'UNICO file che andrà modificato per passare dai
// contenuti di TEST a quelli REALI (indizi, coordinate, immagini
// dei percorsi, negozio finale). Il resto del codice non cambia.
//
// MODALITÀ TEST vs REALE
// -----------------------
// CONFIG.testMode = true  → ogni tappa che ha
//     gps.useCurrentLocationAsTarget = true
//   NON usa coordinate fisse: la prima volta che l'app chiede la
//   posizione in quella tappa, "fotografa" la posizione attuale e
//   la userà come bersaglio per il controllo GPS di quella tappa
//   in questa sessione. Così puoi testare TUTTO il flusso reale
//   (permessi, GPS, fotocamera, animazioni, fallback) restando
//   dove ti trovi ora, senza dover raggiungere i luoghi veri.
//
// Quando potrai raggiungere i luoghi reali:
//   1. Metti CONFIG.testMode = false
//   2. Per ogni tappa, sostituisci gps: { useCurrentLocationAsTarget: true }
//      con coordinate fisse, es: gps: { lat: 40.1495, lng: 18.4715, radius: 80 }
//      (le coordinate si ottengono da Google Maps: tieni premuto sul
//      punto esatto sulla mappa → appare "lat, lng" da copiare)
//   3. Sostituisci le immagini in assets/images/ con i veri screenshot
//      dei percorsi (stesso nome file, o cambia i path qui sotto)
//   4. Scrivi i testi reali degli indizi
// =============================================================

const CONFIG = {
  testMode: true,
  // Raggio di default (metri) entro cui il GPS "conferma" la tappa.
  // Ampio di proposito: niente sopralluogo reale è stato fatto sui
  // luoghi veri, quindi il controllo GPS è volutamente permissivo
  // e non deve mai bloccare la sorpresa.
  defaultRadius: 80,
  coupleNames: "Per te",
};

const TAPPE = [
  {
    id: 1,
    title: "Tappa 1",
    clue:
      "Il vostro viaggio inizia da qui. Segui il percorso e raggiungi il primo punto: " +
      "cerca un dettaglio ben preciso della strada, qualcosa che racconta una storia " +
      "di altri tempi scolpita nella pietra.",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint:
      "Inquadra bene l'elemento indicato dall'indizio: tienilo al centro del riquadro " +
      "e scatta quando è ben visibile e a fuoco.",
    routeImages: ["assets/images/tratto-0-1.png"],
    gps: { useCurrentLocationAsTarget: true, radius: 80 },
  },
  {
    id: 2,
    title: "Tappa 2",
    clue:
      "Ben fatto! Ora segui il nuovo percorso: la prossima tappa nasconde un altro " +
      "piccolo segreto lungo la strada, tienilo d'occhio.",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint: "Anche qui: inquadra bene l'elemento al centro e scatta.",
    routeImages: ["assets/images/tratto-1-2.png"],
    gps: { useCurrentLocationAsTarget: true, radius: 80 },
  },
  {
    id: 3,
    title: "Tappa 3",
    clue:
      "Ultima tappa prima del traguardo. Segui il percorso fino all'ultimo dettaglio " +
      "da fotografare.",
    targetLabel: "Il dettaglio da inquadrare",
    targetHint: "Ultimo scatto: inquadra bene e conferma.",
    routeImages: ["assets/images/tratto-2-3.png"],
    gps: { useCurrentLocationAsTarget: true, radius: 80 },
  },
];

const FINALE = {
  routeImages: ["assets/images/tratto-3-negozio.png"],
  title: "Sei arrivata!",
  message:
    "Hai seguito ogni indizio, hai trovato ogni dettaglio nascosto: ora il tuo regalo " +
    "ti sta aspettando qui dentro. Buon anniversario, amore mio.",
};
