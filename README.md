# La Signora in Giallo ad Otranto — Web App d'Anniversario

Web app (PWA) mobile: una caccia al tesoro a tema giallo — «Il mistero del regalo
scomparso» — in cui la signora Fletcher accompagna la protagonista di indizio in
indizio per le vie di Otranto. Percorso:
Indizio n. 1 (senza mappa) → Porta a Terra → mappa → Indizio n. 2 (Monumento
eroi e martiri 1480) → mappa → Indizio n. 3 (lampione sul Lungomare degli Eroi) →
mappa → Indizio n. 4 (Cattedrale) → mappa → traguardo finale, il negozio Aromisia con il regalo.

Ad ogni tappa si "inquadra" un dettaglio della strada con la fotocamera per sbloccare la
successiva.

Nessun build tool: HTML/CSS/JS puro, pubblicato su GitHub Pages tramite il workflow in
`.github/workflows/pages.yml`.

## Come funziona lo sblocco delle tappe

Non c'è vero riconoscimento immagine via intelligenza artificiale (sarebbe fragile
proprio nel momento che conta di più). Lo sblocco si basa su:

1. **GPS "soft"** — se il telefono è entro un certo raggio dalle coordinate reali della
   tappa (**60 metri**), la posizione è considerata confermata. Il valore è un
   compromesso: le tappe reali distano tra loro 63, 87, 112 e 105 metri, quindi 60 m
   assorbe l'errore GPS del centro storico restando sotto i 63 m che separano le prime
   due tappe (con 80 m si sovrapponevano e il controllo non verificava più lo
   spostamento). Fra tappa 1 e 2 il margine è però di soli 3 m: lì il controllo è di
   fatto simbolico. Il controllo **non blocca mai** il gioco: se il permesso
   è negato o il segnale è impreciso, resta comunque possibile sbloccare tramite il
   fallback di aiuto — o passare al piano B qui sotto.
2. **Euristica sull'inquadratura** (`js/camera.js`) — verifica solo che la fotocamera stia
   inquadrando *qualcosa* (non uno schermo nero o un dito sull'obiettivo), per rinforzare
   la sensazione di scatto/riconoscimento senza vero object detection.
3. **Messaggio + foto di aiuto sul fallimento** — se lo scan non va a buon fine, compare
   "Sei proprio sicura? La signora Fletcher forse ti consiglierebbe di cercare questo:"
   insieme a una foto di riferimento dell'elemento (campo `hintImage` di ogni tappa).
4. **Fallback "hai bisogno di aiuto?"** — dopo un paio di tentativi o 20 secondi sulla
   schermata di scatto, compare sempre un link che sblocca comunque la tappa. Serve da
   rete di sicurezza per non rovinare la sorpresa in caso di imprevisti dal vivo.

## Contenuti — `js/data.js`

Tutto il contenuto del gioco vive in **`js/data.js`**, l'unico file da modificare.

Le coordinate GPS di tutte le tappe e del negozio finale sono già quelle **reali**
(`CONFIG.testMode = false`). Sono già stati caricati anche:

1. **Screenshot dei percorsi** (`routeImages` di ogni tappa e di `FINALE`) — le 4 mappe
   reali in `assets/images/tratto-*.png` (i tratti dopo la Tappa 1, che invece non ha
   mappa: va trovata solo con l'indovinello iniziale).
2. **Foto di riferimento** (`hintImage` di ogni tappa e di `FINALE`) — foto reali in
   `assets/images/tappa1..5-riferimento.png` (`tappa5` = il traguardo). Compaiono
   **solo** quando uno scan fallisce, come aiuto — non vengono mai mostrate prima.
3. I testi degli indizi (`clue`) sono già stati inseriti e leggermente corretti
   (punteggiatura/refusi) rispetto alle bozze fornite: rileggili e adattali se qualcosa
   non suona giusto.
4. **Copertina** (`INTRO.coverImage`) — attualmente un segnaposto a tema in
   `assets/images/copertina.png`: va sostituito con la locandina reale (stesso nome
   file). Se l'immagine manca o non si carica, la schermata di apertura mostra
   automaticamente titolo e sottotitolo come testo, quindi non resta mai vuota.

## Piano B — la versione senza GPS

Se sul posto il GPS non collabora (vicoli stretti, permesso negato, segnale ballerino),
esiste un secondo indirizzo che fa girare **la stessa identica app** — stessi testi,
stesse immagini, stesso avanzamento già salvato — con il solo controllo GPS disattivato:

```
https://<utente>.github.io/<repo>/senza-gps/
```

Cosa succede aprendolo:

- reindirizza a `index.html?nogps=1`, quindi **non è una copia** del gioco: nessun rischio
  che le due versioni vadano fuori sincrono;
- la partita **riprende dalla tappa in corso**, perché l'avanzamento è salvato per
  dominio, non per indirizzo: si può passare al piano B a metà caccia senza perdere nulla;
- la scelta viene **ricordata sul telefono**, quindi regge a un ricaricamento o alla
  riapertura dell'app;
- sulla schermata di apertura compare un piccolo avviso «Controllo GPS disattivato», utile
  per verificare a colpo d'occhio che sia attivo. A gioco iniziato non si vede.

Per tornare al comportamento normale basta aprire la pagina con `?gps`
(`.../index.html?gps`), oppure lanciare `App.resetGame()` dalla console.

Vale la pena tenere questo indirizzo già pronto sul proprio telefono prima di partire.

**Nota**: `CONFIG.skipGpsCheck` in `js/data.js` è l'interruttore permanente equivalente.
Va lasciato a `false` (controllo GPS attivo): per le prove da casa conviene usare
`?nogps=1`, che ottiene lo stesso risultato senza toccare il codice.

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
senza-gps/index.html     piano B: apre l'app con il controllo GPS disattivato
css/style.css            tema visivo
js/data.js               CONTENUTI del gioco (indizi, GPS, immagini) — file da editare
js/geo.js                geolocalizzazione, calcolo distanza
js/camera.js             gestione fotocamera ed euristica sull'inquadratura
js/app.js                macchina a stati che pilota le schermate
manifest.webmanifest     manifest PWA ("aggiungi a schermata Home")
sw.js                    service worker per funzionare anche con connessione scarsa
.github/workflows/pages.yml   deploy automatico su GitHub Pages ad ogni push
assets/images/           copertina, mappe dei percorsi e foto di riferimento
assets/icons/            icone della PWA
```

## Possibili estensioni future

- Salvare gli scatti fatti durante il gioco per un "album ricordo" finale
  (fattibile con `canvas.toDataURL()`).
- Mappa interattiva integrata al posto degli screenshot statici.
