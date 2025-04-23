# Eden Core

Eden Core est un bot Discord développé pour le serveur **EDEN RP**, conçu pour remplacer MEE6 dans la gestion des tickets de support et staff, avec des fonctionnalités immersives, propres à l’univers narratif du serveur.


## Fonctionnalités principales

-  **Envoi automatique d'embeds de création de tickets dans les salons dédiés** : spec, background, problématique, dev, helpeur, mj, autres.
-  **Boutons interactifs** pour créer un ticket privé selon le type de demande.
-  **Création automatique de salons** dans les bonnes catégories Discord (Admin, Dev, MJ, Helpeur...).
-  **Ping automatique des rôles concernés** selon le type de ticket.
-  **Synchronisation des permissions personnalisées avec la catégorie** pour les tickets dev.
-  Commandes staff :
  - `!claim` ➜ Marque le ticket comme pris en charge (renommage du salon avec emoji).
  - `!close` ➜ Ferme le ticket (retire l’accès au joueur).
  - `!delete` ➜ Supprime le salon après 2 secondes.
-  **Log de tous les tickets** dans un salon défini (`LOG_CHANNEL_ID`).
-  **Ping automatique** toutes les 30 minutes pour rester actif avec UptimeRobot.
-  Faux serveur HTTP intégré pour Render.

## Organisation des catégories

- `ticket-spec`, `ticket-background`, `ticket-problématique` → **catégorie Admin**
- `ticket-dev` → **catégorie Dev**
- `ticket-helpeur`, `ticket-autres` → **catégorie Helpeur**
- `ticket-mj` → **catégorie MJ**

## Technologies
- Node.js
- Discord.js v14
- Express.js pour le ping UptimeRobot (Render)

## Déploiement
- Créez un bot via le portail des applications Discord.
- Cloner ce repo dans Render, Railway, ou localement.

## Créez un fichier .env avec :
- TOKEN=your_discord_bot_token
- PORT=3000

## Lancer avec : 
- node index.js

Le bot pingera toutes les 30 minutes pour rester actif.

## Structure des fichiers
- index.js : Fichier principal contenant toute la logique de gestion de tickets et les commandes.
- public/ : (Facultatif) pour héberger un visuel si nécessaire

## Personnalisation
- Modifier les IDs des salons, catégories, et rôles directement dans les objets ticketChannels, ticketCategories, roleMentions.
- Les textes d’embeds sont définis dans embedData.

## Exemple d'utilisation
Un joueur clique sur “Ticket MJ” dans le salon #🎭-ticket-mj. Le bot crée un salon privé dans la catégorie MJ. Il ping le rôle MJ, envoie un message de bienvenue, et loggue la création.

## Prochaines améliorations
- Ajout d'un système de tags dans les tickets
- Panneau admin pour gérer les logs
- Mémoire des tickets récents

## Développé pour : EDEN RP
Un serveur RedM RP narratif, immersif, organisé par saisons, avec des valeurs de respect, d’égalité, et de narration collaborative.

# Créateurs
• Conception : @Lucifer
• Dev bot : Eden Core
