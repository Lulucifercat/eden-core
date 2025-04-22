# Eden Core

Eden Core est un bot Discord personnalisé pour la gestion avancée des tickets dans un serveur RedM immersif et narratif, basé sur le projet EDEN RP. Ce bot permet une création de tickets contextuelle via des embeds, des systèmes de notification automatiques, et des commandes staff pour la modération efficace des demandes.

# Fonctionnalités principales

✨ Envoi automatique d'embeds de création de tickets dans les salons dédiés : spec, background, problématique, dev, helpeur, mj, autres.
✨ Boutons interactifs pour créer un ticket privé selon le type de demande.
✨ Création automatique de salons dans les bonnes catégories Discord (Admin, Dev, MJ, Helpeur...).
✨ Ping automatique des rôles concernés selon le type de ticket.
✨ Synchronisation des permissions personnalisées avec la catégorie pour les tickets dev.
✨ “!claim” : Permet à un staff de se déclarer responsable du ticket (renommage du salon avec emoji).
✨ “!close” : Ferme le ticket (retire l’accès au joueur).
✨ “!delete” : Supprime le salon après 2 secondes.
✨ Log de tous les tickets dans un salon défini (LOG_CHANNEL_ID).

# Technologies
- Node.js
- Discord.js v14
- Express.js pour le ping UptimeRobot (Render)

# Déploiement
- Créez un bot via le portail des applications Discord.
- - Cloner ce repo dans Render, Railway, ou localement.

# Créez un fichier .env avec :
- TOKEN=your_discord_bot_token
- PORT=3000

# Lancer avec : 
- node index.js

Le bot pingera toutes les 30 minutes pour rester actif.

# Structure des fichiers
- index.js : Fichier principal contenant toute la logique de gestion de tickets et les commandes.
- public/ : (Facultatif) pour héberger un visuel si nécessaire

# Personnalisation
- Modifier les IDs des salons, catégories, et rôles directement dans les objets ticketChannels, ticketCategories, roleMentions.
- Les textes d’embeds sont définis dans embedData.

# Exemple d'utilisation

Un joueur clique sur “Ticket MJ” dans le salon #🎭-ticket-mj. Le bot crée un salon privé dans la catégorie MJ. Il ping le rôle MJ, envoie un message de bienvenue, et loggue la création.

# Créateurs
• Conception : @Lucifer
• Dev bot : Eden Core
