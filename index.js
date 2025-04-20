// 📜 Eden Core — Bot Discord.js avec commandes !claim, !fermer et !delete

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const express = require("express");
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;

client.once('ready', () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  const member = message.member;
  const channel = message.channel;

  // 🔷 Commande !claim
  if (message.content.toLowerCase().startsWith('!claim')) {
    let emoji = '🎫';
    if (member.roles.cache.some(role => role.name === 'Resp. Admin')) emoji = '🟪';
    else if (member.roles.cache.some(role => role.name === 'Admin')) emoji = '🟠';
    else if (member.roles.cache.some(role => role.name === 'Développeur')) emoji = '🔵';
    else if (member.roles.cache.some(role => role.name === 'Resp. Helpeur')) emoji = '🟩';
    else if (member.roles.cache.some(role => role.name === 'Helpeur')) emoji = '🟢';

    try {
      const oldName = channel.name.replace(/^.+?・/, '');
      await channel.setName(`${emoji}・${oldName}`);

      const messages = await channel.messages.fetch({ limit: 10 });
      const hasAlreadyClaimed = messages.some(msg => msg.content.includes("Ce ticket est désormais sous la responsabilité"));
      if (!hasAlreadyClaimed) {
        await channel.send(`🛡️ *Ce ticket est désormais sous la responsabilité de <@${member.id}>.*`);
      }
    } catch (err) {
      console.error(err);
      message.reply("❌ Impossible de renommer le salon. Vérifie mes permissions.");
    }
    return;
  }

  // 🔒 Commande !fermer (ferme sans supprimer et enlève l'accès à l'auteur)
  if (message.content.toLowerCase().startsWith('!close')) {
    try {
      await message.reply("🔒 *Le ticket est désormais clos. Merci pour votre message.*");
      await channel.send({
        content: "📌 *Ce ticket a été marqué comme résolu. Un membre du staff peut le supprimer avec `!delete`.*"
      });

      const ticketOpener = message.mentions.users.first() || channel.topic?.match(/<@(\d+)>/)?.[1];
      if (ticketOpener) {
        await channel.permissionOverwrites.edit(ticketOpener, {
          ViewChannel: false,
          SendMessages: false,
          ReadMessageHistory: false
        });
      }
    } catch (err) {
      console.error("Erreur lors de la commande !close :", err);
      message.reply("❌ Impossible de marquer ce ticket comme fermé.");
    }
    return;
  }

  // 💀 Commande !delete (supprime le salon sans avertissement)
  if (message.content.toLowerCase().startsWith('!delete')) {
    try {
      await message.reply("⚠️ Suppression immédiate...");
      setTimeout(() => {
        channel.delete().catch(err => {
          console.error("Erreur lors de la suppression du salon :", err);
        });
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la commande !delete :", err);
      message.reply("❌ Impossible de supprimer le salon.");
    }
    return;
  }
});

// 💫 Ping interne pour rester actif
setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 30 * 60 * 1000);

client.login(TOKEN);

app.get("/", (req, res) => {
  console.log("🔁 Ping reçu depuis UptimeRobot");
  res.send("Eden Core est éveillé.");
});

// 🌐 Faux serveur HTTP pour Render
app.get("/", (req, res) => res.send("Eden Core veille..."));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Faux serveur HTTP lancé pour Render");
});

