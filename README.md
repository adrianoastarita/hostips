# Come funziona?

1. Vai su "render.com" e fai il manual deploy di "hostips_app"

2. Assicurati che il backendurl nel file "app.json" (sezione "extra") sia "https://hostips-app.onrender.com"

3. Sul terminale di codescape fai partire il frontend: "npx expo start --tunnel"

4. Inquadra il QRcode che è uscito sul terminale del frontend con la fotocamere del cellulare

5. Apri l'applicazione Expo sul tuo smartphone


----- ALTERNATIVA (full codespace, senza render) -------

1. Apri un secondo teminale (clicca sul "+" in alto a destra nel frame con il terminale)

2. Su un terminale portati nella cartella backend "cd backend"

3. A questo punto fai partire il backend: "node server.js"

4. Trasforma la visibilità della PORTA in "Public"

5. Controlla che la PORTA del backend sia coerente con il backendurl che trovi nel file "app.json" (sezione "extra")

6. Sull'altro terminale fai partire il frontend: "npx expo start --tunnel"

7. Inquadra il QRcode che è uscito sul terminale del frontend con la fotocamere del cellulare

8. Apri l'applicazione Expo sul tuo smartphone


TOKEN per clonare la cartella. "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"
