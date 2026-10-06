# Bon de reprise EuroMed — version graphique Bon de livraison

Cette version reprend l’interface graphique du Bon de livraison EuroMed.

## Envoi
Le Bon de reprise utilise son propre Apps Script indépendant. Remplacez `APPS_SCRIPT_URL` dans `config.js` par l’URL `/exec` du nouveau déploiement.

L’envoi utilise un formulaire vers une iframe afin d’éviter les problèmes CORS de Google Apps Script. Le bouton affiche `✓ Envoyé` après le retour de l’iframe (avec un filet de sécurité de 8 secondes).

## Apps Script
Copiez `Code.gs` dans un projet Apps Script séparé, déployé comme application Web : exécuter en tant que vous-même, accès public/Anyone.
