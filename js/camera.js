// =============================================================
// camera.js — Fotocamera, mirino a reticolo, euristica di
// plausibilità dell'inquadratura. NON è vero riconoscimento
// immagine: è pensato per creare l'illusione dello "scatto che
// sblocca la tappa" restando affidabile in un evento dal vivo.
// =============================================================

const Camera = (() => {
  let stream = null;
  let videoEl = null;
  let canvasEl = null;

  async function start(videoElement) {
    videoEl = videoElement;
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    videoEl.srcObject = stream;
    await videoEl.play();
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) videoEl.srcObject = null;
  }

  // Cattura il frame corrente e ne stima la "plausibilità":
  // un'inquadratura completamente uniforme (cielo, terra, tasca,
  // dito sull'obiettivo) ha varianza di luminosità molto bassa.
  // Non identifica l'OGGETTO, solo che la fotocamera sta
  // effettivamente inquadrando una scena con dettagli.
  function capturePlausibility() {
    if (!videoEl || videoEl.readyState < 2) {
      return { plausible: true, variance: null }; // non blocchiamo per errori tecnici
    }
    if (!canvasEl) canvasEl = document.createElement("canvas");
    const w = 64;
    const h = 48;
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(videoEl, 0, 0, w, h);
    let data;
    try {
      data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
      return { plausible: true, variance: null };
    }

    let sum = 0;
    let sumSq = 0;
    const n = w * h;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += lum;
      sumSq += lum * lum;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;

    // Soglia bassa e permissiva: preferiamo qualche falso positivo
    // piuttosto che bloccare la sorpresa per un dettaglio tecnico.
    const plausible = variance > 15;
    return { plausible, variance };
  }

  return { start, stop, capturePlausibility };
})();
