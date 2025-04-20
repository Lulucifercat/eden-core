// 📜 Eden Core - Gestionnaire de tickets avec suppression des messages de MEE6

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;
const MEE6_BOT_NAME = "Eden RP"; // Nom du bot MEE6 tel qu'affiché dans le serveur

client.once('ready', () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot && message.author.username === MEE6_BOT_NAME) {
    const ticketCategory = message.channel.parent;

    // Si le nom du salon correspond à un pseudo (donc un ticket), on supprime
    if (ticketCategory || message.channel.name) {
      try {
        await message.delete();
        console.log(`🧹 Message de ${MEE6_BOT_NAME} supprimé dans #${message.channel.name}`);
      } catch (err) {
        console.error(`❌ Erreur lors de la suppression du message :`, err);
      }
    }
    return;
  }

  // Commande !claim
  if (message.content.toLowerCase().startsWith('!claim')) {
    const member = message.member;
    const channel = message.channel;

    // Détection stricte des rôles par nom exact
    let emoji = '🎫';
    if (member.roles.cache.some(role => role.name === 'Resp. Admin')) emoji = '🟪';
    else if (member.roles.cache.some(role => role.name === 'Admin')) emoji = '🟠';
    else if (member.roles.cache.some(role => role.name === 'Développeur')) emoji = '🔵';
    else if (member.roles.cache.some(role => role.name === 'Resp. Helpeur')) emoji = '🟩';
    else if (member.roles.cache.some(role => role.name === 'Helpeur')) emoji = '🟢';

    try {
      const oldName = channel.name.replace(/^.+?・/, '');
      await channel.setName(`${emoji}・${oldName}`);
      await channel.send(`🛡️ *Ce ticket est désormais sous la responsabilité de <@${member.id}>.*`);
    } catch (err) {
      console.error(err);
      message.reply("❌ Impossible de renommer le salon. Vérifie mes permissions.");
    }
    return;
  }

  // Commande !fermer
  if (message.content.toLowerCase().startsWith('!fermer')) {
    const channel = message.channel;

    try {
      // On récupère les permissions actuelles
      const everyoneRole = message.guild.roles.everyone;
      const overwrites = channel.permissionOverwrites.cache;

      overwrites.forEach(async (overwrite) => {
        if (overwrite.type === 1) { // 1 = membre
          await channel.permissionOverwrites.edit(overwrite.id, {
            ViewChannel: false,
            SendMessages: false
          });
        }
      });

      await channel.send(`🔒 *Ce ticket est maintenant fermé. Seul le staff peut encore voir ce salon.*`);
    } catch (err) {
      console.error("Erreur lors de la fermeture du ticket :", err);
      message.reply("❌ Une erreur est survenue lors de la fermeture du ticket.");
    }
  }
});

// Ping régulier pour rester actif
setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 10 * 60 * 1000); // toutes les 10 minutes

client.login(TOKEN);
