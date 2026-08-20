# Caccia al Tesoro — Web App d'Anniversario

Web app (PWA) mobile per guidare qualcuno attraverso una caccia al tesoro a Otranto:
indizio iniziale (senza mappa) → Tappa 1 (Porta a Terra) → mappa → Tappa 2 (Monumento
eroi e martiri 1480) → mappa → Tappa 3 (lampione sul Lungomare degli Eroi) → mappa →
Tappa 4 (Cattedrale) → mappa → traguardo finale, il negozio Aromisia con il regalo.

Ad ogni tappa si "inquadra" un dettaglio della strada con la fotocamera per sbloccare la
successiva.

Nessun build tool: HTML/CSS/JS puro, pubblicato su GitHub Pages tramite il workflow in
`.github/workflows/pages.yml`.

## Come funziona lo sblocco delle tappe

Non c'è vero riconoscimento immagine via intelligenza artificiale (sarebbe fragile
proprio nel momento che conta di più). Lo sblocco si basa su:

1. **GPS "soft"** — se il telefono è entro un certo raggio dalle coordinate reali della
   tappa (attualmente 80 metri, volutamente generoso), la posizione è considerata
   confermata. Il controllo **non blocca mai** il gioco: se il permesso è negato o il
   segnale è impreciso, resta comunque possibile sbloccare tramite il fallback di aiuto.
2. **Euristica sull'inquadratura** (`js/camera.js`) — verifica solo che la fotocamera stia
   inquadrando *qualcosa* (non uno schermo nero o un dito sull'obiettivo), per rinforzare
   la sensazione di scatto/riconoscimento senza vero object detection.
3. **Messaggio + foto di aiuto sul fallimento** — se lo scan non va a buon fine, compare
   "Sei proprio sicura? La signora Flethcher forse ti consiglierebbe di cercare questo:"
   insieme a una foto di riferimento dell'elemento (campo `hintImage` di ogni tappa).
4. **Fallback "hai bisogno di aiuto?"** — dopo un paio di tentativi o 20 secondi sulla
   schermata di scatto, compare sempre un link che sblocca comunque la tappa. Serve da
   rete di sicurezza per non rovinare la sorpresa in caso di imprevisti dal vivo.

## Contenuti — `js/data.js`

Tutto il contenuto del gioco vive in **`js/data.js`**, l'unico file da modificare.

Le coordinate GPS di tutte le tappe e del negozio finale sono già quelle **reali**
(`CONFIG.testMode = false`). Cosa manca ancora, da sostituire quando disponibile:

1. **Screenshot dei percorsi** (`routeImages` di ogni tappa e di `FINALE`) — sono ancora
   placeholder generati automaticamente in `assets/images/tratto-*.png`. Vanno sostituiti
   con i 4 screenshot reali di Google Maps (i tratti dopo la Tappa 1, che invece non ha
   mappa: va trovata solo con l'indovinello iniziale).
2. **Foto di riferimento** (`hintImage` di ogni tappa e di `FINALE`) — sono ancora
   placeholder in `assets/images/tappaN-riferimento.png` / `finale-riferimento.png`.
   Vanno sostituite con le foto reali degli elementi da inquadrare (stesso nome file, o
   cambia i path in `data.js`). Nota: queste foto compaiono **solo** quando uno scan
   fallisce, come aiuto — non vengono mai mostrate prima.
3. I testi degli indizi (`clue`) sono già stati inseriti e leggermente corretti
   (punteggiatura/refusi) rispetto alle bozze fornite: rileggili e adattali se qualcosa
   non suona giusto.

Il nome del negozio finale ("Aromisia") compare **solo** in `FINALE.revealTitle` /
`FINALE.revealMessage`, mostrati esclusivamente dopo lo scan finale riuscito: il resto
del flusso (percorso e scan davanti al negozio) parla solo genericamente di "il
traguardo", per non anticipare la sorpresa.

Per azzerare il progresso salvato durante un test, apri la console del browser e lancia:
```js
App.resetGame()
```

## Test in locale (solo per controllare grafica/logica, senza fotocamera/GPS reali)

```bash
cd /home/user/anniversatio
python3 -m http.server 8080
```
Poi apri `http://localhost:8080` su un browser desktop.

**Attenzione:** fotocamera e geolocalizzazione richiedono un *contesto sicuro* (HTTPS, o
`localhost` sullo stesso dispositivo). Per testare davvero su uno smartphone reale, apri
l'URL pubblicato su GitHub Pages dal telefono.

## Pubblicazione su GitHub Pages

Il deploy è automatico: ogni push sul branch `claude/treasure-hunt-camera-app-u0rsda`
fa scattare il workflow `.github/workflows/pages.yml`, che pubblica il sito in 1-2
minuti su `https://turk162.github.io/anniversatio/`. Nessuna azione manuale necessaria
dopo il primo setup (Settings → Pages → Source: "GitHub Actions").

Da Safari/Chrome mobile si può usare "Aggiungi a schermata Home" per farla comportare
come un'app installata.

## Struttura dei file

```
index.html              shell della SPA
css/style.css            tema visivo
js/data.js               CONTENUTI del gioco (indizi, GPS, immagini) — file da editare
js/geo.js                geolocalizzazione, calcolo distanza
js/camera.js             gestione fotocamera ed euristica sull'inquadratura
js/app.js                macchina a stati che pilota le schermate
manifest.webmanifest     manifest PWA ("aggiungi a schermata Home")
sw.js                    service worker per funzionare anche con connessione scarsa
.github/workflows/pages.yml   deploy automatico su GitHub Pages ad ogni push
assets/images/           screenshot dei percorsi e foto di riferimento (placeholder, da sostituire)
assets/icons/            icone della PWA
```

## Possibili estensioni future

- Salvare gli scatti fatti durante il gioco per un "album ricordo" finale
  (fattibile con `canvas.toDataURL()`).
- Mappa interattiva integrata al posto degli screenshot statici.
