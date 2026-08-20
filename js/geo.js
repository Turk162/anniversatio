// =============================================================
// geo.js — Geolocalizzazione: distanza, controllo "soft" per tappa
// =============================================================
// Il controllo GPS non deve MAI bloccare il gioco: se il permesso è
// negato, il segnale è impreciso o manca del tutto, il flusso deve
// poter proseguire comunque (vedi fallback "hai bisogno di aiuto?"
// in camera.js / app.js). Il GPS qui serve solo a rinforzare
// l'illusione del riconoscimento, non è un cancello rigido.

const Geo = (() => {
  const STORAGE_KEY = "caccia_geo_calibrazione";

  function loadCalibrations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveCalibrations(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage non disponibile: ignora, non è bloccante */
    }
  }

  // Formula di Haversine: distanza in metri tra due coordinate
  function distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function getCurrentPosition(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("geolocation-unsupported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
      );
    });
  }

  // Verifica "soft" della posizione per una tappa.
  // Ritorna sempre un oggetto { ok, reason, distance } e non lancia
  // mai eccezioni bloccanti: in caso di problemi ok=true con
  // reason che spiega perché non è stato possibile verificare
  // (il chiamante decide comunque di procedere).
  async function checkTappaLocation(tappa) {
    if (CONFIG.skipGpsCheck) {
      return { ok: true, reason: "gps-disattivato-per-test" };
    }
    if (!tappa || !tappa.gps) {
      return { ok: true, reason: "nessun-vincolo-gps" };
    }

    try {
      const current = await getCurrentPosition();

      if (tappa.gps.useCurrentLocationAsTarget) {
        // Modalità TEST: la prima posizione rilevata per questa tappa
        // diventa il bersaglio, così il test funziona ovunque tu sia.
        const calibrations = loadCalibrations();
        const key = "tappa-" + tappa.id;
        if (!calibrations[key]) {
          calibrations[key] = current;
          saveCalibrations(calibrations);
          return { ok: true, reason: "calibrazione-test-effettuata", distance: 0 };
        }
        const target = calibrations[key];
        const dist = distanceMeters(current.lat, current.lng, target.lat, target.lng);
        const radius = tappa.gps.radius || CONFIG.defaultRadius;
        return { ok: dist <= radius, reason: "test", distance: dist };
      }

      if (typeof tappa.gps.lat === "number" && typeof tappa.gps.lng === "number") {
        const dist = distanceMeters(current.lat, current.lng, tappa.gps.lat, tappa.gps.lng);
        const radius = tappa.gps.radius || CONFIG.defaultRadius;
        return { ok: dist <= radius, reason: "reale", distance: dist };
      }

      return { ok: true, reason: "config-gps-incompleta" };
    } catch (err) {
      // Permesso negato, timeout, o non supportato: non blocchiamo mai.
      return { ok: true, reason: "gps-non-disponibile" };
    }
  }

  async function requestPermissionEarly() {
    // Richiesta "calda" dei permessi all'avvio, così l'utente li concede
    // subito e non viene interrotto più avanti nel gioco.
    try {
      await getCurrentPosition(6000);
      return true;
    } catch (e) {
      return false;
    }
  }

  return { distanceMeters, checkTappaLocation, requestPermissionEarly, getCurrentPosition };
})();
