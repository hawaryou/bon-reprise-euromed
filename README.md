# Bon de reprise EuroMed — Apps Script indépendant

Cette version du Bon de reprise est totalement indépendante du Bon de livraison.

## 1. Google Apps Script

Créer un **nouveau projet Google Apps Script** uniquement pour le Bon de reprise.

Copier le contenu de `Code.gs` dans ce nouveau projet.

Déployer :
- Déployer → Nouveau déploiement
- Type : Application Web
- Exécuter en tant que : **Moi**
- Qui a accès : **Tout le monde**
- Copier l'URL qui se termine par `/exec`

## 2. config.js

Remplacer :

`COLLE_ICI_L_URL_DU_NOUVEAU_APPS_SCRIPT_REPRISE`

par l'URL `/exec` du nouveau projet.

**Ne pas utiliser l'URL du Bon de livraison.**

## 3. Envoi

Le Bon de reprise utilise un formulaire HTML vers une iframe invisible, puis Google Apps Script renvoie une confirmation par `postMessage` après l'envoi réel des e-mails.

Le bouton affiche :

`Envoi en cours…`

puis, uniquement après confirmation du serveur :

`✓ Envoyé`

Le Bon de livraison n'est pas concerné par ce projet et conserve son propre Apps Script.
