// 📜 Script Discord.js v14 — Eden Core avec détection précise des rôles et renommage de ticket

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN; // Token sécurisé injecté par Railway

client.once('ready', () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.toLowerCase().startsWith('!claim')) return;

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
});

setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 30 * 60 * 1000); // toutes les 30 minutes pour vérifier que tout roule

client.login(TOKEN);

const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Eden Core est en éveil."));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Faux serveur HTTP lancé pour Render");
});

