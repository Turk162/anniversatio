# Caccia al Tesoro — Web App d'Anniversario

Web app (PWA) mobile per guidare qualcuno attraverso una caccia al tesoro in 3 tappe:
indizio → percorso → "inquadra" un dettaglio della strada con la fotocamera → nuovo
percorso, fino alla tappa finale (il negozio con il regalo).

Nessun build tool: HTML/CSS/JS puro, pensato per girare su GitHub Pages.

## Come funziona lo sblocco delle tappe

Non c'è vero riconoscimento immagine via intelligenza artificiale (sarebbe fragile
proprio nel momento che conta di più). Lo sblocco si basa su:

1. **GPS "soft"** — se il telefono è entro un certo raggio dalle coordinate della tappa,
   la posizione è considerata confermata. Il controllo **non blocca mai** il gioco: se il
   permesso è negato o il segnale è impreciso, si va comunque avanti.
2. **Euristica sull'inquadratura** (`js/camera.js`) — verifica solo che la fotocamera stia
   inquadrando *qualcosa* (non uno schermo nero o un dito sull'obiettivo), per rinforzare
   la sensazione di scatto/riconoscimento senza vero object detection.
3. **Fallback "hai bisogno di aiuto?"** — dopo un paio di tentativi o 20 secondi sulla
   schermata di scatto, compare sempre un link che sblocca comunque la tappa. Serve da
   rete di sicurezza per non rovinare la sorpresa in caso di imprevisti dal vivo.

## Modalità TEST (adesso) vs contenuti REALI (dopo)

Tutto il contenuto del gioco vive in **`js/data.js`**, l'unico file da modificare.

Al momento `CONFIG.testMode = true` e ogni tappa ha `gps.useCurrentLocationAsTarget: true`:
la prima volta che l'app chiede la posizione per una tappa, usa la posizione attuale del
telefono come bersaglio per quella tappa in quella sessione di gioco. Così puoi testare
**tutto il flusso reale** (permessi, GPS, fotocamera, animazioni, fallback) restando dove ti
trovi ora, senza dover raggiungere i luoghi veri.

Quando potrai raggiungere le location reali:

1. In `js/data.js` metti `CONFIG.testMode = false`.
2. Per ogni tappa, sostituisci
   ```js
   gps: { useCurrentLocationAsTarget: true, radius: 80 }
   ```
   con le coordinate reali, ad esempio:
   ```js
   gps: { lat: 40.1495, lng: 18.4715, radius: 80 }
   ```
   Le coordinate si ottengono da Google Maps: tieni premuto sul punto esatto sulla mappa,
   compare "lat, lng" da copiare. Il raggio è in metri: tienilo generoso (60–100m) perché
   non è stato fatto un sopralluogo fisico e il GPS in centri storici/vicoli può essere
   impreciso.
3. Scrivi i testi reali degli indizi (`clue`, `targetLabel`, `targetHint`).
   Ogni tappa ha anche un campo `hintImage`: è la foto mostrata quando lo
   scan fallisce ("Sei proprio sicura? La signora Flethcher forse ti
   consiglierebbe di cercare questo:") — sostituisci i placeholder in
   `assets/images/` con le foto reali degli elementi da inquadrare.
   Nota: la Tappa 1 ha il raggio GPS a 5 metri solo per un test sul campo —
   riportalo a un valore ampio (60-100m) prima dell'evento vero.
4. Sostituisci le immagini placeholder in `assets/images/` con i veri screenshot dei
   percorsi (stesso nome file, oppure cambia i percorsi in `routeImages`).
5. Compila `FINALE` con il percorso verso il negozio, i testi generici di percorso/scan
   (`routeClue`, `targetHint`) e il messaggio di rivelazione (`revealTitle`,
   `revealMessage`) — questi ultimi sono gli unici punti dove compare il nome del
   negozio: il resto del flusso non lo anticipa mai, nemmeno durante lo scan finale.

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
`localhost` sullo stesso dispositivo). Per testare davvero su uno smartphone reale, il modo
più semplice è pubblicare su GitHub Pages (vedi sotto) e aprire l'URL `https://...` dal
telefono.

## Pubblicazione su GitHub Pages

1. Fai il merge di questo branch su `main` (o apri una Pull Request).
2. Nel repository su GitHub: **Settings → Pages** → sotto "Build and deployment" scegli
   "Deploy from a branch", branch `main`, cartella `/ (root)`.
3. Dopo qualche minuto l'app sarà raggiungibile su
   `https://<utente>.github.io/<repo>/`.
4. Apri quell'URL dal telefono, concedi i permessi di fotocamera e posizione quando
   richiesti, e prova l'intero percorso.
5. Da Safari/Chrome mobile puoi usare "Aggiungi a schermata Home" per farla comportare
   come un'app installata.

## Struttura dei file

```
index.html              shell della SPA
css/style.css            tema visivo
js/data.js               CONTENUTI del gioco (indizi, GPS, immagini) — file da editare
js/geo.js                geolocalizzazione, calcolo distanza, calibrazione modalità test
js/camera.js             gestione fotocamera ed euristica sull'inquadratura
js/app.js                macchina a stati che pilota le schermate
manifest.webmanifest     manifest PWA ("aggiungi a schermata Home")
sw.js                    service worker per funzionare anche con connessione scarsa
assets/images/           screenshot dei percorsi (ora placeholder, da sostituire)
assets/icons/            icone della PWA
```

## Possibili estensioni future

- Salvare gli scatti fatti durante il gioco per un "album ricordo" finale
  (fattibile con `canvas.toDataURL()`).
- Mappa interattiva integrata al posto degli screenshot statici.
