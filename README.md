# Bon de reprise — EuroMed

Version basée sur le **Bon de livraison EuroMed** de référence.

## Mise en ligne GitHub Pages
1. Déposer tous les fichiers à la racine du dépôt GitHub.
2. Activer GitHub Pages sur la branche `main` / dossier racine.
3. Conserver `config.js` avec l'URL Apps Script déjà utilisée par le carnet de livraison.

## Envoi e-mail
Le `Code.gs` reprend le fonctionnement du carnet de livraison et conserve l'action `send_delivery`. Il ajoute l'action `send_reprise` pour le bon de reprise.

Le même déploiement Google Apps Script peut donc servir aux deux applications après redéploiement de la nouvelle version de `Code.gs`.


## Écran d’envoi harmonisé
Le Bon de livraison et le Bon de reprise utilisent le même écran d’envoi, le même envoi par formulaire vers Google Apps Script et le même retour **✓ Envoyé** après confirmation serveur.
