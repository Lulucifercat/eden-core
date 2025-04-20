// 📜 Eden-Core : gestion des tickets sans boutons visibles pour les joueurs

const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
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
  if (!channel.name) return;

  const guild = channel.guild;
  if (!guild) return;

  // Cherche le message du bot Eden RP et le supprime
  try {
    const messages = await channel.messages.fetch({ limit: 10 });
    const targetMessage = messages.find(m => m.author.username === 'Eden RP');
    if (targetMessage) await targetMessage.delete();
  } catch (err) {
    console.error('❌ Erreur lors de la suppression du message Eden RP :', err);
  }

  // Envoie un message de bienvenue
  try {
    await channel.send({
      content: `🎫 **Bienvenue dans ce salon d’assistance.**\nUn membre du staff prendra bientôt en charge votre demande.`,
      allowedMentions: { parse: [] }
    });
  } catch (err) {
    console.error('❌ Erreur lors de l’envoi du message de remplacement :', err);
  }
});

client.login(TOKEN);

// Ping régulier pour garder le bot actif
setInterval(() => {
  console.log("🌙 Eden Core veille toujours dans l'obscurité...");
}, 10 * 60 * 1000);
