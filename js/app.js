// =============================================================
// app.js — macchina a stati che pilota le schermate del gioco
// =============================================================

const App = (() => {
  const STORAGE_KEY = "caccia_stato";
  const appEl = document.getElementById("app");

  const defaultState = {
    started: false,
    stageIndex: 0, // indice in TAPPE
    phase: "route", // 'route' | 'scan' | 'success' | 'final-route' | 'final'
    attempts: 0,
    scanEnteredAt: null,
  };

  let state = loadState();
  let helpTimer = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) return { ...defaultState, ...saved };
    } catch (e) {
      /* ignora, riparte da zero */
    }
    return { ...defaultState };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage non disponibile: il gioco funziona comunque, solo
         senza ripresa automatica dopo chiusura del browser */
    }
  }

  function setState(patch) {
    state = { ...state, ...patch };
    saveState();
    render();
  }

  function resetGame() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("caccia_geo_calibrazione");
    } catch (e) {}
    state = { ...defaultState };
    render();
  }

  // -----------------------------------------------------------
  // Schermate
  // -----------------------------------------------------------

  function screenIntro() {
    appEl.innerHTML = `
      <div class="screen screen-intro">
        <div class="intro-heart">&#10084;</div>
        <h1>Caccia al Tesoro</h1>
        <p class="lead">${CONFIG.coupleNames}, un piccolo viaggio ti aspetta:
          tre tappe, tre dettagli da scovare, un regalo alla fine del percorso.</p>
        <p class="hint">Per giocare servirà accesso a fotocamera e posizione:
          sono usati solo per guidarti lungo il percorso, qui, ora.</p>
        <button class="btn btn-primary" id="btn-start">Inizia il viaggio</button>
        ${CONFIG.testMode ? '<p class="test-badge">Modalità TEST attiva</p>' : ""}
      </div>
    `;
    document.getElementById("btn-start").addEventListener("click", onStart);
  }

  async function onStart() {
    // Richiesta "calda" del permesso di posizione, così viene concesso
    // subito. Non blocchiamo mai il gioco se viene negato.
    appEl.innerHTML = `<div class="screen screen-loading"><div class="spinner"></div><p>Un attimo…</p></div>`;
    await Geo.requestPermissionEarly();
    setState({ started: true, stageIndex: 0, phase: "route", attempts: 0 });
  }

  function screenRoute(tappa, isFinal) {
    const images = (isFinal ? FINALE.routeImages : tappa.routeImages) || [];
    const title = isFinal ? FINALE.title : tappa.title;
    const clue = isFinal
      ? "Ultimo passo: segui il percorso fino al negozio che ti aspetta."
      : tappa.clue;

    appEl.innerHTML = `
      <div class="screen screen-route">
        <h2>${title}</h2>
        <p class="clue">${clue}</p>
        <div class="route-images">
          ${images.map((src) => `<img src="${src}" alt="Percorso" class="route-img" />`).join("")}
        </div>
        <button class="btn btn-primary" id="btn-arrived">
          ${isFinal ? "Sono arrivata al negozio" : "Sono arrivata, voglio inquadrare"}
        </button>
      </div>
    `;
    document.getElementById("btn-arrived").addEventListener("click", () => {
      if (isFinal) {
        setState({ phase: "final" });
      } else {
        setState({ phase: "scan", attempts: 0, scanEnteredAt: Date.now() });
      }
    });
  }

  async function screenScan(tappa) {
    appEl.innerHTML = `
      <div class="screen screen-scan">
        <h2>${tappa.title}</h2>
        <p class="target-label">${tappa.targetLabel}</p>
        <p class="target-hint">${tappa.targetHint}</p>
        <div class="camera-wrap">
          <video id="camera-video" playsinline autoplay muted></video>
          <div class="reticle">
            <span class="corner tl"></span>
            <span class="corner tr"></span>
            <span class="corner bl"></span>
            <span class="corner br"></span>
          </div>
        </div>
        <p id="scan-feedback" class="scan-feedback"></p>
        <button class="btn btn-primary" id="btn-shoot">Inquadra e scatta</button>
        <p id="help-link" class="help-link hidden">
          <a href="#" id="link-help">Qualcosa non va? Continua comunque →</a>
        </p>
      </div>
    `;

    const video = document.getElementById("camera-video");
    const feedback = document.getElementById("scan-feedback");
    const btnShoot = document.getElementById("btn-shoot");
    const helpLink = document.getElementById("help-link");

    document.getElementById("link-help").addEventListener("click", (e) => {
      e.preventDefault();
      advanceAfterScan();
    });

    // Timer di cortesia: dopo 20s sullo schermo di scansione mostriamo
    // comunque il link di aiuto, indipendentemente dai tentativi falliti.
    clearTimeout(helpTimer);
    helpTimer = setTimeout(() => helpLink.classList.remove("hidden"), 20000);

    try {
      await Camera.start(video);
    } catch (err) {
      feedback.textContent =
        "Non riesco ad accedere alla fotocamera. Controlla di aver concesso il permesso nelle impostazioni del browser.";
      feedback.classList.add("error");
      helpLink.classList.remove("hidden");
      return;
    }

    btnShoot.addEventListener("click", async () => {
      btnShoot.disabled = true;
      feedback.classList.remove("error");
      feedback.textContent = "Sto analizzando…";

      // piccola pausa per dare la sensazione di un'analisi reale
      await new Promise((r) => setTimeout(r, 1400));

      const plausibility = Camera.capturePlausibility();
      const geoResult = await Geo.checkTappaLocation(tappa);
      const success = plausibility.plausible && geoResult.ok;

      if (success) {
        feedback.classList.remove("error");
        feedback.textContent = "Trovato! ✓";
        setTimeout(() => advanceAfterScan(), 500);
      } else {
        state.attempts += 1;
        feedback.textContent = "Non sono riuscita a riconoscerlo bene, riprova inquadrando meglio.";
        feedback.classList.add("error");
        btnShoot.disabled = false;
        if (state.attempts >= 2) {
          helpLink.classList.remove("hidden");
        }
      }
    });
  }

  function advanceAfterScan() {
    clearTimeout(helpTimer);
    Camera.stop();
    setState({ phase: "success" });
  }

  function screenSuccess(tappa) {
    appEl.innerHTML = `
      <div class="screen screen-success">
        <div class="success-check">&#10003;</div>
        <h2>${tappa.title} completata!</h2>
        <p class="lead">Hai trovato il dettaglio giusto.</p>
        <button class="btn btn-primary" id="btn-continue">Continua</button>
      </div>
    `;
    document.getElementById("btn-continue").addEventListener("click", () => {
      const next = state.stageIndex + 1;
      if (next < TAPPE.length) {
        setState({ stageIndex: next, phase: "route" });
      } else {
        setState({ stageIndex: TAPPE.length, phase: "final-route" });
      }
    });
  }

  function screenFinal() {
    appEl.innerHTML = `
      <div class="screen screen-final">
        <div class="intro-heart">&#10084;</div>
        <h1>${FINALE.title}</h1>
        <p class="lead">${FINALE.message}</p>
      </div>
    `;
  }

  // -----------------------------------------------------------
  // Render principale
  // -----------------------------------------------------------

  function render() {
    // se usciamo dalla schermata di scan, assicuriamoci che la
    // fotocamera venga sempre rilasciata
    if (state.phase !== "scan") {
      Camera.stop();
    }

    if (!state.started) {
      screenIntro();
      return;
    }

    if (state.stageIndex < TAPPE.length) {
      const tappa = TAPPE[state.stageIndex];
      if (state.phase === "route") screenRoute(tappa, false);
      else if (state.phase === "scan") screenScan(tappa);
      else if (state.phase === "success") screenSuccess(tappa);
      else screenRoute(tappa, false);
    } else {
      if (state.phase === "final") screenFinal();
      else screenRoute(null, true);
    }
  }

  function init() {
    render();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  return { init, resetGame };
})();

document.addEventListener("DOMContentLoaded", App.init);
