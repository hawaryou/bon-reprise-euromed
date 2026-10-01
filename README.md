# Bon de reprise EuroMed

Application web statique destinée à GitHub Pages.

## Installation

1. Décompresser le ZIP.
2. Créer un dépôt GitHub, par exemple `bon-de-reprise-euromed`.
3. Mettre `index.html`, `style.css`, `app.js` et `config.js` à la racine du dépôt.
4. Dans GitHub : **Settings → Pages → Deploy from branch → main / root**.
5. Ouvrir l'URL GitHub Pages.

## Fonctionnalités

- Interface responsive iPhone / ordinateur.
- Bouton Menu vers le HUB EuroMed.
- Numéro de bon automatique par jour.
- Patient / client.
- Ajout de plusieurs matériels.
- N° de série / lot.
- État du matériel.
- Accessoires repris.
- Motif de reprise.
- Observations.
- Déclaration d'anomalie.
- Photos prises avec le téléphone.
- Double signature tactile.
- Attestation obligatoire.
- Génération et téléchargement PDF.
- Impression.
- Préparation pour envoi via Google Apps Script.

## Google Apps Script

Dans `config.js`, renseigner :

`APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec"`

Le projet envoie alors les données JSON et le PDF encodé en base64 à cette URL.

Le script Apps Script doit accepter une requête POST et traiter notamment :
- `numero`
- `date`
- `patient`
- `materiels`
- `motif`
- `observations`
- `anomalie`
- `signatures`
- `pdfBase64`
- `filename`

Les photos sont actuellement prévisualisées dans le navigateur. Pour les joindre automatiquement au mail, le Google Apps Script pourra être complété avec un traitement des images en base64 dans une prochaine étape.
