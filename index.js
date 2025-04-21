// 📜 Eden-Core : gestion des tickets avec commandes !claim, !close, !delete, ping UptimeRobot et faux serveur HTTP

const { Client, GatewayIntentBits, Events, Partials, PermissionsBitField } = require('discord.js');
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

// ID du salon de logs où les tickets seront enregistrés
const LOG_CHANNEL_ID = '1363845483533176883';

// ID des salons où les boutons d'ouverture de ticket sont affichés.
// Chaque salon correspond à un type spécifique de demande (spec, background, dev, etc.)
// Eden Core enverra un embed dans chacun de ces salons avec un bouton pour créer un ticket.
const ticketChannels = {
  'spec': '1360714073897177301',
  'background': '1360713975544680710',
  'problématique': '1360713882318012486',
  'dev': '1360714141047980042',
  'helpeur': '1360299478921252875',
  'autres': '1360721481633632448',
  'mj': '1360713808196276244'
};

// ID des catégories Discord dans lesquelles seront automatiquement créés les salons de tickets selon leur type sélectionné par l'utilisateur.
// Ces catégories permettent de classer les tickets (Admin, Dev, Helpeur, MJ, etc.) pour une meilleure organisation.
const ticketCategories = {
  'spec': '1362898038774829136',
  'background': '1362898038774829136',
  'problématique': '1362898038774829136',
  'dev': '1360719242529607710',
  'helpeur': '1360717411460055080',
  'autres': '1360717411460055080',
  'mj': '1360717707145908284'
};

// 👥 Rôles à ping automatiquement selon le type de ticket
const roleMentions = {
  'spec': ['<@&ID_ADMIN>', '<@&ID_RESPADMIN>'],
  'background': ['<@&ID_ADMIN>', '<@&ID_RESPADMIN>'],
  'problématique': ['<@&ID_ADMIN>', '<@&ID_RESPADMIN>'],
  'dev': ['<@&ID_DEV>'],
  'helpeur': ['<@&ID_HELPER>'],
  'autres': ['<@&ID_HELPER>'],
  'mj': ['<@&ID_MJ>']
};

// Message indiquant que le bot est bien connecté
client.once(Events.ClientReady, () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
});


// Fonction d'initialisation des embeds avec bouton pour chaque salon prévu
async function setupEmbeds() {
  for (const [type, channelId] of Object.entries(ticketChannels)) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) continue;

      // 🔄 Vérifie si un message avec bouton existe déjà pour éviter les doublons à chaque redémarrage
      const existingMessages = await channel.messages.fetch({ limit: 10 });
      const existing = existingMessages.find(m => m.author.id === client.user.id && m.components.length > 0);
      if (existing) continue;

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Créer un ticket : ${type.charAt(0).toUpperCase() + type.slice(1)}`)
        .setDescription("Clique sur le bouton ci-dessous pour créer un ticket concernant ce sujet.")
        .setColor(0x3498db);

      const button = new ButtonBuilder()
        .setCustomId(`create_${type}`)
        .setLabel("Ouvrir un ticket")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);
      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(`Erreur lors de l'envoi de l'embed dans ${type} :`, err);
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Eden Core connecté en tant que ${client.user.tag}`);
  await setupEmbeds();
});


// 🎯 Ce bloc gère la création d'un ticket lorsqu’un utilisateur clique sur un bouton d’embed.
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  const [action, type] = interaction.customId.split('_');

  if (action !== 'create' || !ticketCategories[type]) return;

  const categoryId = ticketCategories[type];
  const user = interaction.user;
  const guild = interaction.guild;
  
 try {
    // 🧵 Crée un salon de ticket avec permissions personnalisées
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: `Ticket de ${user.id}`,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
        }
      ]
    });

     // ✉️ Message d'accueil personnalisé dans le salon
    let content = `Bonjour <@${user.id}>, ton ticket a été créé.`;
    if (roleMentions[type]) {
      content += ` ${roleMentions[type].join(' ')} a été notifié.`;
    }
    content += "\nMerci de nous fournir les détails nécessaires pour que nous puissions t’aider efficacement.";

    await ticketChannel.send({ content });

    // 📝 Enregistre la création du ticket dans le salon de logs
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({ content: `📥 Ticket créé : <#${ticketChannel.id}> par <@${user.id}> dans la catégorie ${type}` });
    }

    // ✅ Réponse éphémère à l'utilisateur
    await interaction.reply({ content: `✅ Ticket créé : <#${ticketChannel.id}>`, ephemeral: true });
  } catch (err) {
    console.error("Erreur lors de la création du ticket :", err);
    await interaction.reply({ content: "❌ Une erreur est survenue lors de la création du ticket.", ephemeral: true });
  }
});



  // Partie Staff pour prendre en charge les tickets
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
      await channel.send("📌 *Ce ticket a été marqué comme résolu. Un membre du staff peut le supprimer avec `!delete`.*");

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
