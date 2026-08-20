// =============================================================
// app.js — macchina a stati che pilota le schermate del gioco
// =============================================================

const App = (() => {
  const STORAGE_KEY = "caccia_stato";
  const appEl = document.getElementById("app");

  const defaultState = {
    started: false,
    stageIndex: 0, // indice in TAPPE
    phase: "route", // 'route' | 'scan' | 'success' | 'final-route' | 'final-scan' | 'final'
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
    // La copertina porta già stampato il titolo, quindi il titolo testuale
    // resta nascosto finché l'immagine si carica. Se manca o non si carica,
    // l'immagine si toglie di mezzo e il testo prende il suo posto: niente
    // riquadro rotto e nessuna schermata senza titolo.
    const hasCover = Boolean(INTRO.coverImage);
    const cover = hasCover
      ? `<img src="${INTRO.coverImage}" class="cover-image"
             alt="${INTRO.title} — ${INTRO.subtitle}"
             onerror="this.style.display='none';
                      document.getElementById('intro-titles').classList.remove('hidden');" />`
      : "";

    appEl.innerHTML = `
      <div class="screen screen-intro">
        ${cover}
        <div id="intro-titles" class="${hasCover ? "hidden" : ""}">
          <h1>${INTRO.title}</h1>
          <p class="subtitle">${INTRO.subtitle}</p>
        </div>
        <p class="lead">${INTRO.lead}</p>
        <p class="hint">${INTRO.hint}</p>
        <button class="btn btn-primary" id="btn-start">${INTRO.startButton}</button>
        ${CONFIG.testMode ? '<p class="test-badge">Modalità TEST attiva</p>' : ""}
      </div>
    `;
    document.getElementById("btn-start").addEventListener("click", onStart);
  }

  async function onStart() {
    // Richiesta "calda" del permesso di posizione, così viene concesso
    // subito. Non blocchiamo mai il gioco se viene negato.
    appEl.innerHTML = `<div class="screen screen-loading"><div class="spinner"></div>
      <p>La signora Fletcher prepara il taccuino…</p></div>`;
    await Geo.requestPermissionEarly();
    setState({ started: true, stageIndex: 0, phase: "route", attempts: 0 });
  }

  function screenRoute(tappa, isFinal) {
    const images = (isFinal ? FINALE.routeImages : tappa.routeImages) || [];
    const title = isFinal ? FINALE.routeTitle : tappa.title;
    const clue = isFinal ? FINALE.routeClue : tappa.clue;

    appEl.innerHTML = `
      <div class="screen screen-route">
        <h2>${title}</h2>
        <p class="clue">${clue}</p>
        <div class="route-images">
          ${images.map((src) => `<img src="${src}" alt="Percorso" class="route-img" />`).join("")}
        </div>
        <button class="btn btn-primary" id="btn-arrived">
          ${isFinal ? "Sono sul posto" : "Sono sul posto, raccolgo la prova"}
        </button>
      </div>
    `;
    document.getElementById("btn-arrived").addEventListener("click", () => {
      if (isFinal) {
        setState({ phase: "final-scan", attempts: 0, scanEnteredAt: Date.now() });
      } else {
        setState({ phase: "scan", attempts: 0, scanEnteredAt: Date.now() });
      }
    });
  }

  // Schermata di scansione generica, condivisa dalle tappe 1-3 e dallo
  // scan finale davanti al negozio: stessa dinamica (fotocamera, reticolo,
  // check GPS soft, euristica di plausibilità, fallback "aiuto"), diverso
  // solo il contenuto (title/targetLabel/targetHint/gps) e cosa succede
  // dopo lo sblocco (onSuccess).
  async function renderScanScreen(item, onSuccess) {
    appEl.innerHTML = `
      <div class="screen screen-scan">
        <h2>${item.title}</h2>
        <p class="target-label">${item.targetLabel}</p>
        <p class="target-hint">${item.targetHint}</p>
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
        <img id="hint-image" class="hint-image hidden" alt="Suggerimento" />
        <button class="btn btn-primary" id="btn-shoot">Fotografa la prova</button>
        <p id="help-link" class="help-link hidden">
          <a href="#" id="link-help">La signora Fletcher ti passa la soluzione →</a>
        </p>
      </div>
    `;

    const video = document.getElementById("camera-video");
    const feedback = document.getElementById("scan-feedback");
    const hintImage = document.getElementById("hint-image");
    const btnShoot = document.getElementById("btn-shoot");
    const helpLink = document.getElementById("help-link");

    const advance = () => {
      clearTimeout(helpTimer);
      Camera.stop();
      onSuccess();
    };

    document.getElementById("link-help").addEventListener("click", (e) => {
      e.preventDefault();
      advance();
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
      feedback.textContent = "La signora Fletcher esamina la prova…";
      hintImage.classList.add("hidden");

      // piccola pausa per dare la sensazione di un'analisi reale
      await new Promise((r) => setTimeout(r, 1400));

      const plausibility = Camera.capturePlausibility();
      const geoResult = await Geo.checkTappaLocation(item);
      const success = plausibility.plausible && geoResult.ok;

      if (success) {
        feedback.classList.remove("error");
        feedback.textContent = "Prova confermata! ✓";
        setTimeout(() => advance(), 500);
      } else {
        state.attempts += 1;
        feedback.textContent =
          "Sei proprio sicura? La signora Fletcher forse ti consiglierebbe di cercare questo: ";
        feedback.classList.add("error");
        if (item.hintImage) {
          hintImage.src = item.hintImage;
          hintImage.classList.remove("hidden");
        }
        btnShoot.disabled = false;
        if (state.attempts >= 2) {
          helpLink.classList.remove("hidden");
        }
      }
    });
  }

  function screenScan(tappa) {
    renderScanScreen(tappa, () => setState({ phase: "success" }));
  }

  function screenFinalScan() {
    renderScanScreen(FINALE, () => setState({ phase: "final" }));
  }

  function screenSuccess(tappa) {
    const next = state.stageIndex + 1;
    const isLastTappa = next >= TAPPE.length;

    appEl.innerHTML = `
      <div class="screen screen-success">
        <div class="success-check">&#10003;</div>
        <h2>Prova archiviata</h2>
        <p class="case-label">${tappa.title}</p>
        <p class="lead">«Ottimo lavoro, mia cara.» La signora Fletcher annota tutto sul
          taccuino e ti fa cenno di proseguire.</p>
        <button class="btn btn-primary" id="btn-continue">
          ${isLastTappa ? "Vai alla soluzione" : "Prossimo indizio"}
        </button>
      </div>
    `;
    document.getElementById("btn-continue").addEventListener("click", () => {
      if (isLastTappa) {
        setState({ stageIndex: TAPPE.length, phase: "final-route" });
      } else {
        setState({ stageIndex: next, phase: "route" });
      }
    });
  }

  function screenFinal() {
    appEl.innerHTML = `
      <div class="screen screen-final">
        <div class="intro-heart">&#10084;</div>
        <h1>${FINALE.revealTitle}</h1>
        <p class="lead">${FINALE.revealMessage}</p>
        ${FINALE.revealSignature ? `<p class="signature">${FINALE.revealSignature}</p>` : ""}
      </div>
    `;
  }

  // -----------------------------------------------------------
  // Render principale
  // -----------------------------------------------------------

  function render() {
    // se usciamo da una schermata di scan, assicuriamoci che la
    // fotocamera venga sempre rilasciata
    if (state.phase !== "scan" && state.phase !== "final-scan") {
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
      if (state.phase === "final-scan") screenFinalScan();
      else if (state.phase === "final") screenFinal();
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
