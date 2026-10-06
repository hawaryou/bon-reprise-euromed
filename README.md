# Bon de reprise EuroMed — Apps Script indépendant

Cette version est totalement indépendante du Bon de livraison.

## 1. Apps Script
1. Créez un nouveau projet Google Apps Script.
2. Copiez le contenu de `Code.gs`.
3. Déployez-le comme **Application Web**.
4. Exécuter en tant que : **Moi**.
5. Qui a accès : **Toute personne disposant du lien / Anyone**.
6. Copiez l’URL qui se termine par `/exec`.

## 2. GitHub
Dans `config.js`, remplacez `COLLE_ICI_TON_URL_GOOGLE_APPS_SCRIPT_REPRISE_EXEC` par cette URL `/exec`.

## 3. Envoi
Le formulaire utilise un POST HTML vers une iframe invisible : il n’utilise pas `fetch`, afin d’éviter les problèmes CORS/redirection de Google Apps Script. Le script renvoie ensuite un accusé par `postMessage`. Le bouton devient **✓ Envoyé** uniquement après confirmation du serveur.

Le Bon de livraison conserve son propre Apps Script et n’est pas modifié.
