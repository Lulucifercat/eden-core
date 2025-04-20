// 📜 Eden Core — Version sans boutons visibles pour les joueurs

const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Events } = require('discord.js');
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

client.on(Events.ChannelCreate, async (channel) => {
  if (!channel.name.startsWith("ticket")) return;

  try {
    const messages = await channel.messages.fetch({ limit: 5 });
    const edenRPMessage = messages.find(m => m.author.bot && m.author.username === 'Eden RP');
    if (edenRPMessage) await edenRPMessage.delete();

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket ouvert")
      .setDescription(
        "Bienvenue dans ce salon d’assistance.
Un membre du staff prendra en charge votre demande dès que possible."
      )
      .setColor(0x8b0000);

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Erreur dans ChannelCreate:", err);
  }
});

// 🌐 Faux serveur HTTP pour Render
app.get("/", (req, res) => res.send("Eden Core veille..."));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Faux serveur HTTP lancé pour Render");
});

// 💫 Ping interne pour rester actif
setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 30 * 60 * 1000);

client.login(TOKEN);
