// 📜 Eden-Core : gestion des tickets en reprenant le message de MEE6 avec ping UptimeRobot et faux serveur HTTP

const { Client, GatewayIntentBits, Events, Partials, PermissionsBitField } = require('discord.js');
const http = require('http');
const express = require('express');
const app = express();
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
});

client.on(Events.ChannelCreate, async (channel) => {
  if (!channel.name || !channel.guild) return;

  try {
    const messages = await channel.messages.fetch({ limit: 10 });
    const edenRPMessage = messages.find(m => m.author.username === 'Eden RP');
    if (edenRPMessage) await edenRPMessage.delete();

    const guild = channel.guild;
    const adminRole = guild.roles.cache.find(role => role.name === 'Admin');
    const respAdminRole = guild.roles.cache.find(role => role.name === 'Resp. Admin');

    let content = '';
    const lowerName = channel.name.toLowerCase();

    if (lowerName.includes('ticket-background') || lowerName.includes('spec')) {
      content = `Ton ticket a été créé. ${adminRole ? `<@&${adminRole.id}>` : ''}${adminRole && respAdminRole ? ' et ' : ''}${respAdminRole ? `<@&${respAdminRole.id}>` : ''} vont prendre en charge ta demande.\nFournis-nous toute information supplémentaire que tu juges utile pour nous aider à répondre plus rapidement.`;
    } else {
      content = `Ton ticket a été créé.\nFournis-nous toute information supplémentaire que tu juges utile pour nous aider à répondre plus rapidement.`;
    }

    await channel.send({
      content,
      allowedMentions: { parse: ['roles'] }
    });
  } catch (err) {
    console.error('❌ Erreur dans la gestion du ticket :', err);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  const member = message.member;
  const channel = message.channel;
  const content = message.content.toLowerCase();

  if (content === '!claim') {
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

  if (content === '!close') {
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

  if (content === '!delete') {
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
